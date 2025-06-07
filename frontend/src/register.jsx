import React, { useState } from "react"
import Navbar_regis from "./comp/nav_reg"
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";


function Register() {
    const [form, setForm] = useState({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    
    
    const [showPassword, setShowPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);
    const navigate = useNavigate();
   
    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
      e.preventDefault();
      //console.log("form::", form);
      if (form.password !== form.confirmPassword) {
        alert("รหัสผ่านไม่ตรงกัน");
        return;
      }

      try {
        const res = await axios.post('http://localhost:8081/register', form);
        if (res.data.status === "ok") {
          alert("สมัครสมาชิกสำเร็จ");
          navigate("/login");
        } else {
          alert(res.data.message || "เกิดข้อผิดพลาดในการสมัคร");
        }
      } catch (error) {
        
        console.error("register error:", error);
        alert("ไม่สามารถสมัครสมาชิกได้")
      }
    }
    return (
      <div>
        <Navbar_regis />
        <div className="flex flex-col md:flex-row gap-5 items-center justify-center bg-[#7B6ADA]">
        <img src="/reg.png" className="hidden md:block md:w-70 md:mx-5 lg:block lg:w-130 lg:mr-10" />
        
        <div id="section2" className="card bg-white w-110 p-2 lg:w-160 shadow-md my-16 md:my-15 md:mr-10 lg:my-13 lg:p-5 rounded-4xl">
          
          <div className="flex flex-col items-center py-5 px-2">
            <a className="card-title items-center text-[#7B6ADA] text-2xl mb-5 lg:text-3xl lg:mb-5">ลงทะเบียน</a>
              <div className="relative flex items-center mb-3">
                <button className="z-10 btn btn-sm bg-[#7B6ADA] border-[#7B6ADA] rounded-full px-5 hover:w-50  lg:text-sm">หางานและทำจิตอาสา</button>
                <button className="z-0 -ml-5 btn btn-sm bg-white text-[#7B6ADA] border-3 px-5 border-[#7B6ADA] rounded-full hover:w-50 lg:text-sm">หาคนและจิตอาสา</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 items-center">
                  <div className="flex flex-col gap-1 text-sm">

                    <div className="flex gap-2">
                        <div className="flex flex-col">
                            <a className="text-[#7B6ADA] font-bold">ชื่อ</a>
                            <input 
                                type="text" 
                                className="input w-44 lg:w-59 bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box" 
                                name="firstname"
                                value={form.firstname}
                                onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col">
                            <a className="text-[#7B6ADA] font-bold">นามสกุล</a>
                            <input 
                                type="text" 
                                className="input w-44 lg:w-59 bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box" 
                                name="lastname"
                                value={form.lastname}
                                onChange={handleChange} required/>
                        </div>
                    </div>
                    <a className="text-[#7B6ADA] font-bold">อีเมลล์</a>
                    <input 
                      type="text" 
                      className="input w-90 lg:w-120 bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box" 
                      name="email"
                      value={form.email}
                      onChange={handleChange} required/>

                    <div className="flex justify-between">
                      <a className="text-[#7B6ADA] font-bold">รหัสผ่าน</a>
                      <div 
                        className="text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye /> }
                      </div>
                    </div>
                    
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="input w-90 lg:w-120 bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box" 
                      name="password"
                      value={form.password}
                      onChange={handleChange} 
                      required
                    />
                    <div className="flex justify-between">
                      <a className="text-[#7B6ADA] font-bold">ยืนยันรหัสผ่าน</a>
                      <div 
                        className="text-gray-500"
                        onClick={() => setShowCPassword(!showCPassword)}>
                        {showCPassword ? <FaRegEyeSlash /> : <FaRegEye /> }
                      </div>
                    </div>
                    
                    <input 
                      type={showCPassword ? "text" : "password"} 
                      className="input w-90 lg:w-120 bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box" 
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />

                    

                  </div>

                    <div>
                        <input type="checkbox" className="checkbox border-[#7B6ADA] checked:text-[#7B6ADA]" required />
                        <a className="text-[#A3A3A3] text-xs lg:text-sm">ยอมรับ</a>
                        <a className="underline text-[#7B6ADA] text-xs lg:text-sm">เงื่อนไขข้อตกลง</a>
                        <a className="text-[#A3A3A3] text-xs lg:text-sm">และ</a>
                        <a className="underline text-[#7B6ADA] text-xs lg:text-sm">นโยบายความเป็นส่วนตัว</a>
                        <a className="text-[#A3A3A3] text-xs lg:text-sm">ของ Job & Volun</a>
                    </div>
                  <button className="btn bg-[#7B6ADA] border-[#7B6ADA] rounded-xl my-2 hover:border-5">ลงทะเบียน</button>
                </div>
              </form>
              <a className="text-[#A3A3A3] underline hover:text-[#7B6ADA] text-sm" onClick={() => navigate("/login")}>เคยลงทะเบียนแล้ว?</a>

          </div>
        </div>
        </div>
      </div>
    )
}

export default Register