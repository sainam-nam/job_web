import { Link } from "react-router-dom";

export default function Menu_xs() {
    return(
        
        <div className="drawer">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                {/* Page content here */}
                <label htmlFor="my-drawer" ><img src="/menu.png"></img></label>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu bg-[#7B6ADA] text-base-content min-h-full w-70 p-4">
                {/* Sidebar content here */}
                    <li><Link to="/Admin/Dashboard" className="text-lg hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">หน้าหลัก</Link></li>
                    <li><Link to="/Admin/jobber" className="text-lg hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลผู้สมัครงานและจิตอาสา</Link></li>
                    <li><Link to="/Admin/emp" className="text-lg hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลนายจ้างและผู้จัดกิจกรรม</Link></li>
                    <li><Link to="/Admin/job" className="text-lg hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลงาน</Link></li>
                    <li><Link to="/Admin/volun" className="text-lg hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลกิจกรรมจิตอาสา</Link></li>
                    <li><Link to="/Admin/position" className="text-lg hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลตำแหน่งงาน</Link></li>
                    <li><Link to="/Admin/jobtype" className="text-lg hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลประเภทงาน</Link></li>
                    <li><Link to="/Admin/voluntype" className="text-lg hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลประเภทกิจกรรมจิตอาสา</Link></li>
                    <li><Link to="/Admin/HS" className="text-lg hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ทักษะและความสามารถพิเศษ</Link></li>
                    <li><Link to="/Admin/SS" className="text-lg hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ทักษะส่วนบุคคล</Link></li>
                </ul>
            </div>
        </div>
      
      
    )
}