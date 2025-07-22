import { MapView } from './map_view';
import { Link ,useLocation } from "react-router-dom";

export default function Footer(){
    const name = "CRRU";
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
        <div className='p-3'>
            <footer className="footer footer-horizontal footer-center  md:footer md:footer-vertical bg-[#7B6ADA] text-base-content py-5">
                <nav className='hidden md:w-6/7 md:block'>
                    <h6 className="footer-title">ระบบจัดหางานและจิตอาสาภายในชุมชน</h6>
                    <MapView latitude={19.980644039550587} longitude={99.85034695655237} name={name} h={"200px"} />
                    <table className="table-auto text-left text-[8px] md:text-xs w-full">
                        <tbody>
                            <tr className="">
                            <td className="p-1">เวลาทำการ</td>
                            <td className="p-1">ทุกวัน 10:00 - 19:00 น.</td>
                            </tr>
                            <tr className="">
                            <td className="p-1">ติดต่อสอบถาม</td>
                            <td className="p-1">jobvolun.service@gmail.com</td>
                            </tr>
                            <tr className="">
                            <td className="p-1">โทร</td>
                            <td className="p-1">097-145-4xxx</td>
                            </tr>
                            <tr>
                            <td className="p-1">ที่อยู่</td>
                            <td className="p-1">111 ม.11 ต.บ้านดู่ อ.เมืองเชียงราย จ.เชียงราย 57110</td>
                            </tr>
                        </tbody>
                        </table>

                </nav>
                <nav>
                    <h6 className="footer-title">เมนู</h6>
                        <div className='flex flex-col items-start gap-3'>
                            {menuItems.map((item) => (
                                
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={` text-[#D9D9D9] link link-hover ${
                                    isActive(item.to) ? "font-bold" : ""
                                    }`}
                                >
                                    {item.label}
                                </Link>
                                
                            ))}
                            <a className="link link-hover">เงื่อนไขและความเป็นส่วนตัว</a>
                        </div>
                </nav>
                
                <nav className='w-2/3 md:hidden'>
                    <h6 className="footer-title">แผนที่</h6>
                    <MapView latitude={19.980644039550587} longitude={99.85034695655237} name={name} />
                    <table className="table-auto text-left text-xs w-full">
                        <tbody>
                            <tr className="">
                            <td className="p-2 w-1/3">เวลาทำการ</td>
                            <td className="p-2">ทุกวัน 10:00 - 19:00 น.</td>
                            </tr>
                            <tr className="">
                            <td className="p-2">ติดต่อสอบถาม</td>
                            <td className="p-2">jobvolun.service@gmail.com</td>
                            </tr>
                            <tr className="">
                            <td className="p-2">โทร</td>
                            <td className="p-2">097-145-4xxx</td>
                            </tr>
                            <tr>
                            <td className="p-2">ที่อยู่</td>
                            <td className="p-2">111 ม.11 ต.บ้านดู่ อ.เมืองเชียงราย จ.เชียงราย 57110</td>
                            </tr>
                        </tbody>
                        </table>

                </nav>
                
                
            </footer>
            <div className='flex flex-col items-center w-full gap-2'>
                    <hr className="w-9/10 border border-[#D9D9D9]" />
                    <p className='text-[10px] md:text-xs '>Copyright © {new Date().getFullYear()} - Sainatee Saeyang</p>
            </div>
        </div>
    )
}