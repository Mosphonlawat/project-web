"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Category {
  categoryId: number;
  categoryName: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    // 🌟 ดักเช็กเพิ่มว่าถ้าไม่มี Token ก็ไม่ให้เข้าหน้านี้
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role?.trim().toUpperCase() !== "ADMIN") {
      router.push("/");
      return;
    }
    fetchCategories();
  }, [router]);

  // ดึงหมวดหมู่ทั้งหมดรวดเดียวจบ (API เส้นนี้ปล่อยผ่าน ไม่ต้องใช้ Token ก็ได้)
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/categories", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันเพิ่มหมวดหมู่
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    // 🌟 1. ดึง Token จาก LocalStorage
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8080/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 🌟 2. แนบ Token ไปกับ Header
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryName: newCategoryName }),
      });

      if (res.ok) {
        setNewCategoryName("");
        fetchCategories();
      } else if (res.status === 403) {
        alert("คุณไม่มีสิทธิ์เพิ่มหมวดหมู่ (กรุณาล็อกอินใหม่)");
      } else {
        alert("เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  // ฟังก์ชันลบหมวดหมู่
  const handleDelete = async (id: number) => {
    if (
      confirm(
        "คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้? (หากมีสินค้าในหมวดหมู่นี้อาจทำให้เกิดปัญหาได้)",
      )
    ) {
      // 🌟 1. ดึง Token จาก LocalStorage
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`http://localhost:8080/api/categories/${id}`, {
          method: "DELETE",
          headers: {
            // 🌟 2. แนบ Token ไปกับ Header
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          fetchCategories();
        } else if (res.status === 403) {
          alert("คุณไม่มีสิทธิ์ลบหมวดหมู่ (กรุณาล็อกอินใหม่)");
        } else {
          // ดึงข้อความ Error จากหลังบ้าน (เช่น ลบไม่ได้เพราะมีสินค้าอยู่) มาแสดง
          const errorMsg = await res.text();
          alert(errorMsg || "ไม่สามารถลบหมวดหมู่ได้");
        }
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center tracking-widest text-gray-500">
        LOADING...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-8 pb-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <Sidebar />

      <main className="flex-1 max-w-4xl">
        {/* ฟอร์มเพิ่มหมวดหมู่ */}
        <div className="bg-white border border-gray-100 p-8 mb-8 shadow-sm">
          <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-6 uppercase">
            Add Category
          </h1>
          <form onSubmit={handleAddCategory} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                Category Name
              </label>
              <input
                type="text"
                required
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Whey Protein, Equipment..."
              />
            </div>
            <button
              type="submit"
              className="bg-black text-white px-8 py-2.5 text-sm uppercase tracking-widest hover:bg-gray-800 transition"
            >
              Add
            </button>
          </form>
        </div>

        {/* ตารางแสดงหมวดหมู่ */}
        <div className="bg-white border border-gray-100 p-8 shadow-sm">
          <h2 className="text-xl font-light tracking-widest text-gray-900 mb-6 uppercase">
            All Categories
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal w-24">
                  ID
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Name
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr
                    key={category.categoryId}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-4 text-gray-500 font-light">
                      #{category.categoryId}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {category.categoryName}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDelete(category.categoryId)}
                        className="text-sm text-red-500 hover:text-red-700 uppercase tracking-wider"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-gray-400 font-light tracking-widest"
                  >
                    NO CATEGORIES FOUND.
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
