"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // 🌟 1. แยกเก็บข้อมูล User และ Token ลง LocalStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        // 🌟 2. ดึงชื่อจาก data.user มาแสดง
        alert(`ยินดีต้อนรับคุณ ${data.user.firstName}!`);

        // 🌟 3. เช็กสิทธิ์จาก data.user.role
        if (data.user.role && data.user.role.trim().toUpperCase() === "ADMIN") {
          window.location.href = "/admin"; // ถ้าเป็นแอดมิน ไปหน้า Dashboard
        } else {
          window.location.href = "/"; // ถ้าเป็นยูสเซอร์ ไปหน้า Home
        }
      } else {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาเปิด Spring Boot");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <div className="bg-white p-10 md:p-14 shadow-sm border border-gray-100 w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-widest mb-4">SIGN IN</h1>
          <div className="w-10 h-[1px] bg-black mx-auto"></div>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-4 mt-8 uppercase tracking-widest text-sm hover:bg-gray-800 transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 font-light">
          <span>New to FitnessPro? </span>
          <Link
            className="text-black border-b border-black pb-1 hover:text-gray-600 transition ml-2"
            href="/register"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
