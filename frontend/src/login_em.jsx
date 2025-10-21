import React, { useState } from "react"
import Navbar_login from "./comp/nav_log"
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";

function Login_em() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
   
    async function handleSubmit(event) {
      event.preventDefault();
      try {
      const res = await axios.post(`${apiUrl}/login_em`, { email, password });

      const user = res.data.user;
      const role = user.status;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      // 👉 redirect ตามสถานะ
      if (role === "ON") {
        document.getElementById("welcome_modal").showModal();
        
        window.scrollTo(0, 0);
      } 
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          document.getElementById("passwrong_modal").showModal();
        } else if (err.response.status === 500) {
          alert("เกิดข้อผิดพลาดที่เซิร์ฟเวอร์");
        } else {
          alert("ไม่สามารถเข้าสู่ระบบได้ในขณะนี้");
        }
      } else if (err.response.status === 403) {
        const message = err.response.data.message;
        
          document.getElementById("suspended_modal").showModal();
        
      } else {
        alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      }

      //console.error("❌ Login error:", err);
    }
  }
    return (
      <div>
        <Navbar_login />
        <div className="flex flex-col md:flex-row gap-5 items-center justify-center bg-[#8E80FF]">
        <img src="/login_em.png" className="w-3/4 my-22 sm:w-2/4 md:w-65 md:mx-10 lg:w-130 lg:mr-10" />
        <button 
          onClick={() => document.getElementById("section2").scrollIntoView({ behavior: "smooth" })} 
          className="btn btn-outline btn-white rounded-box mb-6 md:hidden">คลิกเพื่อเข้าสู่ระบบ</button>
        <div id="section2" className="card bg-white w-96 p-2 sm:w-110 lg:w-160 shadow-md my-40 md:my-40 md:mr-5 lg:my-30 lg:p-5 rounded-4xl">
          
          <div className="flex flex-col items-center py-5 px-2">
            <a className="card-title items-center text-[#8E80FF] text-2xl mb-5 lg:text-3xl lg:mb-5">เข้าสู่ระบบ</a>
              <div className="relative flex items-center mb-3">
                <button onClick={() => navigate("/login")} className="z-0 btn btn-sm bg-white text-[#8E80FF] border-[#8E80FF] border-3 rounded-full px-5 hover:w-50  lg:text-sm">หางานและทำจิตอาสา</button>
                <button onClick={() => navigate("/login_em")} className="z-10 -ml-5 btn btn-sm bg-[#8E80FF] border-[#8E80FF] px-5 rounded-full hover:w-50 lg:text-sm">หาคนและจิตอาสา</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center">
                  <div className="flex flex-col">
                    <a className="text-[#8E80FF] font-bold">อีเมล</a>
                    <input type="text" className="input w-75 lg:w-120 bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box mb-2" 
                      onChange={e => setEmail(e.target.value)} />

                    <div className="flex justify-between">
                      <a className="text-[#8E80FF] font-bold">รหัสผ่าน</a>
                      
                      
                      <div 
                        className="text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye /> }
                      </div>
                    </div>
                    
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="input w-75 lg:w-120 bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                      onChange={e => setPassword(e.target.value)}
                    />

                    <div className="flex flex-row-reverse">
                      <a className="text-[#A3A3A3] underline hover:text-[#8E80FF]" onClick={() => navigate("/forget-password")}>ลืมรหัสผ่าน</a>
                    </div>

                  </div>
                  <button className="btn bg-[#8E80FF] border-[#8E80FF] rounded-xl my-2 hover:border-5">เข้าสู่ระบบ</button>
                </div>
              </form>
              <a className="text-[#A3A3A3] underline hover:text-[#8E80FF]" onClick={() => navigate("/register_em")}>ยังไม่ได้ลงทะเบียน?</a>

          </div>
        </div>
        </div>
        {/* Modal เวลคัม ยูเซอร์*/}
        <dialog id="welcome_modal" className="modal">
          <div className="modal-box bg-white">
            <center>
                <p className="text-4xl text-[#8E80FF]">ยินดีต้อนรับ</p>
                <p className="text-[#8E80FF]">เว็บไซต์จัดหางานและจิตอาสาภายในชุมชน</p>
              
              <div className="w-30 h-30 flex items-center justify-center my-6">
                <img src="/check.png" className="rounded-full"></img>
              </div>
            </center> 
            <div className="modal-action flex justify-center">
             
              <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" onClick={() => {navigate("/Employer/"); window.scrollTo(0, 0);}}>
                ตกลง
              </button>
            </div>
          </div>
        </dialog>

        
        {/* Modal รหัสบ่ถูก*/}
        <dialog id="passwrong_modal" className="modal">
          <div className="modal-box bg-white">
            <center>
                <p className="text-3xl text-error font-bold">อีเมลหรือรหัสผ่านไม่ถูกต้อง</p>
                <p className="text-error">กรุณากรอกอีกครั้ง</p>
              
              <div className="w-30 h-30 flex items-center justify-center my-6">
                <img src="/x.png" className="rounded-full"></img>
              </div>
            </center> 
            <div className="modal-action flex justify-center">
             
              <button className="btn bg-[#FF0004] border border-error text-white px-4 py-2 rounded-lg" onClick={() => {document.getElementById("passwrong_modal").close();}}>
                ตกลง
              </button>
            </div>
          </div>
        </dialog>
        {/* Modal บัญชีถูกระงับ */}
        <dialog id="suspended_modal" className="modal">
          <div className="modal-box bg-white">
            <center>
              <p className="text-2xl text-error font-bold">บัญชีของคุณถูกระงับ</p>
              <p className="text-error mt-2">โปรดติดต่อแอดมินที่</p>
              <p className="text-error">jobvolun.service@gmail.com</p>

              <div className="w-30 h-30 flex items-center justify-center my-6">
                <img src="/x.png" className="rounded-full" />
              </div>
            </center>
            <div className="modal-action flex justify-center">
              <button
                className="btn bg-[#FF0004] border border-error text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  document.getElementById("suspended_modal").close();
                }}
              >
                ตกลง
              </button>
            </div>
          </div>
        </dialog>
      </div>
    )
}

export default Login_em