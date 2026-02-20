// ไฟล์: components/Footer.tsx

export default function Footer() {
  return (
    // เปลี่ยน mt-20 เป็น mt-auto และใส่ w-full
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="font-bold text-xl text-white">GUNPLA STATION</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            ร้านขายโมเดลกันดั้มและอุปกรณ์ครบวงจร <br />
            ต่อความสุข ให้เป็นรูปร่าง <br />
            การันตีของแท้ 100% แพ็คแน่นหนา ส่งไวทั่วไทย
          </p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">บริการลูกค้า</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                วิธีการสั่งซื้อ / Pre-order
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                แจ้งชำระเงิน
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                ติดตามพัสดุ (Tracking)
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                นโยบายการเคลมสินค้า
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">ติดต่อเรา</h3>
          <p className="text-sm text-gray-400 mb-2">
            📍 Gunpla Station ดาวอังคาร
          </p>
          <p className="text-sm text-gray-400 mb-2">📞 0123456789</p>
          <p className="text-sm text-gray-400">💬 Line: @gunplastation</p>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
        © 2026 Gunpla Station. All rights reserved. (Computer Science Project)
      </div>
    </footer>
  );
}
