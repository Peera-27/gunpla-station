/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, CheckCircle, XCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
// ดึง Footer มาใช้

export default function ProductDetailPage() {
  const { id } = useParams(); // ดึงตัวเลข ID มาจาก URL (เช่น 1, 2, 3)
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);

  // สร้างฟังก์ชันจัดการตอนกดปุ่ม
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const currentItemInCart = cart.find((item) => item.id === product?.id);
  const quantityInCart = currentItemInCart ? currentItemInCart.quantity : 0;
  const availableStock = product ? product.stock - quantityInCart : 0;

  // ฟังก์ชันจัดการตอนกดปุ่ม Add to Cart
  const handleAddToCart = () => {
    if (selectedQuantity > availableStock) {
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: selectedQuantity, // 🌟 ส่งจำนวนที่ลูกค้าเลือกไปให้ Store
    });

    setSelectedQuantity(1); // รีเซ็ตกลับเป็น 1 หลังจากกดลงตะกร้าเสร็จ
  };
  useEffect(() => {
    const fetchProduct = async () => {
      // สั่งให้ Supabase ดึงสินค้าที่ 'id' ตรงกับใน URL มาแค่ชิ้นเดียว (.single)
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

  // ตอนกำลังโหลด ให้โชว์หน้านี้
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-xl text-gray-500">
        กำลังโหลดข้อมูล...
      </div>
    );

  // ถ้าหาสินค้าไม่เจอ หรือโดนลบไปแล้ว ให้โชว์หน้านี้
  if (!product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">ไม่พบสินค้านี้</h1>
        <Link href="/" className="text-blue-600 underline">
          กลับหน้าหลัก
        </Link>
      </div>
    );

  // ถ้าเจอสินค้า ให้โชว์หน้านี้
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* ปุ่มกดย้อนกลับ */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> กลับไปหน้าร้านค้า
        </Link>

        {/* กรอบเนื้อหาสินค้า */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
            {/* ฝั่งซ้าย: รูปภาพ */}
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`m-auto w-auto h-full object-cover object-center transition-transform duration-500 bg-white ${product.stock <= 0 ? "grayscale" : ""}`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  ไม่มีรูปภาพ
                </div>
              )}
            </div>

            {/* ฝั่งขวา: รายละเอียด */}
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-2">
                Gunpla Model
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="text-4xl font-black text-red-600 mb-6">
                ฿{product.price.toLocaleString()}
              </div>

              {/* ข้อความจำลองรายละเอียดสินค้า */}
              <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
                {product.description
                  ? product.description
                  : "สินค้าตัวนี้ยังไม่มีการระบุรายละเอียดเพิ่มเติมจากทางร้านครับ"}
              </p>

              {/* เช็คสถานะสต็อก */}
              <div
                className={`p-4 rounded-xl mb-8 flex items-center gap-3 border ${product.stock > 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
              >
                {product.stock > 0 ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
                <div>
                  <p className="font-bold text-gray-900">สถานะสินค้า</p>
                  <p
                    className={`text-sm font-medium ${product.stock > 0 ? "text-green-700" : "text-red-700"}`}
                  >
                    {product.stock > 0
                      ? `มีสินค้าพร้อมส่ง (${product.stock} กล่อง)`
                      : "สินค้าหมดชั่วคราว (Out of Stock)"}
                  </p>
                </div>
              </div>
              <div className="mb-6 flex items-center gap-4">
                <span className="font-bold text-gray-700">จำนวน:</span>

                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                  {/* ปุ่มลบ */}
                  <button
                    onClick={() => setSelectedQuantity((prev) => prev - 1)}
                    disabled={selectedQuantity <= 1 || availableStock <= 0}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    -
                  </button>

                  {/* ตัวเลขตรงกลาง */}
                  <div className="px-6 py-2 font-bold text-lg min-w-[3.5rem] text-center border-x border-gray-300">
                    <input
                      type="text"
                      min="1"
                      max={product.stock}
                      value={selectedQuantity}
                      onChange={(e) => {
                        const value = e.target.value;

                        // อนุญาตให้ว่างได้
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
                          setSelectedQuantity(0);
                        }
                      }}
                      className="w-full text-center border-none focus:outline-none"
                    />
                  </div>

                  {/* ปุ่มบวก (ล็อกไม่ให้กดเกินสต็อกที่มี) */}
                  <button
                    onClick={() => setSelectedQuantity((prev) => prev + 1)}
                    disabled={
                      selectedQuantity >= availableStock || availableStock <= 0
                    }
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-200 text-gray-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  {/* แจ้งเตือนลูกค้าให้ชัดเจน */}
                  {quantityInCart > 0
                    ? `(อยู่ในตะกร้าแล้ว ${quantityInCart} ชิ้น / ซื้อเพิ่มได้อีก ${availableStock} ชิ้น)`
                    : `(มีสินค้า ${product.stock} ชิ้น)`}
                </span>
              </div>
              {/* ปุ่มใส่ตะกร้า */}

              <button
                onClick={handleAddToCart}
                disabled={availableStock <= 0} // 🌟 ถ้าโควต้าหมด ให้ปุ่มกดไม่ได้
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg text-white transition-all shadow-lg active:scale-95 disabled:bg-gray-400 disabled:shadow-none disabled:active:scale-100 bg-blue-600 hover:bg-blue-700"
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
