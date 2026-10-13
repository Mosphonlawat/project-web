"use client";

import { useEffect, useState } from "react";
import ProductCard, { Product, Category } from "@/components/ProductCard";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "ALL">(
    "ALL",
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8080/api/products", { cache: "no-store" }).then(
        (res) => res.json(),
      ),
      fetch("http://localhost:8080/api/categories", { cache: "no-store" }).then(
        (res) => res.json(),
      ),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setIsLoading(false);
      });
  }, []);

  const filteredProducts =
    selectedCategory === "ALL"
      ? products
      : products.filter(
          (product) => product.category?.categoryId === selectedCategory,
        );

  return (
    <div className="min-h-screen bg-white pt-32 px-4 md:px-12 pb-24 relative">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-light tracking-widest text-center mb-4 uppercase">
          Our Products
        </h1>
        <p className="text-center text-gray-500 font-light mb-16">
          Premium sports nutrition & supplements for peak performance.
        </p>

        {/* Layout แบ่ง 2 ฝั่ง (ซ้าย: หมวดหมู่, ขวา: รายการสินค้า) */}
        <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
          {/* ฝั่งซ้าย: Categories Sidebar */}
          <div className="w-full md:w-56 flex-shrink-0">
            <h2 className="hidden md:block text-sm font-bold tracking-widest uppercase mb-6 text-black border-b border-gray-900 pb-3">
              Categories
            </h2>

            {/* Mobile Dropdown */}
            {!isLoading && categories.length > 0 && (
              <div className="md:hidden relative w-full mb-8">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCategory(val === "ALL" ? "ALL" : Number(val));
                  }}
                  className="w-full appearance-none bg-transparent text-sm uppercase tracking-widest font-medium border-b-2 border-black pb-3 pl-2 pr-10 focus:outline-none cursor-pointer text-gray-900"
                >
                  <option value="ALL">All Products</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2 top-0 bottom-0 flex items-center pb-3 text-black">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            )}

            {/* Desktop Vertical List */}
            {!isLoading && categories.length > 0 && (
              <div className="hidden md:flex flex-col gap-5">
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  className={`text-left text-sm uppercase tracking-widest transition-colors ${
                    selectedCategory === "ALL"
                      ? "text-black font-bold"
                      : "text-gray-400 hover:text-black"
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    onClick={() => setSelectedCategory(cat.categoryId)}
                    className={`text-left text-sm uppercase tracking-widest transition-colors ${
                      selectedCategory === cat.categoryId
                        ? "text-black font-bold"
                        : "text-gray-400 hover:text-black"
                    }`}
                  >
                    {cat.categoryName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ฝั่งขวา: Grid สินค้า (เรียกใช้ ProductCard) */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center text-gray-400 tracking-widest mt-10">
                LOADING...
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 tracking-widest mt-10 uppercase text-sm">
                No products found in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
