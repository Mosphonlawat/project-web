"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
interface Product {
  productId: number;
  productName: string;
  stock: number;
  productPrice: number;
}

interface Category {
  categoryId: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. ตรวจสอบสิทธิ์ Admin
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

    // 2. ดึงข้อมูลสถิติ
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      // ยิง API ดึงข้อมูลสินค้าและหมวดหมู่มาพร้อมกัน
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("http://localhost:8080/api/products", { cache: "no-store" }),
        fetch("http://localhost:8080/api/categories", { cache: "no-store" }),
      ]);

      if (productsRes.ok && categoriesRes.ok) {
        const productsData: Product[] = await productsRes.json();
        const categoriesData: Category[] = await categoriesRes.json();

        // คำนวณตัวเลขใส่กล่อง
        setTotalProducts(productsData.length);
        setTotalCategories(categoriesData.length);

        // นับจำนวนสินค้าที่สต็อกเหลือน้อยกว่า 5 ชิ้น
        const lowStock = productsData.filter((p) => p.stock < 5).length;
        setLowStockCount(lowStock);

        // ดึงสินค้า 5 รายการล่าสุดมาแสดงใน Recent Activity (สลับเอาตัวล่าสุดขึ้นก่อน)
        const recent = [...productsData].reverse().slice(0, 5);
        setRecentActivities(recent);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center tracking-widest text-gray-500">
        LOADING...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 px-4 md:px-8 pb-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar เมนูแอดมิน */}
      <Sidebar />
      {/* พื้นที่ Dashboard (เหมือนในรูปเป๊ะๆ) */}
      <main className="flex-1 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-3xl font-light tracking-widest text-gray-900 mb-2 uppercase">
            DASHBOARD
          </h1>
          <p className="text-gray-500 font-light">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>

        {/* กล่องตัวเลข 3 กล่อง */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border border-gray-100 p-8 text-center flex flex-col items-center justify-center shadow-sm">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4">
              Total Products
            </h3>
            <span className="text-4xl font-light text-gray-900">
              {totalProducts}
            </span>
          </div>
          <div className="border border-gray-100 p-8 text-center flex flex-col items-center justify-center shadow-sm">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4">
              Total Categories
            </h3>
            <span className="text-4xl font-light text-gray-900">
              {totalCategories}
            </span>
          </div>
          <div className="border border-gray-100 p-8 text-center flex flex-col items-center justify-center shadow-sm">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4">
              Low Stock Alerts
            </h3>
            <span
              className={`text-4xl font-light ${lowStockCount > 0 ? "text-red-500" : "text-gray-900"}`}
            >
              {lowStockCount}
            </span>
          </div>
        </div>

        {/* ส่วน Recent Activity */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-sm uppercase tracking-widest text-gray-900 mb-6">
            Recent Activity
          </h2>

          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((product) => (
                <div
                  key={product.productId}
                  className="flex justify-between items-center py-4 border-b border-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 text-xs">
                      #{product.productId}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Added new product: {product.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Stock: {product.stock} units
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">
                    ฿{product.productPrice.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-light">
                No recent activity found.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
