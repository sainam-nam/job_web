import { useNavigate } from "react-router-dom";

export default function Navbar_regis(){
  const navigate = useNavigate();
    return(
        <div className="navbar bg-[#7B6ADA] shadow-md" >
        <div className="flex-1">
          <a onClick={() => navigate("/")} className="text-white font-bold text-md">JOB & VOLUN</a>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/login")} className="btn btn-xs md:btn-sm bg-[#7B6ADA] border-white rounded-box">เข้าสู่ระบบ</button>
          <button onClick={() => navigate("/Register")} className="btn btn-xs md:btn-sm text-[#7B6ADA] bg-white border-white rounded-box">ลงทะเบียน</button>
        </div>
      </div>
    )
}