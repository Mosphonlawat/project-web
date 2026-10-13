"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 🌟 ฟังก์ชันนับจำนวนอักษรพิเศษ (อะไรที่ไม่ใช่ไทย อังกฤษ เลข หรือช่องว่าง)
  const countSpecialChars = (str: string) => {
    const matches = str.match(/[^a-zA-Z0-9\u0E00-\u0E7F\s]/g);
    return matches ? matches.length : 0;
  };

  const validateForm = () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    // 1. ตรวจสอบชื่อจริง (ใส่อักษรพิเศษได้แค่ 1 ตัวเท่านั้น)
    if (trimmedFirstName.length < 2) {
      return "กรุณากรอกชื่อจริงอย่างน้อย 2 ตัวอักษร";
    }
    if (countSpecialChars(trimmedFirstName) > 1) {
      return "ชื่อจริงสามารถใส่อักษรพิเศษได้ไม่เกิน 1 ตัวเท่านั้น";
    }

    // 2. ตรวจสอบนามสกุล (ใส่อักษรพิเศษได้แค่ 1 ตัวเท่านั้น)
    if (trimmedLastName.length < 2) {
      return "กรุณากรอกนามสกุลอย่างน้อย 2 ตัวอักษร";
    }
    if (countSpecialChars(trimmedLastName) > 1) {
      return "นามสกุลสามารถใส่อักษรพิเศษได้ไม่เกิน 1 ตัวเท่านั้น";
    }

    // 3. ตรวจสอบ Email ด้วย Regex มาตรฐานสากล
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return "รูปแบบอีเมลไม่ถูกต้อง (ตัวอย่าง: user@example.com)";
    }

    // 4. ตรวจสอบรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
    if (password.length < 6) {
      return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    }

    // 5. ตรวจสอบยืนยันรหัสผ่านตรงกัน
    if (password !== confirmPassword) {
      return "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน";
    }

    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      if (response.ok) {
        alert("🎉 สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        router.push("/login");
      } else {
        const errorMsg = await response.text();
        setError(errorMsg || "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบ Spring Boot");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 py-12">
      <div className="bg-white p-10 md:p-14 shadow-sm border border-gray-100 w-full max-w-lg mt-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-widest mb-4">
            CREATE ACCOUNT
          </h1>
          <div className="w-10 h-[1px] bg-black mx-auto"></div>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border border-red-100 text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                First Name
              </label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                Last Name
              </label>
              <input
                type="text"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

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
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 mt-8 uppercase tracking-widest text-sm hover:bg-gray-800 transition duration-300 disabled:bg-gray-400 cursor-pointer"
          >
            {isSubmitting ? "CREATING ACCOUNT..." : "REGISTER"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 font-light">
          <span>Already have an account? </span>
          <Link
            className="text-black border-b border-black pb-1 hover:text-gray-600 transition ml-2"
            href="/login"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
