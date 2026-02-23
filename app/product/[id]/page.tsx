/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Swal from "sweetalert2";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);

  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // 🌟 State สำหรับระบบรีวิว
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const currentItemInCart = cart.find((item) => item.id === product?.id);
  const quantityInCart = currentItemInCart ? currentItemInCart.quantity : 0;
  const availableStock = product ? product.stock - quantityInCart : 0;

  useEffect(() => {
    const fetchData = async () => {
      // 1. เช็คว่ามีคนล็อกอินไหม
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setUserEmail(session.user.email || null);

      // 2. ดึงข้อมูลสินค้า
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!productError) setProduct(productData);

      // 3. ดึงข้อมูลรีวิวของสินค้านี้
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      if (reviewsData) setReviews(reviewsData);

      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (selectedQuantity > availableStock) return;
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

  // 🌟 ฟังก์ชันส่งรีวิว
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userEmail) {
      Swal.fire("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อนเขียนรีวิวครับ", "warning");
      return;
    }

    if (!comment.trim()) {
      Swal.fire("แจ้งเตือน", "กรุณาพิมพ์ความคิดเห็นก่อนกดส่งครับ", "warning");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const { error } = await supabase.from("reviews").insert([
        {
          product_id: product.id,
          user_email: userEmail,
          rating,
          comment,
        },
      ]);

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "ขอบคุณ!",
        text: "ส่งรีวิวของคุณเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });

      // รีเซ็ตฟอร์ม และดึงรีวิวมาอัปเดตใหม่
      setComment("");
      setRating(5);
      const { data: updatedReviews } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      if (updatedReviews) setReviews(updatedReviews);
    } catch (error: any) {
      Swal.fire("เกิดข้อผิดพลาด", error.message, "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // คำนวณดาวเฉลี่ย
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> กลับไปหน้าร้านค้า
        </Link>

        {/* --- ส่วนที่ 1: กรอบรายละเอียดสินค้า --- */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
            {/* รูปภาพ */}
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

            {/* รายละเอียด */}
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-2">
                {product.category}
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                {product.name}
              </span>

              {/* แสดงดาวเฉลี่ย */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= Number(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {Number(averageRating) > 0
                    ? `${averageRating} / 5.0 (${reviews.length} รีวิว)`
                    : "(ยังไม่มีรีวิว)"}
                </span>
              </div>

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
                className={`p-4 rounded-xl mb-8 flex items-center gap-3 border transition-colors ${product.stock > 0 ? "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800/50" : "bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800/50"}`}
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

              {/* ระบบเลือกจำนวนและเพิ่มลงตะกร้า */}
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
                  <div className="px-2 py-2 font-bold text-lg min-w-16 text-center border-x border-gray-300 dark:border-gray-600">
                    <input
                      type="text"
                      min="1"
                      max={product.stock}
                      value={selectedQuantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val) && val > 0 && val <= product.stock)
                          setSelectedQuantity(val);
                      }}
                      onBlur={() => {
                        if (selectedQuantity === 0) setSelectedQuantity(1);
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
              </div>

              <button
                onClick={handleAddToCart}
                disabled={availableStock <= 0}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg text-white transition-all shadow-lg active:scale-95 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:shadow-none bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500"
              >
                <ShoppingCart className="w-6 h-6" />
                {availableStock > 0
                  ? `เพิ่มลงตะกร้า ${selectedQuantity} ชิ้น`
                  : "สินค้าหมด"}
              </button>
            </div>
          </div>
        </div>

        {/* --- ส่วนที่ 2: ระบบรีวิวสินค้า --- */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-10 transition-colors">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            รีวิวจากผู้ใช้งาน
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ฟอร์มเขียนรีวิว */}
            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 pb-8 lg:pb-0 lg:pr-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                เขียนรีวิวของคุณ
              </h3>

              {!userEmail ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    คุณต้องเข้าสู่ระบบก่อนจึงจะเขียนรีวิวได้
                  </p>
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors inline-block"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ให้คะแนนสินค้า
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-8 h-8 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ความคิดเห็น
                    </label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="สินค้าเป็นอย่างไรบ้าง แบ่งปันประสบการณ์ของคุณ..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-gray-900 dark:bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                  >
                    {isSubmittingReview ? "กำลังส่งรีวิว..." : "ส่งรีวิว"}
                  </button>
                </form>
              )}
            </div>

            {/* รายการรีวิว */}
            <div className="lg:col-span-2">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                    ยังไม่มีรีวิวสำหรับสินค้านี้
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    มาเป็นคนแรกที่รีวิวสินค้านี้กันเถอะ!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg">
                            {r.user_email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                              {/* เซ็นเซอร์อีเมลเพื่อความเป็นส่วนตัว (เช่น p***@gmail.com) */}
                              {r.user_email.split("@")[0].substring(0, 2)}***@
                              {r.user_email.split("@")[1]}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(r.created_at).toLocaleDateString(
                                "th-TH",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line ml-13">
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
