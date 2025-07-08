import { useNavigate } from "react-router-dom";

export default function Navbar_Belogin(){
  const navigate = useNavigate();
    return(
      <div className="navbar bg-[#7B6ADA] shadow-md" >
        <div className="flex-none">
          <a className="text-white font-bold text-md">JOB & VOLUN</a>
             
        </div>
        <div className="flex-1">
          
          <ul className="hidden md:menu md:menu-horizontal md:px-1 md:text-xs">
                <li><a className="font-bold">หน้าหลัก</a></li>
                <li><a>งาน</a></li>
                <li><a>กิจกรรมจิตอาสา</a></li>
                <li><a>การจับคู๋</a></li>
              </ul>
              
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/login")} className="btn btn-xs md:btn-sm bg-[#7B6ADA] border-white rounded-box">เข้าสู่ระบบ</button>
          <button onClick={() => navigate("/Register")} className="btn btn-xs md:btn-sm bg-[#7B6ADA] border-white rounded-box">ลงทะเบียน</button>
        </div>
      </div>
      
    )
}