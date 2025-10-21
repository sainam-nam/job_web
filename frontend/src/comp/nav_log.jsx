import { Link, useNavigate } from "react-router-dom";

export default function Navbar_login(){
  const navigate = useNavigate();
    return(
        <div className="navbar bg-[#8E80FF] shadow-md" >
        <div className="flex-1">
            <Link to="/" className="inline-block">
                  <img
                  src="/logo jv.png"
                  alt="Logo"
                  className="w-8 h-8 md:w-25 md:h-25 ml-2 object-cover rounded-xl"
                  />
                </Link>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/login")} className="btn btn-xs md:btn-sm xl:btn-md text-[#8E80FF] bg-white border-white rounded-box">เข้าสู่ระบบ</button>
          <button onClick={() => navigate("/Register")} className="btn btn-xs md:btn-sm xl:btn-md bg-[#8E79F8] border-white rounded-box">ลงทะเบียน</button>
        </div>
      </div>
    )
}