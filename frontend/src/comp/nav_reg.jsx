import { useNavigate } from "react-router-dom";

export default function Navbar_regis(){
  const navigate = useNavigate();
    return(
        <div className="navbar bg-white shadow-md" >
        <div className="flex-1">
          <a className="text-[#7B6ADA] font-bold text-md">JOB & VOLUN</a>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/login")} className="btn btn-outline text-[#7B6ADA] btn-sm border-[#7B6ADA] rounded-box">เข้าสู่ระบบ</button>
          <button onClick={() => navigate("/Register")} className="btn btn-sm bg-[#7B6ADA] border-[#7B6ADA] rounded-box">ลงทะเบียน</button>
        </div>
      </div>
    )
}