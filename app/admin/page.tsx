/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Trash2, PlusCircle, ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [checking, setChecking] = useState(true);

  // State สำหรับฟอร์มเพิ่มสินค้า
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState(""); // 👈 เติมบรรทัดนี้s

  // ฟังก์ชันดึงข้อมูลสินค้า
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setProducts(data || []);
  };

  // 1. ตรวจสอบสิทธิ์ Admin (ถ้าไม่ใช่ ให้เตะกลับหน้าแรก)
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      const email = session.user.email;
      if (email === "admin@gmail.com" || email === "crbrsonline@gmail.com") {
        fetchProducts(); // ถ้าเป็นแอดมิน ให้ดึงข้อมูลสินค้ามาโชว์
      } else {
        router.push("/"); // ถ้าไม่ใช่แอดมิน เตะกลับหน้าแรก
      }
      setChecking(false);
    };
    checkAdmin();
  }, [router]);

  // 2. ฟังก์ชันเพิ่มสินค้า
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("products").insert([
      {
        name,
        price: Number(price),
        stock: Number(stock),
        image_url: imageUrl,
        description, // 👈 เพิ่ม description เข้าไปในฐานข้อมูล
      },
    ]);

    if (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } else {
      alert("เพิ่มสินค้าเรียบร้อยแล้ว!");
      // ล้างค่าในฟอร์ม
      setName("");
      setPrice("");
      setStock("");
      setImageUrl("");
      setDescription(""); // 👈 ล้างค่าใน description

      fetchProducts(); // อัปเดตตาราง
    }
  };

  // 3. ฟังก์ชันลบสินค้า
  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("ลบไม่สำเร็จ: " + error.message);
    } else {
      fetchProducts(); // อัปเดตตาราง
    }
  };

  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* หัวหน้าเว็บ */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              ระบบจัดการสต็อก (Admin Panel)
            </h1>
            <p className="text-gray-500 mt-1">
              เพิ่ม แก้ไข และลบ สินค้าในร้าน Gunpla Station
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> กลับหน้าร้านค้า
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- ฟอร์มเพิ่มสินค้า (ซ้าย) --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <PlusCircle className="text-green-500" /> เพิ่มสินค้าใหม่
            </h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อสินค้า (Name)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น HG Aerial"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ราคา (Price)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="฿"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    จำนวน (Stock)
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="ชิ้น"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ลิงก์รูปภาพ (Image URL)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  รายละเอียดสินค้า (Description)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น มาพร้อมปืนไรเฟิลและโล่..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                บันทึกสินค้า
              </button>
            </form>
          </div>

          {/* --- ตารางแสดงสินค้า (ขวา) --- */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold">
                สินค้าในระบบทั้งหมด ({products.length} รายการ)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b">
                    <th className="p-4 font-semibold text-gray-600">รูป</th>
                    <th className="p-4 font-semibold text-gray-600">
                      ชื่อสินค้า
                    </th>
                    <th className="p-4 font-semibold text-gray-600">ราคา</th>
                    <th className="p-4 font-semibold text-gray-600">สต็อก</th>
                    <th className="p-4 font-semibold text-gray-600 text-center">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {p.name}
                      </td>
                      <td className="p-4 text-blue-600 font-bold">
                        ฿{p.price}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock > 5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {p.stock} ชิ้น
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบสินค้า"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
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
