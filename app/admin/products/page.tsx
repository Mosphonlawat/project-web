"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
interface Product {
  productId: number;
  productName: string;
  productPrice: number; // ⚠️ ต้องใช้ชื่อ productPrice
  stock: number;
  imageUrl: string;
  description?: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      // ⚠️ บังคับให้ดึงข้อมูลใหม่เสมอ ไม่จำ Cache
      const response = await fetch("http://localhost:8080/api/products", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันลบสินค้า พร้อมกล่องถามยืนยัน (อัปเดตระบบ Token แล้ว)
  const handleDelete = async (productId: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) {
      // 🌟 1. ดึง Token จากตู้เซฟ
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          `http://localhost:8080/api/products/${productId}`,
          {
            method: "DELETE",
            // 🌟 2. แนบ Token ไปให้ Spring Boot ตรวจสอบ
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.ok) {
          alert("ลบสินค้าสำเร็จ!");
          fetchProducts();
        } else if (res.status === 403) {
          // 🌟 ดักจับ Error กรณีไม่ได้ล็อกอิน หรือ Token หมดอายุ
          alert("คุณไม่มีสิทธิ์ลบสินค้าชิ้นนี้ (กรุณาล็อกอินใหม่)");
        } else {
          // ดึงข้อความ Error จากหลังบ้าน (ถ้ามี) มาโชว์
          const errorMsg = await res.text();
          alert(errorMsg || "ไม่สามารถลบสินค้าได้ (อาจติดข้อมูลการสั่งซื้อ)");
        }
      } catch (err) {
        console.error("Error deleting product:", err);
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
      <Sidebar />
      <main className="flex-1 bg-white border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="flex justify-between items-end mb-10 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-light tracking-widest text-gray-900 mb-2 uppercase">
              Products
            </h1>
            <p className="text-gray-500 font-light">
              Manage your store inventory.
            </p>
          </div>
          <Link
            href="/admin/products/add"
            className="bg-black text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition inline-block"
          >
            + Add Product
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Image
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Name
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Price
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal">
                  Stock
                </th>
                <th className="py-4 px-4 text-xs tracking-widest uppercase text-gray-400 font-normal text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr
                    key={product.productId}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.productName}
                          className="w-12 h-12 object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          NO IMG
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {product.productName}
                    </td>

                    {/* ⚠️ จุดสำคัญ: ช่องราคา จะมีสัญลักษณ์ ฿ และใช้ productPrice */}
                    <td className="py-4 px-4 text-gray-600">
                      ฿{Number(product.productPrice || 0).toLocaleString()}
                    </td>

                    {/* ⚠️ จุดสำคัญ: ช่องสต็อก จะดึงแค่ stock */}
                    <td className="py-4 px-4 text-gray-600">
                      {Number(product.stock || 0)}
                    </td>

                    <td className="py-4 px-4 text-right space-x-4">
                      <Link
                        href={`/admin/products/${product.productId}`}
                        className="text-sm text-blue-600 hover:text-blue-800 uppercase tracking-wider inline-block"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.productId)}
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
                    colSpan={5}
                    className="py-12 text-center text-gray-400 font-light tracking-widest"
                  >
                    NO PRODUCTS FOUND.
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
