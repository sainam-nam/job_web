import { Link ,useLocation } from "react-router-dom";

export default function Menu() {
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path);

    const menuItems = [
      { label: "หน้าหลัก", to: "/Admin/Dashboard" },
      { label: "ข้อมูลผู้สมัครงานและจิตอาสา", to: "/Admin/jobber" },
      { label: "ข้อมูลนายจ้างและผู้จัดกิจกรรม", to: "/Admin/emp" },
      { label: "ข้อมูลงาน", to: "/Admin/jjob" },
      { label: "ข้อมูลกิจกรรมจิตอาสา", to: "/Admin/vvolun" },
      { label: "ข้อมูลตำแหน่งงาน", to: "/Admin/position" },
      { label: "ข้อมูลประเภทงาน", to: "/Admin/jobtype" },
      { label: "ข้อมูลประเภทกิจกรรมจิตอาสา", to: "/Admin/voluntype" },
      { label: "ทักษะด้านความรู้", to: "/Admin/HS" },
      { label: "ทักษะด้านอารมณ์", to: "/Admin/SS" },
    ];
    return(
        <aside className="w-75 bg-white p-4">
        <ul className="menu bg-white rounded-3xl shadow-md w-full ">
          {/* <li><Link to="/Admin/Dashboard" className="font-bold text-[#7B6ADA] text-lg hover:bg-[#D9D9D9] rounded-full">หน้าหลัก</Link></li>
          <li><Link to="/Admin/jobber" className="font-bold text-[#7B6ADA] text-lg hover:bg-[#D9D9D9] rounded-full">ข้อมูลผู้สมัครงานและจิตอาสา</Link></li>
          <li><Link to="/Admin/emp" className="font-bold text-[#7B6ADA] text-lg hover:bg-[#D9D9D9] rounded-full">ข้อมูลนายจ้างและผู้จัดกิจกรรม</Link></li>
          <li><Link to="/Admin/job" className="font-bold text-[#7B6ADA] text-lg hover:bg-[#D9D9D9] rounded-full">ข้อมูลงาน</Link></li>
          <li><Link to="/Admin/volun" className="font-bold text-[#7B6ADA] text-lg hover:bg-[#D9D9D9] rounded-full">ข้อมูลกิจกรรมจิตอาสา</Link></li>
          <li><Link to="/Admin/position" className="font-bold text-[#7B6ADA] text-lg hover:bg-[#D9D9D9] rounded-full">ข้อมูลตำแหน่งงาน</Link></li>
          <li><Link to="/Admin/jobtype" className="font-bold text-[#7B6ADA] text-lg hover:bg-[#D9D9D9] rounded-full">ข้อมูลประเภทงาน</Link></li>
          <li><Link to="/Admin/voluntype" className="font-bold text-[#7B6ADA] text-lg hover:bg-[#D9D9D9] rounded-full">ข้อมูลประเภทกิจกรรมจิตอาสา</Link></li>
          <li><Link to="/Admin/HS" className="font-bold text-[#7B6ADA] text-lg hover:bg-[#D9D9D9] rounded-full">ทักษะด้านความรู้</Link></li>
          <li><Link to="/Admin/SS" className="font-bold text-[#7B6ADA] text-lg hover:bg-[#D9D9D9] rounded-full">ทักษะด้านอารมณ์</Link></li> */}
          {menuItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`font-bold text-[#7B6ADA] text-lg rounded-full hover:bg-[#D9D9D9] ${
                  isActive(item.to) ? "bg-[#D9D9D9]" : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    )
}