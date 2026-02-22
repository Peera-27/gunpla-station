/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Trash2, PlusCircle, ArrowLeft, Minus } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [checking, setChecking] = useState(true);

  // State สำหรับฟอร์มเพิ่มสินค้า
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("HG");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ฟังก์ชันดึงข้อมูลสินค้า
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setProducts(data || []);
  };

  // 1. ตรวจสอบสิทธิ์ Admin
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถเข้าถึงหน้าแอดมินได้",
          text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
        });
        router.push("/");
        return;
      }
      const email = session.user.email;
      if (email === "admin@gmail.com" || email === "crbrsonline@gmail.com") {
        fetchProducts();
      } else {
        router.push("/");
      }
      setChecking(false);
    };
    checkAdmin();
  }, [router]);

  // 2. ฟังก์ชันเพิ่มสินค้า
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImageUrl = "";

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const safeFileName = `product-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(safeFileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(safeFileName);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("products").insert([
        {
          name,
          price: Number(price),
          stock: Number(stock),
          description,
          category,
          image_url: finalImageUrl,
        },
      ]);

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "เพิ่มสินค้าเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      });

      setName("");
      setPrice("");
      setStock("");
      setDescription("");
      setCategory("HG");
      setImageFile(null);
      fetchProducts();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถเพิ่มสินค้าได้",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateStock = async (id: number, newStock: number) => {
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", id);
    if (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถอัปเดตสต็อกได้",
      });
    } else {
      fetchProducts();
    }
  };

  // 3. ฟังก์ชันลบสินค้า
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "แน่ใจหรือไม่?",
      text: "คุณต้องการลบสินค้านี้ใช่ไหม? (ไม่สามารถกู้คืนได้)",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถลบสินค้าได้",
      });
    } else {
      Swal.fire("ลบแล้ว!", "สินค้าถูกลบออกจากระบบแล้ว", "success");
      fetchProducts();
    }
  };

  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );

  return (
    // 🌟 เติม dark:bg-gray-900 ให้พื้นหลังหลัก
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* หัวหน้าเว็บ */}
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              ระบบจัดการสต็อก (Admin Panel)
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              เพิ่ม แก้ไข และลบ สินค้าในร้าน Gunpla Station
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> กลับหน้าร้านค้า
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- ฟอร์มเพิ่มสินค้า (ซ้าย) --- */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit transition-colors">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <PlusCircle className="text-green-500 dark:text-green-400" />{" "}
              เพิ่มสินค้าใหม่
            </h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="เช่น HG Aerial"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                    placeholder="฿"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                    placeholder="ชิ้น"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="HG">HG (High Grade)</option>
                  <option value="RG">RG (Real Grade)</option>
                  <option value="MG">MG (Master Grade)</option>
                  <option value="Tools">อุปกรณ์ (Tools)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  รูปภาพสินค้า (Image)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(e.target.files ? e.target.files[0] : null)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="เช่น มาพร้อมปืนไรเฟิลและโล่..."
                />
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white font-bold py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 flex justify-center items-center gap-2"
              >
                {isUploading ? "กำลังอัปโหลดข้อมูล..." : "บันทึกสินค้า"}
              </button>
            </form>
          </div>

          {/* --- ตารางแสดงสินค้า (ขวา) --- */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                สินค้าในระบบทั้งหมด ({products.length} รายการ)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 transition-colors">
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                      รูป
                    </th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                      ชื่อสินค้า
                    </th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                      ราคา
                    </th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                      สต็อก
                    </th>
                    {/* 🌟 รวบช่องปุ่มจัดการให้เป็นคอลัมน์เดียว */}
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="p-4">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                        {p.name}
                      </td>
                      <td className="p-4 text-blue-600 dark:text-blue-400 font-bold">
                        ฿{p.price.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            p.stock > 5
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {p.stock} ชิ้น
                        </span>
                      </td>

                      {/* 🌟 รวมปุ่ม ลบ, ลด, เพิ่ม ไว้ในช่องเดียวกันแบบสวยๆ */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateStock(p.id, p.stock - 1)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="ลดสต็อก"
                          >
                            <Minus className="w-4 h-4 text-orange-500" />
                          </button>
                          <button
                            onClick={() => handleUpdateStock(p.id, p.stock + 1)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="เพิ่มสต็อก"
                          >
                            <PlusCircle className="w-4 h-4 text-green-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors ml-2"
                            title="ลบสินค้า"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        ยังไม่มีสินค้าในระบบ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
