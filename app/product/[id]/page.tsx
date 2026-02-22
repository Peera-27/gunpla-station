/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, CheckCircle, XCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Swal from "sweetalert2";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);

  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const currentItemInCart = cart.find((item) => item.id === product?.id);
  const quantityInCart = currentItemInCart ? currentItemInCart.quantity : 0;
  const availableStock = product ? product.stock - quantityInCart : 0;

  const handleAddToCart = () => {
    if (selectedQuantity > availableStock) {
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: selectedQuantity,
    });
    Swal.fire({
      icon: "success",
      title: "เพิ่มลงตะกร้าสำเร็จ!",
      text: `คุณได้เพิ่ม ${selectedQuantity} ชิ้นของ "${product.name}" ลงในตะกร้าแล้ว`,
      timer: 2000,
      showConfirmButton: false,
    });
    setSelectedQuantity(1);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setProduct(data);
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-xl text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 transition-colors">
        กำลังโหลดข้อมูล...
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          ไม่พบสินค้านี้
        </h1>
        <Link href="/" className="text-blue-600 dark:text-blue-400 underline">
          กลับหน้าหลัก
        </Link>
      </div>
    );

  return (
    // 🌟 เติม dark:bg-gray-900 ที่พื้นหลังหลัก
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* ปุ่มกดย้อนกลับ */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> กลับไปหน้าร้านค้า
        </Link>

        {/* กรอบเนื้อหาสินค้า */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
            {/* ฝั่งซ้าย: รูปภาพ */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-600">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`m-auto w-auto h-full object-cover object-center transition-transform duration-500 bg-white dark:bg-gray-800 ${product.stock <= 0 ? "grayscale" : ""}`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  ไม่มีรูปภาพ
                </div>
              )}
            </div>

            {/* ฝั่งขวา: รายละเอียด */}
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-2">
                Gunpla Model
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>

              <div className="text-4xl font-black text-red-600 dark:text-red-400 mb-6">
                ฿{product.price.toLocaleString()}
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 whitespace-pre-line">
                {product.description
                  ? product.description
                  : "สินค้าตัวนี้ยังไม่มีการระบุรายละเอียดเพิ่มเติมจากทางร้านครับ"}
              </p>

              {/* เช็คสถานะสต็อก */}
              <div
                className={`p-4 rounded-xl mb-8 flex items-center gap-3 border transition-colors ${
                  product.stock > 0
                    ? "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800/50"
                    : "bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800/50"
                }`}
              >
                {product.stock > 0 ? (
                  <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                )}
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    สถานะสินค้า
                  </p>
                  <p
                    className={`text-sm font-medium ${product.stock > 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                  >
                    {product.stock > 0
                      ? `มีสินค้าพร้อมส่ง (${product.stock} กล่อง)`
                      : "สินค้าหมดชั่วคราว (Out of Stock)"}
                  </p>
                </div>
              </div>

              {/* ระบบเลือกจำนวน */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  จำนวน:
                </span>

                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                  <button
                    onClick={() => setSelectedQuantity((prev) => prev - 1)}
                    disabled={selectedQuantity <= 1 || availableStock <= 0}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    -
                  </button>

                  <div className="px-2 py-2 font-bold text-lg min-w-[4rem] text-center border-x border-gray-300 dark:border-gray-600">
                    <input
                      type="text"
                      min="1"
                      max={product.stock}
                      value={selectedQuantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setSelectedQuantity(0);
                          return;
                        }
                        const numberValue = Number(value);
                        if (
                          !isNaN(numberValue) &&
                          numberValue > 0 &&
                          numberValue <= product.stock
                        ) {
                          setSelectedQuantity(numberValue);
                        }
                      }}
                      onBlur={() => {
                        if (selectedQuantity === 0) {
                          setSelectedQuantity(1); // แก้ไขเป็น 1 ป้องกันบั๊กค่า 0
                        }
                      }}
                      className="w-full text-center border-none focus:outline-none bg-transparent dark:text-white"
                    />
                  </div>

                  <button
                    onClick={() => setSelectedQuantity((prev) => prev + 1)}
                    disabled={
                      selectedQuantity >= availableStock || availableStock <= 0
                    }
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>

                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {quantityInCart > 0
                    ? `(อยู่ในตะกร้าแล้ว ${quantityInCart} ชิ้น / ซื้อเพิ่มได้อีก ${availableStock} ชิ้น)`
                    : `(มีสินค้า ${product.stock} ชิ้น)`}
                </span>
              </div>

              {/* ปุ่มใส่ตะกร้า */}
              <button
                onClick={handleAddToCart}
                disabled={availableStock <= 0}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg text-white transition-all shadow-lg active:scale-95 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:shadow-none disabled:active:scale-100 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500"
              >
                <ShoppingCart className="w-6 h-6" />
                {availableStock > 0
                  ? `เพิ่มลงตะกร้า ${selectedQuantity} ชิ้น`
                  : quantityInCart >= product.stock
                    ? "คุณหยิบใส่ตะกร้าครบตามสต็อกแล้ว"
                    : "สินค้าหมด"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
