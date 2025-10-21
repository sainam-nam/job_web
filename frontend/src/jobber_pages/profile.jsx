import React, { useState , useEffect} from 'react'
import Navbar from '../jobber_comp/navbar'
import Footer from '../jobber_comp/footer'
import JobbRating from '../jobber_comp/jobb_star'
import { jwtDecode } from "jwt-decode";
import { Outlet } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSearch } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export const Profile = () => {
    const [data, setData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const location = useLocation();
    
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [profileStatusCode, setProfileStatusCode] = useState("00000");
    const currentPath  = location.pathname.split("/").slice(2, 3).join("/");


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
        // ถ้าไม่มี token อาจ redirect ไป login

        window.location.href = "/login";
        return;
        }

        axios.get(`${apiUrl}/jobber_profile`, {
        headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
        setUserData(res.data.user);
        setUserId(res.data.user.jobber_id);
        //console.log(res.data.user.jobber_id);
        })
        .catch(err => {
        console.error(err);
        // token หมดอายุหรือไม่ถูกต้อง -> กลับหน้า login
        alert("เกิดข้อผิดพลาด กรุณาเข้าสู่ระบบอีกครั้ง");
        window.location.href = "/login";
        });
        
        
    
      }, []);
      const [closeAll, setCloseAll] = useState(false);

    const profile = async (userId) => {
        try {
        const res = await fetch(`${apiUrl}/user_profile?jobber_id=${userId}`);
        const result = await res.json();

       

        if(Array.isArray(result.data)){
            //console.log("sql", res)
             setCloseAll(result.data.work_status === "JOB");
            setData(result.data);
            //console.log(result.data);
            //   console.log(id);
            } else {
            console.error("Data format error:", result);
            setData([]);
            }
    
        } catch (err) {
        console.error('Fetch error:', err);
        }
    };

    useEffect(() =>{
        if (userId) {
            profile(userId);
        }
        //console.log(location.pathname.split("/").slice(2, 3).join("/"));
    }, [userId , location.pathname , closeAll])

    const handleMenuClick = async (type) => {
    try {
      const res = await fetch(`${apiUrl}/api/profile_check/${type}?jobber_id=${userId}`); // เช่น personal, education
      const data = await res.json();

      if (data.exists) {

        navigate(`/profile/${type}/view`);
      } else {
        navigate(`/profile/${type}/add`);
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาด", err);
    }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0]; // รับไฟล์ที่เลือก
        if (file) {
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file)); // แสดงภาพที่เลือก
        }
    };

    const handleUpload = async () => {

        if (!selectedImage) {
            document.getElementById("up_pic_modal").close();
            return;
        }


        const formData = new FormData();
        formData.append("picture", selectedImage);
        formData.append("jobber_id", userId); // ถ้าต้องการส่ง user ID ไปด้วย

        try {
        const res = await axios.post(`${apiUrl}/api/jobber_up_picture`, formData, {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        });

        //console.log("อัปโหลดสำเร็จ:", res.data);
        await profile(userId); // ให้ refresh ข้อมูลใหม่
        document.getElementById("up_pic_modal").close(); // ปิด modal
        } catch (err) {
        console.error("อัปโหลดล้มเหลว:", err);
        alert("เกิดข้อผิดพลาดในการอัปโหลด");
        }
    };

    useEffect(() =>{
        if (!userId) return;

        const ProfileStatus = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/profile_check_all?jobber_id=${userId}`);
            const data = await res.json();
            if (data.code) {
            setProfileStatusCode(data.code); // ใช้แค่ 4 ตัวแรก เอามา5เลย
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
        };

        ProfileStatus();
    }, [userId ,location])

    const stepLabels = [
        "เริ่มต้นทำความรู้จักกัน!\nข้อมูลส่วนตัว",
        "ข้อมูลการศึกษาต่อเลย",
        "ข้อมูลใกล้ครบถ้วนแล้ว\nข้อมูลการทำงาน",
        "กรอกข้อมูลการสมัครงานเป็นอันเสร็จ"
    ];

    const menuList = [
        { label: "ข้อมูลส่วนตัว", key: "info"},
        { label: "ข้อมูลการศึกษา", key: "edu" },
        { label: "ประสบการณ์ทำงาน", key: "work_ex" },
        { label: "ข้อมูลการสมัครงาน", key: "inter_work" },
        { label: "ข้อมูลการสมัครจิตอาสา", key: "inter_volun" },
        
    ];
    

  return (
    <div>
        {userData && <Navbar user={userData} />}
        <div className='flex flex-col bg-gradient-to-b from-[#8E80FF] to-white min-h-screen'>
            <center><a className='font-bold text-xl'>โปรไฟล์</a></center>
                {/* <div className="dock bg-[#8E80FF] text-white lg:hidden">
                    <button className={menu === "jobber" ? "dock-active" : ""}>
                        <span onClick={() => setMenu("jobber")} className="dock-label">ข้อมูลส่วนตัว</span>
                    </button>

                    <button className={menu === "education" ? "dock-active" : ""}>
                        <span onClick={() => setMenu("education")} className="dock-label">การศึกษา</span>
                    </button>

                    <button className={menu === "work_ex" ? "dock-active" : ""}>
                        <span onClick={() => setMenu("work_ex")} className="dock-label">การทำงาน</span>
                    </button>

                    <button className={menu === "inter_work" ? "dock-active" : ""}>
                        <span onClick={() => setMenu("inter_work")} className="dock-label">การสมัครงาน</span>
                    </button>

                    <button className={menu === "inter_volun" ? "dock-active" : ""}>
                        <span onClick={() => setMenu("inter_volun")} className="dock-label">การสมัคร<br />จิตอาสา</span>
                    </button>

                    <button className={menu === "history" ? "dock-active" : ""}>
                        <span onClick={() => setMenu("history")} className="dock-label">ประวัติการใช้งาน</span>
                    </button>
                </div> */}

            <div className='w-full flex flex-col lg:flex-row gap-6 px-20 py-8 justify-center'>
                <div className='flex flex-col w-1/5 items-center pt-18'>
                    
                        <ul className="menu bg-white w-full text-[#8E80FF] rounded-3xl text-lg items-center">
                            <div className="-mt-20 avatar">
                                <div 
                                    className="w-24 sm:w-28 md:w-35 lg:w-50 h-60 rounded-3xl object-cover"  style={{ boxShadow: '0 0 10px rgba(90, 90, 90, 0.35)' }}
                                    onClick={()=>document.getElementById("up_pic_modal").showModal()}
                                >
                                {data[0]?.picture ? (
                                                <img src={`/uploads/user_pic/${data[0]?.picture}`} />
                                            ) : (
                                                <img src={`/uploads/nophoto.png`}  />
                                            )}
                                </div>
                            </div>
                            <div className='flex flex-col gap-3 items-center py-3 '>
                                <a className='text-xl text-[#8E80FF] font-bold'>{data[0]?.fullname}</a>
                                <a className='text-md text-[#8E80FF]'>{data[0]?.email}</a>
                                {/* ปุ่มสวิตช์ */}
                                    

                                {(data[0]?.work_status) === "JOB" ? (
                                                  <button className="flex items-center justify-center gap-2 bg-green-500 text-white text-xs md:text-sm lg:text-lg font-bold px-4 py-2 rounded-full shadow-md">
                                                    <FaCheckCircle className="text-white" />
                                                    ได้งานแล้ว
                                                  </button>
                                                ) : (
                                                  <button className="flex items-center justify-center gap-2 bg-gray-400 text-white text-xs md:text-sm lg:text-lg font-bold px-4 py-2 rounded-full shadow-md">
                                                    <FaSearch className="text-white" />
                                                    หางานอยู่
                                                  </button>
                                                )}
                                <JobbRating emp_id={userId} cl={"#8E80FF"} />
                            </div>
                            <a className='pt-2 font-bold  border-b-3'>เมนู</a>
                                {/* <li className='py-2 w-full flex justify-center items-center hover:bg-[#D9D9D9] hover:rounded-2xl cursor-pointer' 
                                    onClick={() => handleMenuClick("info")}>
                                        ข้อมูลส่วนตัว
                                </li> */}
                                {menuList.map((item, index) => {
                                    const isIncomplete = profileStatusCode?.[index] === '0';
                                    const isActive = currentPath === item.key;

                                    return (
                                    <li
                                        key={index}
                                        className={`relative py-2 w-full flex justify-center items-center rounded-2xl cursor-pointer ${
                                                        isActive ? 'bg-[#D9D9D9] font-bold' : 'hover:bg-[#D9D9D9]'
                                                    }`}
                                        onClick={() => handleMenuClick(item.key)}
                                    >
                                        {item.label}
                                        
                                        {/* จุดแดงแจ้งเตือน */}
                                        {isIncomplete && (
                                            <div className="absolute top-1 right-3 tooltip tooltip-right" data-tip="ยังไม่ได้กรอก">
                                                <span className=" w-3 h-3 indicator-item status bg-[#FF0004]"></span>
                                            </div>
                                        )}
                                    </li>
                                    );
                                })}
                                {[
                                    { label: "ทักษะด้านความรู้", path: "user/hs" },
                                    { label: "ทักษะด้านอารมณ์", path: "user/ss" },
                                    
                                ].map((item, index) => {
                                const isIncomplete = profileStatusCode?.[5 + index] === '0';
                                const isActive = location.pathname.includes(item.path); // ตรวจจาก URL
                                return (
                                    <li
                                    key={index}
                                    className={`py-2 w-full flex justify-center items-center rounded-2xl cursor-pointer ${
                                        isActive ? "bg-[#D9D9D9] font-bold" : "hover:bg-[#D9D9D9]"
                                    }`}
                                    onClick={() => navigate(item.path)}
                                    >
                                    {item.label}
                                    {/* จุดแดงแจ้งเตือน */}
                                        {isIncomplete && (
                                            <div className="absolute top-1 right-3 tooltip tooltip-right" data-tip="ยังไม่ได้กรอก">
                                                <span className=" w-3 h-3 indicator-item status bg-[#FF0004]"></span>
                                            </div>
                                        )}
                                    </li>
                                );
                                })}
                            {/* ✓ */}
                        </ul>
                </div>
                
                <div className='flex flex-col justify-center w-2/3' >
                    {currentPath != "inter_volun" && currentPath != "user" ? (          
                        <ul className="steps text-white text-[10px]">
                        {stepLabels.map((label, index) => {
                            const isComplete = profileStatusCode?.[index] === '1'; // ตรวจว่า step นั้นสมบูรณ์หรือยัง
                            return (
                            <li
                                key={index}
                                data-content={isComplete ? "✓" : ""}
                                className={`step ${isComplete ? "step-primary" : ""}`}
                            >
                                {label.split('\n').map((line, i) => (
                                <div key={i}>{line}</div> // รองรับการขึ้นบรรทัดใหม่ด้วย \n
                                ))}
                            </li>
                            );
                        })}
                        </ul>
                    ) : (
                        <div>
                            {currentPath == "user" ? (
                                ""
                            ) : (
                                <div className='flex justify-end mb-18'>
                                    <img src="/volun.png" className='z-10 w-2/5 -mb-35 -mt-20' />
                                </div>
                            )}
                                

                        </div>
                    )}  
                    <div className='flex-1 justify-center' >
                        <Outlet />
                    </div>
                </div>
            </div>

        </div>
        <Footer />
        {/* Modal อัปรูป */}
        <dialog id="up_pic_modal" className="modal">
          <div className="modal-box bg-white rounded-3xl">
            <center>
                <div className='mb-4'>
                    
                    <img
                        src={previewUrl || (data[0]?.picture
                                ? `/uploads/user_pic/${data[0].picture}`
                                : `/uploads/nophoto.png`)}
                        className="rounded-3xl max-h-60"
                        alt="Preview"
                    />

                </div>
                <label className='text-[#8E80FF] pr-2'>แก้ไขรูปภาพ</label>
              <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered border border-[#8E80FF] bg-white text-[#8E80FF] file-input-sm rounded-xl w-full max-w-xs"
                />
            </center>   
            <div className="modal-action flex justify-center">
              
                <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" onClick={handleUpload}>
                  ตกลง
                </button>
                <button className="btn bg-[#FF0004] border border-[#FF0004] text-white px-4 py-2 rounded-lg" onClick={() => document.getElementById("up_pic_modal").close()}>
                  ยกเลิก
                </button>
              
            </div>
          </div>
        </dialog>
    </div>
  )
}
