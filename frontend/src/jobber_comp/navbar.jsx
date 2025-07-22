import { Link } from "react-router-dom"
import Logout from "../comp/logout"
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user }){
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const handleMenuClick = async (type) => {
    try {
      const res = await fetch(`${apiUrl}/api/profile_check/${type}?jobber_id=${user.jobber_id}`); // เช่น personal, education
      const data = await res.json();

      if (data.exists) {
        navigate(`/profile/${type}/view`);
      } else {
        navigate(`/profile/${type}/edit`);
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาด", err);
    }
  };
    
    return(
      <div>
        
          <div className="navbar bg-[#7B6ADA] border-[#7B6ADA]" >
            <div className="flex-none">
              <div className="flex items-center">
                
                <a className="text-sm md:text-xl font-bold ml-2 md:ml-3">JOB & VOLUN</a>
              </div>
            </div>
            <div className="flex-1">
          
              <ul className="hidden md:menu md:menu-horizontal md:px-1 md:text-xs">
                    <li><Link to="/User/alljob" className="font-bold">หน้าหลัก</Link></li>
                    <li><Link to="/user_job" >งาน</Link></li>
                    <li><Link to="/user_volunteer">กิจกรรมจิตอาสา</Link></li>
                    <li><Link to="/user_match">การจับคู๋</Link></li>
                  </ul>
                  
            </div>
            <div className="flex">
              <ul className="menu menu-horizontal justify-center items-center gap-x-0">
                <li className="">
                  <div className="">
                        {user.fullname}
                  </div>
                </li>
                <li className="" onClick={() => handleMenuClick("info")}>
                  <div className="avatar">
                      <div className="w-5 h-5 rounded-full" >
                        
                        {user.picture ? (
                          <img src={`/uploads/${user.picture}`} width={150} />
                        ) : (
                          <img src={`/uploads/nophoto.png`} width={150} />
                        )}
                        
                      </div>
                  </div>
                </li>
                <li className="">
                  <div className="w-11">
                        <Link><img src="/noti.png"></img></Link>
                  </div>
                </li>
                <li className="">
                  <Logout />
                </li>
              </ul>
            </div>
          </div>
        </div>
    )
}