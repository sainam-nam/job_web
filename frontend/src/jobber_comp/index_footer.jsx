
import { Link ,useLocation } from "react-router-dom";
import { MapView } from "../comp/map_view";
import { useState , useEffect } from "react";

export default function Index_Footer(){
    const name = "CRRU";
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [contactName, setContactName] = useState("");
    const [contactMessage, setContactMessage] = useState("");
    const [sendStatus, setSendStatus] = useState("");
    const [isSending, setIsSending] = useState(false);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [showModal, setShowModal] = useState(false);

    const isActive = (path) => location.pathname.startsWith(path);

       

    const menuItems = [
      { label: "งาน", to: "/User/alljob" },
      { label: "กิจกรรมจิตอาสา", to: "/user_match" },
      
    ];
    
    return(
        <div className='p-3 bg-[#8E80FF]'>
            <footer className="footer footer-horizontal footer-center  md:footer md:footer-vertical bg-[#8E80FF] text-base-content py-5">
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
                            
                        </div>
                </nav>
                <nav>
                    <h6 className="footer-title">ติดต่อหรือเสนอแนะ</h6>
                        <div className='flex flex-col items-end gap-3'>
                            <form
                                // onSubmit={handleContactSubmit}
                                className="flex flex-col items-end gap-2 w-[250px]"
                            >
                                <input
                                    type="text"
                                    placeholder="ชื่อของคุณ"
                                    // value={contactName}
                                    // onChange={(e) => setContactName(e.target.value)}
                                    className="input input-bordered bg-[#8E80FF] border-white w-full text-white text-sm rounded-xl"
                                    required
                                />
                                <textarea
                                    placeholder="รายละเอียดที่ต้องการติดต่อหรือเสนอแนะ"
                                    // value={contactMessage}
                                    // onChange={(e) => setContactMessage(e.target.value)}
                                    className="textarea textarea-bordered bg-[#8E80FF] border-white w-full text-white h-50 text-sm rounded-xl"
                                    required
                                />
                                <div className="flex items-center">
                                    {/* {isSending && <p className="text-sm text-white">กำลังส่ง...</p>}
                                    {sendStatus && !isSending && (
                                        
                                        <p className="text-sm text-white">{sendStatus}</p>

                                    )} */}
                                    <button type="submit" className="btn btn-sm btn-outline text-white rounded-xl ">
                                        ส่งข้อความ
                                    </button>
                                </div>
                                    

                            </form>
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