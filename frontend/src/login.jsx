import React, { useState } from "react"
import Navbar_login from "./comp/nav_log"
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
   
    function handleSubmit(event) {
      event.preventDefault();
      axios.post('http://localhost:8081/login', {email, password})
      .then(res => {
        if (res.data.message === "Login successful") {
          const role = res.data.status;
          if (role === "admin") {
            navigate("/Admin");
            window.scrollTo(0,0);
          }else if (role === "ON"){
            navigate("/User");
            window.scrollTo(0,0);
          }else if (role === "OFF") {
            alert("บัญชีของคุณถูกระงับ");
          }
        } else {
          alert("อีเมลล์หรือรหัสผ่านของคุณไม่ถูกต้อง");
        }
      })
      .catch(err => console.log(err));
    }
    return (
      <div>
        <Navbar_login />
        <div className="flex flex-col md:flex-row gap-5 items-center justify-center bg-[#7B6ADA]">
        <img src="/login.png" className="w-3/4 my-24 sm:w-2/4 md:w-65 md:mx-10 lg:w-130 lg:mr-10" />
        <button 
          onClick={() => document.getElementById("section2").scrollIntoView({ behavior: "smooth" })} 
          className="btn btn-outline btn-white rounded-box mb-6 md:hidden">คลิกเพื่อเข้าสู่ระบบ</button>
        <div id="section2" className="card bg-white w-96 p-2 sm:w-110 lg:w-160 shadow-md my-40 md:my-40 md:mr-5 lg:my-30 lg:p-5 rounded-4xl">
          
          <div className="flex flex-col items-center py-5 px-2">
            <a className="card-title items-center text-[#7B6ADA] text-2xl mb-5 lg:text-3xl lg:mb-5">เข้าสู่ระบบ</a>
              <div className="relative flex items-center mb-3">
                <button onClick={() => navigate("/login")} className="z-10 btn btn-sm bg-[#7B6ADA] border-[#7B6ADA] rounded-full px-5 hover:w-50  lg:text-sm">หางานและทำจิตอาสา</button>
                <button onClick={() => navigate("/login_em")} className="z-0 -ml-5 btn btn-sm bg-white text-[#7B6ADA] border-3 px-5 border-[#7B6ADA] rounded-full hover:w-50 lg:text-sm">หาคนและจิตอาสา</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center">
                  <div className="flex flex-col">
                    <a className="text-[#7B6ADA] font-bold">อีเมลล์</a>
                    <input type="text" className="input w-75 lg:w-120 bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box mb-2" 
                      onChange={e => setEmail(e.target.value)} />

                    <div className="flex justify-between">
                      <a className="text-[#7B6ADA] font-bold">รหัสผ่าน</a>
                      
                      
                      <div 
                        className="text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye /> }
                      </div>
                    </div>
                    
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="input w-75 lg:w-120 bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box" 
                      onChange={e => setPassword(e.target.value)}
                    />

                    <div className="flex flex-row-reverse">
                      <a className="text-[#A3A3A3] underline hover:text-[#7B6ADA]" onClick={() => navigate("/forget-password")}>ลืมรหัสผ่าน</a>
                    </div>

                  </div>
                  <button className="btn bg-[#7B6ADA] border-[#7B6ADA] rounded-xl my-2 hover:border-5">เข้าสู่ระบบ</button>
                </div>
              </form>
              <a className="text-[#A3A3A3] underline hover:text-[#7B6ADA]" onClick={() => navigate("/register")}>ยังไม่ได้ลงทะเบียน?</a>

          </div>
        </div>
        </div>
      </div>
    )
}

export default Login