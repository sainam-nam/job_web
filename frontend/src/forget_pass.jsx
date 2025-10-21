import React, { useState } from "react";
import Navbar_login from "./comp/nav_log";
import axios from 'axios';

function ForgetPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const handleSubmit = async(e) =>{
        e.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/forgot-password`, {
                email: email
            });
            setMessage("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว");
        } catch (error) {
            console.error(error);
            setMessage("ไม่พบอีเมลนี้ในระบบ");
        }
    }

    return (
        <div>
        <Navbar_login />
            <div className="flex justify-center bg-[#8E80FF]">
                <div className="card bg-white w-96 p-2 sm:w-110 lg:w-160 shadow-md my-40 md:my-40 md:mr-5 lg:my-30 lg:p-5 rounded-4xl">
                    <div className="flex flex-col items-center py-5 px-2">
                        <a className="card-title items-center text-[#8E80FF] text-2xl mb-5 lg:text-3xl lg:mb-5">ลืมรหัสผ่าน</a>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col items-center">
                            <div className="flex flex-col">
                                <label className="text-[#8E80FF] font-bold">อีเมล</label>
                                    <input 
                                    type="email" 
                                    className="input w-75 lg:w-120 bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box mb-2" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <p className="text-[#8E80FF] text-[10px]">ระบบจะส่งลิงก์สำหรับเปลี่ยนรหัสผ่านไปยังอีเมลของคุณ</p>
                            </div>
                            <button className="btn bg-[#8E80FF] border-[#8E80FF] rounded-xl my-2 hover:border-5">ส่ง</button>
                            {message && <p className="text-sm mt-2 text-center text-gray-600">{message}</p>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      )
}

export default ForgetPassword;
