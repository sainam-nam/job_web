import React, { useState, useEffect } from 'react';
import { useSearchParams , useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const res = await axios.post(`${apiUrl}/reset-password`, {
        email,
        token,
        password,
      });

      setSuccess(true);
      setMessage('เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage('ลิงก์ไม่ถูกต้องหรือหมดอายุ');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#7B6ADA]">
      <div className="card bg-white w-96 p-2 sm:w-110 lg:w-160 shadow-md my-40 md:my-40 md:mr-5 lg:my-30 lg:p-5 rounded-4xl">
        <div className="flex flex-col items-center py-5 px-2">
            <a className="card-title items-center text-[#7B6ADA] text-2xl mb-5 lg:text-3xl lg:mb-5">เปลี่ยนรหัสผ่าน</a>

        <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center">
                <div className="flex flex-col">
                    <label className="text-[#7B6ADA] font-bold">รหัสผ่านใหม่</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input w-75 lg:w-120 bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box mb-2"
                        required
                    />

                    <label className="text-[#7B6ADA] font-bold">ยืนยันรหัสผ่าน</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input w-75 lg:w-120 bg-white text-[#7B6ADA] border-[#A3A3A3] rounded-box mb-2"
                        required
                    />
                    </div>
                    <button type="submit" className="btn bg-[#7B6ADA] border-[#7B6ADA] rounded-xl my-2 hover:border-5">
                        เปลี่ยนรหัสผ่าน
                    </button>
            </div>
            
        </form>

        {message && (
          <p className={`text-center mt-4 ${success ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
