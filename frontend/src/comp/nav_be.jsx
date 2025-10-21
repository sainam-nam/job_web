import { Link, useNavigate } from "react-router-dom";

export default function Navbar_Belogin(){
  const navigate = useNavigate();
    return(
      <div className="navbar bg-[#8E80FF] shadow-md" >
        <div className="flex-none">
          {/* <a className="text-white font-bold text-md xl:text-xl">JOB & VOLUN</a> */}
          <Link to="/Admin" className="inline-block">
                  <img
                  src="/logo jv.png"
                  alt="Logo"
                  className="w-8 h-8 md:w-25 md:h-25 ml-2 object-cover rounded-xl"
                  />
                </Link>
        </div>
        <div className="flex-1">
          
          <ul className="hidden md:menu md:menu-horizontal md:px-3 md:text-xs xl:text-sm">
                {/* <li><a className="font-bold">หน้าหลัก</a></li> */}
                <li><a>งาน</a></li>
                <li><a>กิจกรรมจิตอาสา</a></li>
                {/* <li><a>การจับคู๋</a></li> */}
              </ul>
              
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/login")} className="btn btn-xs md:btn-sm xl:btn-md bg-[#8E80FF] border-white rounded-box hover:bg-white hover:text-[#8E80FF]">เข้าสู่ระบบ</button>
          <button onClick={() => navigate("/Register")} className="btn btn-xs md:btn-sm xl:btn-md bg-[#8E80FF] border-white rounded-box hover:bg-white hover:text-[#8E80FF]">ลงทะเบียน</button>
        </div>
      </div>
      
    )
}