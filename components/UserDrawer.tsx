"use client";

import Link from "next/link";

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onOpenOrders: () => void;
  onLogout: () => void;
}

export default function UserDrawer({
  isOpen,
  onClose,
  user,
  onOpenOrders,
  onLogout,
}: UserDrawerProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 🌟 พื้นหลังมืดโปร่งแสง (กดเพื่อปิด) */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* 🌟 แถบ Slide Drawer ด้านขวา */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 text-gray-900 border-l border-gray-100 animate-in slide-in-from-right duration-300">
        {/* หัวกระดาษ (Header) */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-light tracking-widest uppercase text-gray-900">
              Account
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-light">
              User Profile & Actions
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-2xl font-light leading-none transition cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* เนื้อหาด้านใน Drawer */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/40">
          {/* ข้อมูลโปรไฟล์ของผู้ใช้ */}
          <div className="p-5 bg-white border border-gray-200 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-medium text-lg font-mono flex-shrink-0">
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </h3>
                <span
                  className={`text-[10px] tracking-wider px-2 py-0.5 font-mono uppercase font-semibold ${
                    user.role === "ADMIN"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          {/* รายการเมนูปุ่มกด */}
          <div className="space-y-2.5">
            <p className="text-[11px] uppercase tracking-widest text-gray-400 px-1 font-medium">
              Navigation Menu
            </p>

            {/* 🌟 1. ปุ่ม Dashboard (แสดงเฉพาะ ADMIN) */}
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={onClose}
                className="w-full flex items-center justify-between p-4 border border-gray-200 bg-white hover:border-black transition group text-left block"
              >
                <div className="flex items-center gap-3.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-500 group-hover:text-black transition"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                    />
                  </svg>
                  <div>
                    <span className="text-xs uppercase tracking-widest font-semibold text-gray-900">
                      Dashboard
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-light">
                      Admin management panel
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition font-mono">
                  &rarr;
                </span>
              </Link>
            )}

            {/* 🌟 2. ปุ่ม My Orders (กดแล้วเปิดแถบคำสั่งซื้อต่อได้ทันที) */}
            <button
              onClick={() => {
                onClose();
                onOpenOrders();
              }}
              className="w-full flex items-center justify-between p-4 border border-gray-200 bg-white hover:border-black transition group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-500 group-hover:text-black transition"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <div>
                  <span className="text-xs uppercase tracking-widest font-medium text-gray-900">
                    My Orders
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-light">
                    Track status and order history
                  </p>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition font-mono">
                &rarr;
              </span>
            </button>

            {/* 🌟 3. ปุ่ม Shop / สินค้า */}
            <Link
              href="/products"
              onClick={onClose}
              className="w-full flex items-center justify-between p-4 border border-gray-200 bg-white hover:border-black transition group text-left block"
            >
              <div className="flex items-center gap-3.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-500 group-hover:text-black transition"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <div>
                  <span className="text-xs uppercase tracking-widest font-medium text-gray-900">
                    Our Products
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-light">
                    Explore nutrition products
                  </p>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-black group-hover:translate-x-1 transition font-mono">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* ปุ่ม Logout ด้านล่างสุด */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full bg-black text-white py-3.5 text-xs uppercase tracking-widest font-light hover:bg-neutral-800 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
