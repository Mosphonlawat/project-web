"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  // ฟังก์ชันเช็กว่าตอนนี้อยู่หน้าไหน เพื่อให้ลิงก์นั้นเป็นตัวหนา
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-full md:w-64 bg-white border border-gray-100 p-8 shadow-sm h-fit">
      <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-8">
        Admin Menu
      </h2>
      <nav className="space-y-6 flex flex-col">
        {/* เมนูหลักตาม Requirement */}
        <Link
          href="/admin"
          className={`transition tracking-wide ${
            isActive("/admin")
              ? "text-black font-medium"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Dashboard
        </Link>

        <Link
          href="/admin/products"
          className={`transition tracking-wide ${
            isActive("/admin/products")
              ? "text-black font-medium"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Products
        </Link>

        {/* 🌟 เมนูจัดการคำสั่งซื้อ (Orders) */}
        <Link
          href="/admin/orders"
          className={`transition tracking-wide ${
            isActive("/admin/orders")
              ? "text-black font-medium"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Orders
        </Link>

        {/* --------------------------------------------------------- */}
        {/* เมนูเสริม: หมวดหมู่และจัดการผู้ใช้งาน */}
        {/* --------------------------------------------------------- */}

        <Link
          href="/admin/categories"
          className={`transition tracking-wide ${
            isActive("/admin/categories")
              ? "text-black font-medium"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Categories
        </Link>

        <Link
          href="/admin/users"
          className={`transition tracking-wide ${
            isActive("/admin/users")
              ? "text-black font-medium"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Users
        </Link>
      </nav>
    </aside>
  );
}
