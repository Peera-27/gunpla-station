/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. รับไฟล์รูปสลิปจากหน้าเว็บของเรา
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์สลิป' }, { status: 400 });
    }

    // 2. เตรียมข้อมูลเพื่อส่งต่อไปให้ EasySlip
    const easySlipFormData = new FormData();
    easySlipFormData.append('file', file);

    // 3. ยิง API ไปที่ EasySlip พร้อมแนบ API Key ของเรา
    const response = await fetch('https://developer.easyslip.com/api/v1/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EASYSLIP_API_KEY}`,
      },
      body: easySlipFormData,
    });

    const data = await response.json();

    // 4. ส่งผลลัพธ์กลับไปให้หน้าเว็บ
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: 'ระบบตรวจสอบสลิปมีปัญหา' }, { status: 500 });
  }
}