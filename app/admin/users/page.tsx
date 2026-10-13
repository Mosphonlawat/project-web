"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role?.trim().toUpperCase() !== "ADMIN") {
      router.push("/");
      return;
    }

    setCurrentUserId(parsedUser.userId);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/users", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 403) {
        alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    // ป้องกันการกดแก้คนแรก
    if (userId === 1) {
      alert("ไม่สามารถแก้ไขสิทธิ์ของผู้ดูแลระบบคนแรกได้");
      return;
    }

    setUpdatingId(userId);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:8080/api/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        alert("แก้ไขสิทธิ์เรียบร้อยแล้ว!");

        // อัปเดตตารางหน้าร้าน
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.userId === userId ? { ...u, role: newRole } : u,
          ),
        );

        // 🌟 อัปเดต Token แบบเรียลไทม์ หากคนที่ถูกแก้คือบัญชีที่กำลังล็อกอินอยู่
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const currentUser = JSON.parse(storedUser);
          if (currentUser.userId === userId) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (newRole.toUpperCase() !== "ADMIN") {
              alert(
                "สิทธิ์ของคุณเปลี่ยนเป็น USER แล้ว ระบบจะนำคุณออกจากหน้า Admin",
              );
              router.push("/");
              return;
            }
          }
        }
      } else {
        const errorMsg = await res.text();
        alert(errorMsg || "ไม่สามารถเปลี่ยนสิทธิ์ได้");
        fetchUsers();
      }
    } catch (err) {
      console.error("Error updating role:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center tracking-widest text-gray-500">
        LOADING...
      </div>
    );

  const isSuperAdmin = currentUserId === 1;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-8 pb-12 flex flex-col md:flex-row gap-8">
      <Sidebar />

      <main className="flex-1 bg-white border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="flex justify-between items-end mb-10 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-light tracking-widest text-gray-900 mb-2 uppercase">
              Users
            </h1>
            <p className="text-gray-500 font-light">
              Manage user accounts and roles.
            </p>
          </div>
          {isSuperAdmin && (
            <span className="text-xs bg-black text-white px-3 py-1 font-mono uppercase tracking-widest">
              SUPER ADMIN ACCESS
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  ID
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Email
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Name
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Role
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => {
                  const isFirstUser = user.userId === 1;
                  // คนแรกห้ามแก้เด็ดขาด, คนอื่นจะแก้ได้ก็ต่อเมื่อคนที่ล็อกอินอยู่คือ Super Admin (ID 1)
                  const canEdit =
                    isSuperAdmin && !isFirstUser && updatingId !== user.userId;

                  return (
                    <tr
                      key={user.userId}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-4 px-4 font-mono text-sm text-gray-500">
                        #{user.userId}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {user.email}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={user.role}
                          disabled={!canEdit}
                          onChange={(e) =>
                            handleRoleChange(user.userId, e.target.value)
                          }
                          className={`text-xs py-1.5 px-3 border uppercase tracking-wider transition focus:outline-none ${
                            !canEdit
                              ? "bg-neutral-100 text-neutral-800 border-neutral-300 font-medium cursor-not-allowed opacity-90"
                              : user.role === "ADMIN"
                                ? "bg-black text-white border-black font-medium cursor-pointer hover:bg-neutral-800"
                                : "bg-white text-neutral-800 border-gray-300 cursor-pointer hover:border-black"
                          }`}
                        >
                          <option value="USER" className="bg-white text-black">
                            USER
                          </option>
                          <option value="ADMIN" className="bg-white text-black">
                            ADMIN
                          </option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isFirstUser ? (
                          <span className="text-xs uppercase tracking-wider text-purple-700 font-semibold">
                            Super Admin
                          </span>
                        ) : updatingId === user.userId ? (
                          <span className="text-xs uppercase tracking-wider text-gray-400 font-light">
                            Updating...
                          </span>
                        ) : (
                          <span className="text-xs uppercase tracking-wider text-emerald-600 font-light">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-gray-400 font-light tracking-widest"
                  >
                    NO USERS FOUND.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
