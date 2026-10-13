"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface Product {
  productId: number;
  productName: string;
  productPrice: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  category?: Category;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleAddToCart = () => {
    // 1. ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า");
      router.push("/login");
      return;
    }

    // 2. ส่งสัญญาณให้ตะกร้าสินค้าใน Navbar รับของเข้าไป
    window.dispatchEvent(new CustomEvent("add-to-cart", { detail: product }));
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white border border-gray-100 flex flex-col justify-between p-5 transition duration-300 hover:shadow-md hover:border-gray-200">
      <div>
        {/* 🌟 1. คลิกที่รูปภาพเพื่อเข้าไปยังหน้ารายละเอียดสินค้า */}
        <Link
          href={`/products/${product.productId}`}
          className="relative aspect-square w-full bg-gray-50 overflow-hidden mb-4 border border-gray-50 flex items-center justify-center block cursor-pointer"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-gray-300 text-xs tracking-widest uppercase">
              No Image
            </div>
          )}

          {/* ป้ายแสดง Stock หรือ Out of Stock บนมุมรูปภาพ */}
          {isOutOfStock ? (
            <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] tracking-widest uppercase px-2 py-1 font-medium">
              Out of Stock
            </span>
          ) : (
            <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5">
              Stock: {product.stock}
            </span>
          )}
        </Link>

        {/* หมวดหมู่สินค้า */}
        {product.category && (
          <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-1">
            {product.category.categoryName}
          </p>
        )}

        {/* ชื่อสินค้า (คลิกเพื่อเข้าไปดูรายละเอียดได้เช่นกัน) */}
        <Link href={`/products/${product.productId}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-2 hover:underline cursor-pointer">
            {product.productName}
          </h3>
        </Link>

        {/* ราคา */}
        <p className="text-base font-medium font-mono text-gray-900 mb-4">
          ฿
          {Number(product.productPrice || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* 🌟 2. เหลือเฉพาะปุ่ม ADD TO CART เต็มความกว้าง (ลบปุ่ม Details ออกแล้ว) */}
      <div className="pt-2 border-t border-gray-50">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-3 text-xs uppercase tracking-widest font-light transition flex items-center justify-center ${
            isOutOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-black text-white hover:bg-neutral-800 cursor-pointer"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
