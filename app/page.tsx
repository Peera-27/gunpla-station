/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchStore } from "@/store/searchStore";

const BANNERS = [
  { id: 1, image: "/assets/banner1.png" },
  {
    id: 2,
    image:
      "https://media.easy-peasy.ai/27feb2bb-aeb4-4a83-9fb6-8f3f2a15885e/879c169b-6069-4a24-a1a3-0a1928ab0271.png",
    title: "PROMOTION พิเศษ!",
    subtitle: "ซื้ออุปกรณ์ Modeler Tools วันนี้ ลดทันที 15%",
  },
  {
    id: 3,
    image:
      "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f513721e-793b-4fb7-9b25-ea0c1cbb06cf/ddh1k21-3beb1665-9527-4c47-b49c-280f178d1e6a.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9mNTEzNzIxZS03OTNiLTRmYjctOWIyNS1lYTBjMWNiYjA2Y2YvZGRoMWsyMS0zYmViMTY2NS05NTI3LTRjNDctYjQ5Yy0yODBmMTc4ZDFlNmEucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.PLB-CDxttiKpsHYJFhj471NixuCrcm7yMxArk8BYomc",
    title: "Pre-Order เปิดแล้ว",
    subtitle: "สั่งจองสินค้าใหม่ก่อนใคร การันตีได้รับของล็อตแรก",
  },
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const searchQuery = useSearchStore((state) => state.searchQuery);

  const CATEGORY_LIST = [
    { label: "ทั้งหมด (All)", value: "All" },
    { label: "HG (High Grade)", value: "HG" },
    { label: "RG (Real Grade)", value: "RG" },
    { label: "MG (Master Grade)", value: "MG" },
    { label: "อุปกรณ์ (Tools)", value: "Tools" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) console.log("error", error);
      else setProducts(data || []);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () =>
    setCurrentSlide(currentSlide === BANNERS.length - 1 ? 0 : currentSlide + 1);
  const prevSlide = () =>
    setCurrentSlide(currentSlide === 0 ? BANNERS.length - 1 : currentSlide - 1);

  return (
    // 🌟 เติม dark:bg-gray-900 ที่คลุมทั้งหน้า
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      {/* --- 2. Hero Banner (Slider) --- */}
      <div className="relative bg-gray-900 text-white h-125 overflow-hidden group">
        {BANNERS.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <img
              src={banner.image}
              className="w-full h-full object-cover opacity-40"
              alt="Banner"
            />
            {banner.title && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg transform transition-transform duration-700 translate-y-0">
                  {banner.title}
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-gray-200 max-w-2xl drop-shadow-md">
                  {banner.subtitle}
                </p>
              </div>
            )}
          </div>
        ))}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {BANNERS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-blue-500 w-8" : "bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      </div>

      {/* --- ส่วนที่ 2.5 หมวดหมู่สินค้า --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        {/* 🌟 เติม dark:text-gray-200 */}
        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">
          หมวดหมู่ยอดนิยม
        </h2>
        <div className="flex flex-wrap gap-3">
          {CATEGORY_LIST.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              // 🌟 เติมสีปุ่มโหมดมืด
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm border ${
                selectedCategory === cat.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- 3. Product Grid --- */}
      <main id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 🌟 เติม dark:text-white */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-blue-600 rounded-full block"></span>
          {selectedCategory === "All"
            ? "สินค้าทั้งหมด"
            : `สินค้าหมวด: ${selectedCategory}`}
        </h2>

        {products.filter(
          (p) => selectedCategory === "All" || p.category === selectedCategory,
        ).length === 0 ? (
          // 🌟 เติมสีกล่องแจ้งเตือนโหมดมืด
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            ยังไม่มีสินค้าในหมวดหมู่นี้ครับ
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter((product) => {
                const matchCategory =
                  selectedCategory === "All" ||
                  product.category === selectedCategory;
                const matchSearch = product.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());
                return matchCategory && matchSearch;
              })
              .map((product) => (
                <Link
                  href={`/product/${product.id}`}
                  key={product.id}
                  // 🌟 เติมสีการ์ดโหมดมืด
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 block cursor-pointer"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 dark:bg-gray-700 xl:aspect-w-7 xl:aspect-h-8 relative h-64">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={`w-full h-auto object-cover object-center group-hover:scale-110 transition-transform duration-500 bg-white dark:bg-gray-800 ${product.stock <= 0 ? "grayscale" : ""}`}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                        No Image
                      </div>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold shadow-sm">
                        🔥 ใกล้หมด!
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute top-2 left-2 bg-gray-800 dark:bg-black text-white text-xs px-2 py-1 rounded font-bold shadow-sm">
                        หมดชั่วคราว
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {/* 🌟 เติมสีชื่อสินค้าโหมดมืด */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          ฿{product.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          คงเหลือ: {product.stock} กล่อง
                        </p>
                      </div>
                      <button className="bg-gray-900 dark:bg-gray-700 text-white p-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors pointer-events-none">
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
