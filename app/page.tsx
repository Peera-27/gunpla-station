/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
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
    image: "https://images4.alphacoders.com/226/226556.png",
    title: "Pre-Order เปิดแล้ว",
    subtitle: "สั่งจองสินค้าใหม่ก่อนใคร การันตีได้รับของล็อตแรก",
  },
];

const CATEGORY_LIST = [
  "All",
  "HG",
  "RG",
  "MG",
  "PG",
  "SD",
  "FM",
  "RE/100",
  "Mega Size",
  "Nipper",
  "Single Blade Nipper",
  "Sanding",
  "Glass File",
  "Hobby Knife",
  "Tweezers",
  "Airbrush",
  "Compressor",
  "Primer",
  "Topcoat",
  "Decal",
  "Action Base",
  "Tools",
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [tempCategory, setTempCategory] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [showSort, setShowSort] = useState(false);

  const searchQuery = useSearchStore((state) => state.searchQuery);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from("products").select("*");
      setProducts(data || []);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const matchCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchSearch = product.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "priceLow") return a.price - b.price;
      if (sortBy === "priceHigh") return b.price - a.price;
      if (sortBy === "stock") return b.stock - a.stock;

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  return (
    <div
      className="relative min-h-screen 
      bg-white dark:bg-[#0B1C2D] 
      text-gray-900 dark:text-white 
      overflow-hidden transition-colors duration-300"
    >
      {/* Pattern Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ================= BANNER ================= */}
      <div className="relative h-125 overflow-hidden group">
        {BANNERS.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0"
            }`}
          >
            <img
              src={banner.image}
              className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-3000 ease-out opacity-50"
              alt="Banner"
            />

            {banner.title && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-5xl font-extrabold drop-shadow-xl mb-4">
                  {banner.title}
                </h1>
                <p className="text-2xl font-bold drop-shadow-xl mb-4">
                  {banner.subtitle}
                </p>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() =>
            setCurrentSlide(
              currentSlide === 0 ? BANNERS.length - 1 : currentSlide - 1,
            )
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20
            p-3 rounded-full
            bg-black/30 hover:bg-black/60
            backdrop-blur-sm
            text-white
            transition-all duration-300 hover:scale-110
            border border-white/10
            cursor-pointer shadow-lg"
        >
          <ChevronLeft size={24} />
        </button>

        {/* ปุ่ม Next (ขวา) */}
        <button
          onClick={() =>
            setCurrentSlide(
              currentSlide === BANNERS.length - 1 ? 0 : currentSlide + 1,
            )
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20
            p-3 rounded-full
            bg-black/30 hover:bg-black/60
            backdrop-blur-sm
            text-white
            transition-all duration-300 hover:scale-110
            border border-white/10
            cursor-pointer shadow-lg"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      {/* ================= FLASH SALE HEADER ================= */}
      <div className="max-w-7xl mx-auto px-6 mt-12 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
          {/* ส่วนหัวข้อและคำอธิบาย */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Zap
                  className="text-orange-600 dark:text-orange-400 fill-orange-600 dark:fill-orange-400"
                  size={24}
                />
              </div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-yellow-300">
                Flash Sale
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-2">
              สินค้าจัดโปรโมชั่นลดราคาพิเศษเฉพาะช่วงเวลานี้เท่านั้น
              รีบช้อปก่อนสินค้าหมด!
            </p>
          </div>
        </div>
      </div>

      {/* ================= FILTER + SORT ================= */}
      <div className="relative max-w-7xl mx-auto px-6 py-8 z-10">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition"
          >
            ☰ Show Filter
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition flex items-center gap-1"
            >
              Sort by:
              <span className="capitalize">
                {sortBy === "latest" && "Latest"}
                {sortBy === "priceLow" && "Price: Low → High"}
                {sortBy === "priceHigh" && "Price: High → Low"}
                {sortBy === "stock" && "Stock"}
              </span>
              <span className="text-sm">▼</span>
            </button>

            {showSort && (
              <div
                className="absolute right-0 mt-3 w-56 
                bg-white dark:bg-[#13283C] 
                border border-gray-200 dark:border-white/10 
                rounded-xl shadow-xl z-50"
              >
                {[
                  { key: "latest", label: "Latest" },
                  { key: "priceLow", label: "Price: Low → High" },
                  { key: "priceHigh", label: "Price: High → Low" },
                  { key: "stock", label: "Stock" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setSortBy(item.key);
                      setShowSort(false);
                    }}
                    className="block w-full text-left px-4 py-2 
                      hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {showFilter && (
          <div
            className="backdrop-blur-md 
            bg-gray-100 dark:bg-white/5 
            border border-gray-200 dark:border-white/10 
            rounded-2xl p-6 mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORY_LIST.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTempCategory(cat)}
                  className={`text-left px-3 py-2 rounded-lg transition ${
                    tempCategory === cat
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => {
                  setSelectedCategory(tempCategory);
                  setShowFilter(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            ยังไม่มีสินค้าในหมวดหมู่นี้
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="group 
                  bg-gray-100 dark:bg-[#13283C] 
                  rounded-2xl overflow-hidden 
                  shadow-lg hover:shadow-2xl 
                  transition duration-300"
              >
                <div className="h-64 bg-gray-200 dark:bg-[#0F2233] overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 font-bold">
                        ฿ {product.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Category : {product.category}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
/// This code defines a React component for the homepage of a Gunpla Station website. It features a banner carousel, product filtering and sorting options, and displays a grid of products fetched from a Supabase database. The component uses Tailwind CSS for styling and includes responsive design elements.
