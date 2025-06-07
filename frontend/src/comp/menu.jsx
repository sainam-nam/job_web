import { Link } from "react-router-dom";

export default function Menu() {
    return(
        <aside className="w-64 bg-white p-4">
        <ul className="menu bg-white rounded-3xl shadow-md w-61 ">
          <li><Link to="/Admin/Dashboard" className="text-purple-600 text-lg hover:bg-gray-300 rounded-full">หน้าหลัก</Link></li>
          <li><Link to="/Admin/jobber" className="text-purple-600 text-lg hover:bg-gray-300 rounded-full">ข้อมูลผู้สมัครงานและจิตอาสา</Link></li>
          <li><Link to="/Admin/emp" className="text-purple-600 text-lg hover:bg-gray-300 rounded-full">ข้อมูลนายจ้างและผู้จัดกิจกรรม</Link></li>
          <li><Link to="/Admin/job" className="text-purple-600 text-lg hover:bg-gray-300 rounded-full">ข้อมูลงาน</Link></li>
          <li><Link to="/Admin/volun" className="text-purple-600 text-lg hover:bg-gray-300 rounded-full">ข้อมูลกิจกรรมจิตอาสา</Link></li>
          <li><Link to="/Admin/position" className="text-purple-600 text-lg hover:bg-gray-300 rounded-full">ข้อมูลตำแหน่งงาน</Link></li>
          <li><Link to="/Admin/jobtype" className="text-purple-600 text-lg hover:bg-gray-300 rounded-full">ข้อมูลประเภทงาน</Link></li>
          <li><Link to="/Admin/voluntype" className="text-purple-600 text-lg hover:bg-gray-300 rounded-full">ข้อมูลประเภทกิจกรรมจิตอาสา</Link></li>
          <li><Link to="/Admin/HS" className="text-purple-600 text-lg hover:bg-gray-300 rounded-full">ทักษะและความสามารถพิเศษ</Link></li>
          <li><Link to="/Admin/SS" className="text-purple-600 text-lg hover:bg-gray-300 rounded-full">ทักษะส่วนบุคคล</Link></li>
        </ul>
      </aside>
    )
}