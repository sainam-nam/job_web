import { Link } from "react-router-dom"

export default function Navbar(){
    return(
      <div className="drawer">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        
        <div className="drawer-content">
          <div className="navbar bg-[#7B6ADA] border-[#7B6ADA]" >
            <div className="flex-1">
              <div className="flex items-center">
                <label htmlFor="my-drawer" className="btn btn-xs btn-ghost hover:bg-[#7B6ADA] hover:border-[#7B6ADA] md:hidden ">
                  <img className="w-3 h-3 md:w-5 md:h-5" src="/menu.png"></img>
                </label>
                <a className="text-sm md:text-xl font-bold md:ml-3">JOB & VOLUN</a>
              </div>
            </div>
            
            <div className="flex-none">
              <ul className="menu menu-horizontal px-1 text-xs">
                <li><a>Link</a></li>
                <li>
                  <details>
                    <summary>Parent</summary>
                    <ul className="bg-[#7B6ADA] rounded-t-none p-2">
                      <li><a>Link 1</a></li>
                      <li><a>Link 2</a></li>
                    </ul>
                  </details>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="drawer-side z-50" onClick={() => document.getElementById("my-drawer").checked = false}>
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu bg-[#7B6ADA] text-base-content min-h-full w-1/2 md:w-70 p-3">
            <div className="text-xs">
              <li><Link to="/Admin/Dashboard" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">หน้าหลัก</Link></li>
              <li><Link to="/Admin/jobber" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลผู้สมัครงานและจิตอาสา</Link></li>
              <li><Link to="/Admin/emp" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลนายจ้างและผู้จัดกิจกรรม</Link></li>
              <li><Link to="/Admin/job" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลงาน</Link></li>
              <li><Link to="/Admin/volun" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลกิจกรรมจิตอาสา</Link></li>
              <li><Link to="/Admin/position" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลตำแหน่งงาน</Link></li>
              <li><Link to="/Admin/jobtype" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลประเภทงาน</Link></li>
              <li><Link to="/Admin/voluntype" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ข้อมูลประเภทกิจกรรมจิตอาสา</Link></li>
              <li><Link to="/Admin/HS" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ทักษะและความสามารถพิเศษ</Link></li>
              <li><Link to="/Admin/SS" className="hover:bg-gray-300 hover:text-[#7B6ADA] rounded-full">ทักษะส่วนบุคคล</Link></li>
            </div>
          </ul>
        </div>
      </div>
    )
}