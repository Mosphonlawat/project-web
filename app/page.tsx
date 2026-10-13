"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  productId: number;
  productName: string;
  productPrice: number;
  stock: number;
  imageUrl?: string;
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/products", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          // โชว์แค่ 3 ชิ้นล่าสุดบนหน้า Home
          setProducts(data.reverse().slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🌟 ปรับฟังก์ชันให้รับค่า productId และพาไปหน้ารายละเอียด
  const handleProductClick = (productId: number) => {
    const user = localStorage.getItem("user");

    // ดักล็อกอิน (ถ้ายังไม่ล็อกอิน ให้เด้งไปหน้า login ก่อน)
    if (!user) {
      alert("กรุณาเข้าสู่ระบบ หรือ สมัครสมาชิกก่อนเข้าชมสินค้าครับ");
      router.push("/login");
      return;
    }

    // ถ้าล็อกอินแล้ว พาไปหน้ารายละเอียดสินค้า
    router.push(`/products/${productId}`);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <img
          src="/gym-background.jpg"
          alt="Fitness Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        ></div>

        <div className="relative z-10 text-white px-4">
          <p className="text-sm md:text-base uppercase tracking-[0.3em] mb-4">
            Premium Equipment & Supplements
          </p>
          <h1 className="text-5xl md:text-7xl font-light mb-8 shadow-sm">
            ELEVATE YOUR <br /> <span className="font-bold">PERFORMANCE</span>
          </h1>
          <Link
            href="#new-arrivals"
            className="inline-block border border-white px-10 py-3 uppercase tracking-widest text-sm hover:bg-white hover:text-black transition duration-300 shadow-sm"
          >
            Discover Products
          </Link>
        </div>
      </section>

      {/* Section แสดงสินค้า */}
      <section id="new-arrivals" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light text-gray-800 tracking-wide">
            Recommended Products
          </h2>
          <div className="w-16 h-[1px] bg-gray-400 mx-auto mt-4"></div>
        </div>

        {isLoading ? (
          <div className="text-center tracking-widest text-gray-400">
            LOADING PRODUCTS...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.productId}
                  // 🌟 ส่งค่า productId เข้าไปในฟังก์ชันตอนกดคลิก
                  onClick={() => handleProductClick(product.productId)}
                  className="group cursor-pointer text-center flex flex-col h-full"
                >
                  {/* กรอบรูปภาพสินค้า */}
                  <div className="bg-gray-50 h-80 mb-6 overflow-hidden flex items-center justify-center border border-gray-100 relative">
                    <img
                      src={product.imageUrl || "/gym-background.jpg"}
                      alt={product.productName}
                      className="w-full h-full object-cover p-4 group-hover:scale-105 transition duration-500"
                    />
                    {/* ป้าย Out of Stock (ถ้าของหมด) */}
                    {product.stock === 0 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 tracking-widest uppercase">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* ชื่อและราคา */}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-500 transition">
                      {product.productName}
                    </h3>
                    <p className="text-gray-500 mt-2">
                      ฿ {product.productPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-400 tracking-widest">
                NO PRODUCTS FOUND
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
