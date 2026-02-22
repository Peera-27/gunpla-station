/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import {
  Trash2,
  ArrowLeft,
  CreditCard,
  QrCode,
  CheckCircle,
  Upload,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

export default function CartPage() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);

  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [mounted, setMounted] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("guest@example.com");

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  useEffect(() => {
    setMounted(true);
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setUserEmail(session.user.email || "guest@example.com");
    };
    getUser();
  }, []);

  const handlePaymentSubmit = async () => {
    if (!slipFile) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "กรุณาแนบรูปสลิปโอนเงินก่อนครับ!",
      });
      return;
    }

    setIsUploading(true);

    try {
      const verifyFormData = new FormData();
      verifyFormData.append("file", slipFile);

      const verifyRes = await fetch("/api/verify-slip", {
        method: "POST",
        body: verifyFormData,
      });
      const verifyData = await verifyRes.json();

      if (verifyData.status !== 200) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text:
            "❌ สลิปไม่ถูกต้อง หรือ AI อ่านข้อมูลไม่ได้ครับ: " +
            verifyData.message,
        });
        setIsUploading(false);
        return;
      }

      const slipAmount = verifyData.data.amount.amount;
      if (slipAmount < totalPrice) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: `❌ ยอดเงินไม่ครบ! ยอดในสลิปคือ ฿${slipAmount} แต่ต้องชำระ ฿${totalPrice}`,
        });
        setIsUploading(false);
        return;
      }

      const fileExt = slipFile.name.split(".").pop();
      const fileName = `slip-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("slips")
        .upload(fileName, slipFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("slips")
        .getPublicUrl(fileName);

      const slipUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from("orders").insert([
        {
          customer_email: userEmail,
          total_amount: totalPrice,
          slip_url: slipUrl,
          status: "approved",
          items: cart,
        },
      ]);

      if (insertError) throw insertError;

      for (const item of cart) {
        const { data: productData } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();
        if (productData) {
          const newStock = productData.stock - item.quantity;
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.id);
        }
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        clearCart();
        router.push("/");
      }, 3000);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถชำระเงินได้",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!mounted) return null;

  return (
    // 🌟 เติม dark:bg-gray-900 พื้นหลังหลัก
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <main className="grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ตะกร้าสินค้าของคุณ
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <ShoppingCart className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-6">
              ยังไม่มีสินค้าในตะกร้า
            </h2>
            <Link
              href="/"
              className="bg-blue-600 dark:bg-blue-700 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors inline-block"
            >
              ไปเลือกซื้อสินค้ากันเลย
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ฝั่งซ้าย: รายการสินค้า */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors"
                >
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover bg-white dark:bg-gray-800"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400 dark:text-gray-500">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="grow">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                      ฿{item.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      จำนวน: {item.quantity} ชิ้น
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>

            {/* ฝั่งขวา: สรุปยอดและปุ่มจ่ายเงิน */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit sticky top-24 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                สรุปคำสั่งซื้อ
              </h2>

              <div className="space-y-4 mb-6 border-b dark:border-gray-700 pb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>ยอดรวมสินค้า</span>
                  <span>฿{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>ค่าจัดส่ง</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    ฟรี
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-2xl font-black text-gray-900 dark:text-white mb-8">
                <span>ยอดสุทธิ</span>
                <span className="text-red-600 dark:text-red-400">
                  ฿{totalPrice.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => setShowQR(true)}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg active:scale-95"
              >
                <CreditCard className="w-6 h-6" /> ยืนยันคำสั่งซื้อ
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- Modal: QR Code และ อัปโหลดสลิป --- */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl overflow-y-auto max-h-[90vh] transition-colors">
            {!paymentSuccess ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    แสกนเพื่อชำระเงิน
                  </h3>
                  <button
                    onClick={() => setShowQR(false)}
                    className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* 🌟 บังคับพื้นหลัง QR Code เป็นสีขาวเสมอ เพื่อให้มือถือสแกนติดง่าย */}
                <div className="bg-white p-4 rounded-2xl mb-4 inline-block border-2 border-gray-100">
                  <QrCode className="w-40 h-40 text-gray-900" />
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-1">
                  ยอดที่ต้องชำระ
                </p>
                <p className="text-3xl font-black text-red-600 dark:text-red-400 mb-6">
                  ฿{totalPrice.toLocaleString()}
                </p>

                {/* --- ส่วนอัปโหลดสลิป --- */}
                <div className="border-t dark:border-gray-700 pt-6 mb-6">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 text-left">
                    แนบหลักฐานการโอนเงิน (สลิป)
                  </p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 px-4 text-center">
                        {slipFile ? (
                          <span className="text-blue-600 dark:text-blue-400 font-bold truncate block max-w-[200px]">
                            {slipFile.name}
                          </span>
                        ) : (
                          "คลิกเพื่อเลือกไฟล์รูปภาพ"
                        )}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setSlipFile(e.target.files ? e.target.files[0] : null)
                      }
                    />
                  </label>
                </div>

                {/* ปุ่มส่งข้อมูล */}
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isUploading}
                  className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 flex justify-center items-center gap-2"
                >
                  {isUploading ? "กำลังอัปโหลดข้อมูล..." : "แจ้งชำระเงิน"}
                </button>
              </>
            ) : (
              <div className="py-8">
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6 animate-bounce" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ส่งสลิปสำเร็จ!
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  ระบบกำลังรอแอดมินตรวจสอบยอดเงิน
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
                  กำลังพากลับไปหน้าหลัก...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
