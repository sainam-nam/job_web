import React, { useState , useEffect } from "react"
import Navbar_regis from "./comp/nav_reg"
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import TermsModal from "./jobber_comp/TermsModel";

function Register() {
    const [form, setForm] = useState({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);

    const [emailExists, setEmailExists] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [fullnameExists, setFullnameExists] = useState(false);
    const [loading, setLoading] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(true);

    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
   
    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
      e.preventDefault();
      //console.log("form::", form);
      if (loading) return;

      // เริ่มโหลด
      setLoading(true);

      if (form.password !== form.confirmPassword) {
        alert("รหัสผ่านไม่ตรงกัน");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post(`${apiUrl}/register`, form);
        if (res.data.status === "ok") {
          document.getElementById("registergood_modal").showModal();
        } else if (res.data.status === "pending") {
          alert(message); // เคยสมัครแต่ยังไม่ยืนยัน
        }  else {
          alert(res.data.message || "เกิดข้อผิดพลาดในการสมัคร");
        }
      } catch (error) {
        
        console.error("register error:", error);
        alert("ไม่สามารถสมัครสมาชิกได้")
      }
      setLoading(false);
    };

    useEffect(() => {
      if (!form.email.trim()) {
        setEmailExists(false);
        setIsVerified(false);
        return;
      }
      const checkEmail = async () => {
        try {
          const res = await axios.get(`${apiUrl}/check-email?email=${form.email}`);
          setEmailExists(res.data.exists);
          setIsVerified(res.data.is_verified);
        } catch (err) {
          console.error("Error checking email:", err);
        }
      };
      checkEmail();
    }, [form.email]);

    useEffect(() => {
      const checkFullname = async () => {
        const fullname = `${form.firstname.trim()} ${form.lastname.trim()}`;
        if (form.firstname && form.lastname) {
          const res = await axios.get(`${apiUrl}/check-fullname?fullname=${fullname}`);
          setFullnameExists(res.data.exists);
        }
      };
      checkFullname();
    }, [form.firstname, form.lastname]);

    useEffect(() => {
      const checkPasswordStrength = () => {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!form.password) {
          setPasswordStrength('');
        } else if (strongRegex.test(form.password)) {
          setPasswordStrength('strong');
        } else {
          setPasswordStrength('weak');
        }
      };
      checkPasswordStrength();
    }, [form.password]);

    useEffect(() => {
      setPasswordMatch(form.password === form.confirmPassword);
    }, [form.password, form.confirmPassword]);


    return (
      <div>
        <Navbar_regis />
        <div className="flex flex-col md:flex-row gap-5 items-center justify-center bg-[#8E80FF]">
        <img src="/reg2.png" className="hidden md:block md:w-70 md:mx-5 lg:block lg:w-130 lg:mr-10" />
        
        <div id="section2" className="card bg-white w-110 p-2 lg:w-160 shadow-md my-16 md:my-15 md:mr-10 lg:my-13 lg:p-5 rounded-4xl">
          
          <div className="flex flex-col items-center py-5 px-2">
            <a className="card-title items-center text-[#8E80FF] text-2xl mb-5 lg:text-3xl lg:mb-5">ลงทะเบียน</a>
              <div className="relative flex items-center mb-3">
                <button onClick={() => navigate("/register")} className="z-10 btn btn-sm bg-[#8E80FF] border-[#8E80FF] rounded-full px-5 hover:w-50  lg:text-sm">หางานและทำจิตอาสา</button>
                <button onClick={() => navigate("/register_em")} className="z-0 -ml-5 btn btn-sm bg-white text-[#8E80FF] border-[#8E80FF] border-3  px-5 rounded-full hover:w-50 lg:text-sm">หาคนและจิตอาสา</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 items-center">
                  <div className="flex flex-col gap-1 text-sm">

                    <div className="flex gap-2">
                        <div className="flex flex-col">
                            <a className="text-[#8E80FF] font-bold">ชื่อ</a>
                            <input 
                                type="text" 
                                className="input w-44 lg:w-59 bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                name="firstname"
                                value={form.firstname}
                                onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col">
                            <a className="text-[#8E80FF] font-bold">นามสกุล</a>
                            <input 
                                type="text" 
                                className="input w-44 lg:w-59 bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                name="lastname"
                                value={form.lastname}
                                onChange={handleChange} required/>
                        </div>
                    </div>
                    {fullnameExists && (
                      <p className="text-red-500 text-xs mt-1">ชื่อ-นามสกุลนี้มีผู้ใช้งานแล้ว</p>
                    )}

                    <a className="text-[#8E80FF] font-bold">อีเมล</a>
                    <input 
                      type="text" 
                      className="input w-90 lg:w-120 bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                      name="email"
                      value={form.email}
                      onChange={handleChange} required/>
                    
                    {emailExists && isVerified && (
                        <p className="text-red-500 text-xs mt-1">อีเมลนี้มีผู้ใช้งานแล้ว</p>
                      )}

                      {emailExists && !isVerified && (
                        <p className="text-yellow-600 text-xs mt-1">
                          คุณเคยสมัครไว้ แต่ยังไม่ยืนยันอีเมล กรุณาตรวจสอบกล่องอีเมล
                        </p>
                      )}


                    <div className="flex justify-between">
                      <a className="text-[#8E80FF] font-bold">รหัสผ่าน</a>
                      {/* <div 
                        className="text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye /> }
                      </div> */}
                    </div>
                    <div className="relative w-75 lg:w-120">
                                        <input 
                      type={showPassword ? "text" : "password"} 
                      className="input w-90 lg:w-120 bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                      name="password"
                      value={form.password}
                      onChange={handleChange} 
                      required
                    />
                                        <div 
                                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                                            onClick={() => setShowCPassword(!showCPassword)}>
                                            {showCPassword ? <FaRegEyeSlash /> : <FaRegEye /> }
                                          </div>
                    </div>
                    
                    {passwordStrength === 'weak' && (
                      <p className="text-red-500 text-xs mt-1">
                        รหัสผ่านควรมีอย่างน้อย 8 ตัวอักษร รวมทั้งตัวใหญ่ ตัวเล็ก ตัวเลข และสัญลักษณ์
                      </p>
                    )}
                    {passwordStrength === 'strong' && (
                      <p className="text-green-500 text-xs mt-1">รหัสผ่านปลอดภัย</p>
                    )}

                    <div className="flex justify-between">
                      <a className="text-[#8E80FF] font-bold">ยืนยันรหัสผ่าน</a>
                      {/* <div 
                        className="text-gray-500"
                        onClick={() => setShowCPassword(!showCPassword)}>
                        {showCPassword ? <FaRegEyeSlash /> : <FaRegEye /> }
                      </div> */}
                    </div>
                    
                    <div className="relative w-75 lg:w-120">
                                        <input 
                                          type={showCPassword ? "text" : "password"} 
                                          className="input w-90 lg:w-120 bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                          name="confirmPassword"
                                          value={form.confirmPassword}
                                          onChange={handleChange}
                                          required
                                        />
                                        <div 
                                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                                            onClick={() => setShowCPassword(!showCPassword)}>
                                            {showCPassword ? <FaRegEyeSlash /> : <FaRegEye /> }
                                          </div>
                    </div>
                    {form.confirmPassword && !passwordMatch && (
                        <p className="text-red-500 text-xs mt-1">รหัสผ่านไม่ตรงกัน</p>
                      )}

                    

                  </div>

                    <div>
                        <input type="checkbox" className="checkbox border-[#8E80FF] checked:text-[#8E80FF]" required />
                        <a className="text-[#A3A3A3] text-xs lg:text-sm"> ยอมรับ</a>
                        <a onClick={() => setShowModal(true)} className="underline text-[#8E80FF] text-xs lg:text-sm">เงื่อนไขข้อตกลงและนโยบายความเป็นส่วนตัว</a>
                        <a className="text-[#A3A3A3] text-xs lg:text-sm">ของ Job & Volun</a>
                    </div>
                    <TermsModal show={showModal} onClose={() => setShowModal(false)} />
                  <button 
                    type="submit"
                    className="btn bg-[#8E80FF] border-[#8E80FF] rounded-xl my-2 hover:border-5"
                    // disabled={
                    //   loading ||
                    //   (emailExists || fullnameExists || !passwordMatch || passwordStrength !== "strong") && form.password.length > 0
                    // }
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        กำลังลงทะเบียน จะส่งลิงค์ไปที่อีเมล
                      </>
                    ) : (
                      "ลงทะเบียน"
                    )}
                  </button>
                </div>
              </form>
              <a className="text-[#A3A3A3] underline hover:text-[#8E80FF] text-sm" onClick={() => navigate("/login")}>เคยลงทะเบียนแล้ว?</a>

          </div>
        </div>
        </div>
        {/* Modal เวลคัม แอดมิน */}
        <dialog id="registergood_modal" className="modal">
          <div className="modal-box bg-white">
            <center>
                <p className="text-4xl  text-[#8E80FF]">ลงทะเบียนสำเร็จ</p>
                <p className="text-3xl  text-[#8E80FF]">กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี</p>
              <div className="w-30 h-30 flex items-center justify-center my-6">
                <img src="/check.png" className="rounded-full"></img>
              </div>
            </center>   
            <div className="modal-action flex justify-center">
              
                <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" onClick={() => {navigate("/login"); window.scrollTo(0, 0);}}>
                  เข้าสู่ระบบ
                </button>
              
            </div>
          </div>
        </dialog>

        {/* Modal เคยลงทะเบียนแล้ว แต่ยังไม่ได้ยืนยันอีเมล */}
        <dialog id="pending_modal" className="modal">
          <div className="modal-box bg-white">
            <center>
                <p className="text-4xl  text-[#8E80FF]">คุณเคยลงทะเบียนไว้แล้ว แต่ยังไม่ได้ยืนยันอีเมล</p>
                <p className="text-3xl  text-[#8E80FF]">กรุณาตรวจสอบอีเมลของคุณอีกครั้ง</p>
                <p className="text-3xl  text-[#8E80FF]">{form.email}</p>
              <div className="w-30 h-30 flex items-center justify-center my-6">
                <img src="/check.png" className="rounded-full"></img>
              </div>
            </center>   
            <div className="modal-action flex justify-center">
              
                <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" onClick={() => {navigate("/login"); window.scrollTo(0, 0);}}>
                  เข้าสู่ระบบ
                </button>
              
            </div>
          </div>
        </dialog>
        
      </div>
    )
}

export default Register