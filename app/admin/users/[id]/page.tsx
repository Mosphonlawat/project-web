"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-10 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
        {/* เรียกใช้ Component Sidebar */}
        <Sidebar />

        {/* ตาราง ALL USERS */}
        <div className="flex-1 w-full bg-white p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-normal tracking-widest text-neutral-900 uppercase mb-8">
            ALL USERS
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                  <th className="pb-4 font-semibold w-16">ID</th>
                  <th className="pb-4 font-semibold">EMAIL</th>
                  <th className="pb-4 font-semibold">NAME</th>
                  <th className="pb-4 font-semibold">ROLE</th>
                  <th className="pb-4 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-xs tracking-wider text-gray-400 uppercase"
                    >
                      LOADING...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-xs tracking-wider text-gray-400 uppercase"
                    >
                      NO USERS FOUND.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.userId}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="py-4 text-gray-400 font-mono text-xs">
                        #{user.userId}
                      </td>
                      <td className="py-4 text-neutral-800 font-medium">
                        {user.email}
                      </td>
                      <td className="py-4 text-neutral-600">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase border ${
                            user.role === "ADMIN"
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-600 border-gray-200"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          href={`/admin/users/${user.userId}`}
                          className="text-xs font-semibold tracking-widest uppercase text-neutral-900 hover:opacity-60 transition-opacity underline underline-offset-4"
                        >
                          EDIT ROLE
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
