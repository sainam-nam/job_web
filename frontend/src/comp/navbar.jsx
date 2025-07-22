import { Link } from "react-router-dom"
import Logout from "./logout"

export default function Navbar({ user }){
    return(
      <div className="drawer">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        
        <div className="drawer-content">
          <div className="navbar bg-[#7B6ADA] border-[#7B6ADA] pr-5" >
            <div className="flex-none">
              <div className="flex items-center">
                <div className="tooltip tooltip-bottom" data-tip="เมนู">
                  <label htmlFor="my-drawer" className="btn btn-xs btn-ghost hover:bg-[#7B6ADA] hover:border-[#7B6ADA] lg:hidden ">
                    <img className="w-3 h-3 md:w-5 md:h-5" src="/menu.png"></img>
                  </label>
                </div>
                <a className="text-sm md:text-xl font-bold md:ml-3">JOB & VOLUN</a>

              </div>
            </div>
            <div className="flex-1">
              <ul className="hidden md:menu md:menu-horizontal md:px-1 md:text-xs">
                    <li><Link to="/Admin" className="font-bold">หน้าหลัก</Link></li>
              </ul>
                  
            
            </div>
            <div className="flex gap-2">
              <ul className="menu menu-horizontal px-1 text-xs  justify-center items-center gap-x-0">
                <li className="">
                  <div className="">
                        Admin : {user.fullname}
                  </div>
                </li>
                <div className="tooltip tooltip-bottom" data-tip="โปรไฟล์">
                  <li className="">
                    <div className="avatar">
                        <div className="w-5 h-5 rounded-full">
                          <Link to="/profile">
                          {/* <a>{user.fullname}</a> */}
                          {user.picture ? (
                            <img src={`/uploads/${user.picture}`} width={150} />
                          ) : (
                            <img src={`/uploads/nophoto.png`} width={150} />
                          )}
                          </Link>
                        </div>
                    </div>
                  </li>
                </div>
                <div className="tooltip tooltip-bottom" data-tip="ออกจากระบบ">
                  <li className="w-8">
                    <Logout />
                  </li>
                </div>
              </ul>
            </div>
          </div>
        </div>          
        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay " ></label>

        <div className="drawer-side z-50" onClick={() => document.getElementById("my-drawer").checked = false}>
          <ul className="menu bg-[#7B6ADA] text-base-content min-h-full w-1/2 md:w-70 p-3">
            <div className="text-xs">
              <li><Link to="/Admin/Dashboard" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">หน้าหลัก</Link></li>
              <li><Link to="/Admin/jobber" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลผู้สมัครงานและจิตอาสา</Link></li>
              <li><Link to="/Admin/emp" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลนายจ้างและผู้จัดกิจกรรม</Link></li>
              <li><Link to="/Admin/jjob" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลงาน</Link></li>
              <li><Link to="/Admin/vvolun" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลกิจกรรมจิตอาสา</Link></li>
              <li><Link to="/Admin/position" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลตำแหน่งงาน</Link></li>
              <li><Link to="/Admin/jobtype" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลประเภทงาน</Link></li>
              <li><Link to="/Admin/voluntype" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลประเภทกิจกรรมจิตอาสา</Link></li>
              <li><Link to="/Admin/HS" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ทักษะด้านความรู้</Link></li>
              <li><Link to="/Admin/SS" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ทักษะด้านอารมณ์</Link></li>
            </div>
          </ul>
        </div>
      </div>
    )
}