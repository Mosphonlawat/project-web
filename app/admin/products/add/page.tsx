"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

interface Category {
  categoryId: number;
  categoryName: string;
}

export default function AddProductPage() {
  const router = useRouter();

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // ฟังก์ชันไปดึงหมวดหมู่ (API นี้ปล่อยผ่านไม่ต้องใช้ Token ได้)
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/categories", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 🌟 ฟังก์ชันกดยืนยันเพิ่มสินค้า (ต้องส่ง Token ไปด้วย)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (imageFile && imageFile.size > 10 * 1024 * 1024) {
      alert(
        "ขนาดไฟล์รูปภาพใหญ่เกินไป (ต้องไม่เกิน 10MB) กรุณาเลือกรูปใหม่ครับ",
      );
      setIsLoading(false);
      return;
    }

    // 🌟 1. หยิบ Token ออกมาจาก LocalStorage
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("productName", productName);
      formData.append("productPrice", productPrice);
      formData.append("stock", stock);
      formData.append("description", description);

      if (categoryId) {
        formData.append("categoryId", categoryId);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch("http://localhost:8080/api/products", {
        method: "POST",
        // 🌟 2. แนบ Token เข้าไปใน headers (หมายเหตุ: ใช้ FormData ไม่ต้องใส่ Content-Type นะครับ เดี๋ยวเบราว์เซอร์จัดการให้เอง)
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("เพิ่มสินค้าสำเร็จ!");
        router.push("/admin/products");
      } else if (response.status === 403) {
        // 🌟 3. ดักจับ Error กรณีไม่มีสิทธิ์ (Token หมดอายุ หรือไม่ใช่แอดมิน)
        setError(
          "คุณไม่มีสิทธิ์เพิ่มสินค้า หรือเซสชันหมดอายุ กรุณาล็อกอินใหม่",
        );
      } else {
        setError("ไม่สามารถเพิ่มสินค้าได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-8 pb-12 flex flex-col md:flex-row gap-8">
      <Sidebar />

      <main className="flex-1 bg-white border border-gray-100 p-8 md:p-12 shadow-sm max-w-3xl">
        <div className="mb-10 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-light tracking-widest text-gray-900 mb-2 uppercase">
            Add New Product
          </h1>
          <p className="text-gray-500 font-light">
            Create a new product for your catalog.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
              Product Name
            </label>
            <input
              type="text"
              required
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
              Category
            </label>
            <select
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent text-gray-700"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Select a Category --
              </option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 p-3 focus:outline-none focus:border-black transition-colors bg-transparent text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดสินค้า..."
            />
          </div>

          <div className="flex gap-6">
            <div className="w-1/2">
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                Price (THB)
              </label>
              <input
                type="number"
                required
                min="0"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                Stock
              </label>
              <input
                type="number"
                required
                min="0"
                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
              Product Image
            </label>
            <div className="relative border-2 border-dashed border-gray-300 hover:border-black transition-colors bg-gray-50 w-full h-56 flex flex-col items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-gray-400 text-sm flex flex-col items-center">
                  <span className="text-3xl mb-2 font-light">+</span>
                  <span className="tracking-widest uppercase text-xs">
                    Upload Image
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-8 flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white px-8 py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition disabled:bg-gray-400"
            >
              {isLoading ? "Saving..." : "Save Product"}
            </button>
            <Link
              href="/admin/products"
              className="px-8 py-4 text-sm uppercase tracking-widest border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
