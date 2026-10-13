"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  productId: number;
  productName: string;
  productPrice: number;
  stock: number;
  imageUrl: string;
  description: string;
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // โหลดข้อมูลคนที่ Login
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    fetch(`http://localhost:8080/api/products/${productId}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [productId]);

  // 🌟 ฟังก์ชันจัดการตะกร้าสินค้า (เปลี่ยนไปส่งสัญญาณให้ Navbar แทน)
  const handleAddToCart = () => {
    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า");
      router.push("/login");
      return;
    }
    if (product) {
      // ส่งข้อมูลแบบ Custom Event ให้ Navbar รับไปใส่ตะกร้า
      window.dispatchEvent(new CustomEvent("add-to-cart", { detail: product }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center tracking-widest text-gray-500">
        LOADING...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-light tracking-widest mb-4">
          PRODUCT NOT FOUND
        </h1>
        <Link href="/products" className="text-sm underline text-gray-500">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 px-4 md:px-12 pb-24 relative">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-20">
        <div className="w-full md:w-1/2">
          <div className="bg-gray-50 w-full aspect-square relative flex items-center justify-center overflow-hidden border border-gray-100">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.productName}
                className="w-full h-full object-contain p-8"
              />
            ) : (
              <span className="text-gray-400 tracking-widest text-sm">
                NO IMAGE AVAILABLE
              </span>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <Link
            href="/products"
            className="text-xs uppercase tracking-widest text-gray-400 mb-6 hover:text-black transition"
          >
            ← Back to All Products
          </Link>

          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
            {product.productName}
          </h1>

          <p className="text-2xl font-normal text-gray-900 mb-8">
            ฿{Number(product.productPrice || 0).toLocaleString()}
          </p>

          <div className="border-t border-gray-200 pt-8 mb-8">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4">
              Product Details
            </h3>
            <p className="text-gray-600 font-light leading-relaxed whitespace-pre-line">
              {product.description || "ไม่มีคำอธิบายสำหรับสินค้านี้"}
            </p>
          </div>

          <div className="bg-gray-50 p-6 flex flex-col gap-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Availability</span>
              <span
                className={
                  product.stock > 0 ? "text-green-600" : "text-red-500"
                }
              >
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : "Out of Stock"}
              </span>
            </div>

            {/* ปุ่ม Add to Cart ที่จะส่งข้อมูลไปให้ Navbar */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full py-4 text-sm uppercase tracking-widest transition ${
                product.stock > 0
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
