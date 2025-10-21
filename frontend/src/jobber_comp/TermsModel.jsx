import React from "react";

export default function TermsModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0  backdrop-blur-xs z-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto relative">
        <center>
            <div className="flex items-center rounded-4xl justify-center bg-[#8E80FF] w-2/3 p-4">
                <h2 className="text-xl  text-white font-bold">เงื่อนไขข้อตกลงและนโยบายความเป็นส่วนตัว</h2>
            </div>
        </center>
        <h3 className="text-lg font-semibold mt-4 text-[#8E80FF]">1. การยอมรับเงื่อนไข</h3>
        <p className="text-sm text-gray-700 pl-5">
          การเข้าใช้งานเว็บไซต์ "ระบบจัดหางานและจิตอาสาภายในชุมชน (Job & Volun)" ถือว่าผู้ใช้ยอมรับเงื่อนไขทั้งหมดที่ระบุไว้ 
        </p>
        <center><a className="text-error">หากคุณไม่เห็นด้วย กรุณายุติการใช้งานทันที</a></center>

        <h3 className="text-lg font-semibold mt-4 text-[#8E80FF]">2. การสมัครสมาชิกและบัญชีผู้ใช้</h3>
        <p className="text-sm text-gray-700 pl-5">
          ผู้ใช้ต้องให้ข้อมูลที่ถูกต้องและเป็นปัจจุบันในการสมัครสมาชิก ระบบมีบัญชี 2 ประเภท: นายจ้าง และ ผู้หางาน/จิตอาสา โดยนายจ้างสามารถโพสต์งานหรือกิจกรรมจิตอาสาได้
        </p>

        <h3 className="text-lg font-semibold mt-4 text-[#8E80FF]">3. การใช้งานที่ไม่เหมาะสม</h3>
        <p className="text-sm text-gray-700 pl-5">
          ห้ามใช้เว็บไซต์เพื่อโพสต์เนื้อหาที่ไม่เหมาะสม ผิดกฎหมาย หรือไม่สุภาพ ระบบมีสิทธิ์ระงับบัญชีผู้ใช้ หรือเนื้อหาที่ไม่เหมาะสมโดยไม่จำเป็นต้องแจ้งล่วงหน้า
        </p>

        <h3 className="text-lg font-semibold mt-4 text-[#8E80FF]">4. ความรับผิดชอบของผู้ใช้</h3>
        <p className="text-sm text-gray-700 pl-5">
          ผู้ใช้ต้องรับผิดชอบต่อข้อมูลที่ตนโพสต์และกิจกรรมที่เข้าร่วม หากเกิดความเสียหายจากการใช้งาน ผู้ใช้อาจต้องรับผิดชอบตามกฎหมาย
        </p>

        <hr className="my-4  text-[#8E80FF]" />

        <h3 className="text-lg font-semibold mt-4 text-[#8E80FF]">นโยบายความเป็นส่วนตัว</h3>

        <h4 className="font-semibold mt-2 text-[#8E80FF]">1. ข้อมูลที่เราเก็บ</h4>
        <p className="text-sm text-gray-700 pl-5">
          เช่น ชื่อ, เพศ, วันเกิด, เบอร์โทร, อีเมล, ที่อยู่, รูปภาพ, พิกัด, การศึกษา, การทำงาน, ข้อมูลการสมัครงานและจิตอาสา
        </p>

        <h4 className="font-semibold mt-2 text-[#8E80FF]">2. วัตถุประสงค์ของการเก็บข้อมูล</h4>
        <p className="text-sm text-gray-700 pl-5">
          ใช้ในการจับคู่งาน/กิจกรรม, พัฒนาบริการ, ติดต่อสื่อสาร
        </p>

        <h4 className="font-semibold mt-2 text-[#8E80FF]">3. การเก็บรักษาข้อมูล</h4>
        <p className="text-sm text-gray-700 pl-5">
          ข้อมูลของผู้ใช้จะถูกจัดเก็บไว้ในระบบภายในของเว็บไซต์ Job & Volun ซึ่งจัดการโดยทีมพัฒนาโครงการ โดยจะไม่เปิดเผยต่อบุคคลภายนอก เว้นแต่ได้รับความยินยอม หรือเป็นไปตามกฎหมาย
        </p>

        <h4 className="font-semibold mt-2 text-[#8E80FF]">4. สิทธิของผู้ใช้</h4>
        <p className="text-sm text-gray-700 pl-5">
          ผู้ใช้สามารถเข้าถึง แก้ไข หรือลบบัญชีของตนเองได้ และสามารถร้องขอให้ลบข้อมูลส่วนตัวได้ตลอดเวลา
        </p>

        <h4 className="font-semibold mt-2 text-[#8E80FF]">5. ความปลอดภัยของข้อมูล</h4>
        <p className="text-sm text-gray-700 pl-5">
          มีมาตรการป้องกันการเข้าถึงหรือใช้ข้อมูลโดยไม่ได้รับอนุญาต
        </p>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-[#8E80FF] hover:text-white rounded-xl bg-white text-[#8E80FF] border border-3 border-[#8E80FF]"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
