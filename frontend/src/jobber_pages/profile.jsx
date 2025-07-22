import React, { useState , useEffect} from 'react'
import Navbar from '../jobber_comp/navbar'
import Footer from '../jobber_comp/footer'
import JobbRating from '../jobber_comp/jobb_star'
import { jwtDecode } from "jwt-decode";
import { Outlet } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export const Profile = () => {
    const [userId, setUserId] = useState(null);
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const location = useLocation();
    
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
          // ถ้าไม่มี token อาจ redirect ไป login
    
          window.location.href = "/login";
          return;
        }
        try {
          const decoded = jwtDecode(token);
          setUserId(decoded.jobber_id); // ✅ สมมุติว่า backend ใส่ user_id มาใน token
        } catch (error) {
          console.error("Invalid token", error);
          window.location.href = "/login";
        }
        
    
      }, []);

    const profile = async (userId) => {
        try {
        

        const res = await fetch(`${apiUrl}/user_profile?jobber_id=${userId}`);
        const result = await res.json();

        if(Array.isArray(result.data)){
            //console.log("sql", res)
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
    }, [userId , location.pathname])

    const handleMenuClick = async (type) => {
    try {
      const res = await fetch(`${apiUrl}/api/profile_check/${type}?jobber_id=${userId}`); // เช่น personal, education
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

  return (
    <div>
        {data && <Navbar user={data} />}
        <div className='flex flex-col bg-gradient-to-b from-[#7B6ADA] to-white min-h-screen'>
            <center><a className='font-bold text-xl'>โปรไฟล์</a></center>
                {/* <div className="dock bg-[#7B6ADA] text-white lg:hidden">
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
                    
                        <ul className="menu bg-white w-full text-[#7B6ADA] rounded-3xl text-lg items-center">
                            <div className="-mt-20 avatar">
                                <div 
                                    className="w-24 sm:w-28 md:w-35 lg:w-40 rounded-3xl"
                                    onClick={()=>document.getElementById("up_pic_modal").showModal()}
                                >
                                {data[0]?.picture ? (
                                                <img src={`/uploads/${data[0]?.picture}`} />
                                            ) : (
                                                <img src={`/uploads/nophoto.png`}  />
                                            )}
                                </div>
                            </div>
                            <div className='flex flex-col gap-3 items-center py-3 '>
                                <a className='text-xl text-[#7B6ADA] font-bold'>{data[0]?.fullname}</a>
                                <a className='text-md text-[#7B6ADA]'>{data[0]?.email}</a>
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
                                <JobbRating emp_id={userId} cl={"#7B6ADA"} />
                            </div>
                            <a className='pt-2 font-bold'>เมนู</a>
                            <li className='py-2 w-full flex justify-center items-center hover:bg-[#D9D9D9] hover:rounded-2xl cursor-pointer' 
                                onClick={() => handleMenuClick("info")}>ข้อมูลส่วนตัว
                            </li>
                            <li className='py-2 w-full flex justify-center items-center hover:bg-[#D9D9D9] hover:rounded-2xl cursor-pointer' 
                                onClick={() => handleMenuClick("edu")}>ข้อมูลการศึกษา
                            </li>
                            <li className='py-2 w-full flex justify-center items-center hover:bg-[#D9D9D9] hover:rounded-2xl cursor-pointer' 
                                onClick={() => handleMenuClick("work_ex")}>ข้อมูลการทำงาน
                            </li>
                            <li className='py-2 w-full flex justify-center items-center hover:bg-[#D9D9D9] hover:rounded-2xl cursor-pointer' 
                                onClick={() => handleMenuClick("inter_work")}>ข้อมูลการสมัครงาน
                            </li>
                            <li className='py-2 w-full flex justify-center items-center hover:bg-[#D9D9D9] hover:rounded-2xl cursor-pointer' 
                                onClick={() => handleMenuClick("inter_volun")}>ข้อมูลการสมัครจิตอาสา
                            </li>
                            <li className='py-2 w-full flex justify-center items-center hover:bg-[#D9D9D9] hover:rounded-2xl cursor-pointer' 
                                onClick={() => navigate("history")}>ประวัติการใช้งาน
                            </li>
                            {/* ✓ */}
                        </ul>
                </div>
                
                <div className='flex flex-col justify-center w-2/3' >
                    <ul className="steps text-white text-[10px]">
                        <li data-content="✓" className="step step-primary">เริ่มต้นทำความรู้จักกัน!<br></br>ข้อมูลส่วนตัว</li>
                        <li data-content="" className="step">ข้อมูลการศึกษาต่อเลย</li>
                        <li data-content="" className="step">ข้อมูลใกล้ครบถ้วนแล้ว<br></br>ข้อมูลการทำงาน</li>
                        <li data-content="" className="step">กรอกข้อมูลการสมัครงานเป็นอันเสร็จ</li>
                    </ul>

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
                        src={previewUrl || `/uploads/${data[0]?.picture || "nophoto.png"}`}
                        className="rounded-3xl max-h-60"
                        alt="Preview"
                    />

                </div>
                <label className='text-[#7B6ADA] pr-2'>แก้ไขรูปภาพ</label>
              <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered border border-[#7B6ADA] bg-white text-[#7B6ADA] file-input-sm rounded-xl w-full max-w-xs"
                />
            </center>   
            <div className="modal-action flex justify-center">
              
                <button className="btn bg-[#7B6ADA] border border-[#7B6ADA] text-white px-4 py-2 rounded-lg" onClick={handleUpload}>
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
