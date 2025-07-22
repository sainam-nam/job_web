import React , { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./comp/navbar";
import Header from "./comp/header";
import Menu from "./comp/menu";
import Footer from "./comp/footer";
import './App.css'
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

function Admin() {
  const [userData, setUserData] = useState(null);

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
    })
    .catch(err => {
      console.error(err);
      // token หมดอายุหรือไม่ถูกต้อง -> กลับหน้า login
      alert("เกิดข้อผิดพลาด กรุณาเข้าสู่ระบบอีกครั้ง");
      window.location.href = "/login";
    });
  }, []);
    return (
        <>
         {userData && <Navbar user={userData} />}
         <Header />
         
         <div className="flex min-h-screen bg-white">
         
            <div className="hidden lg:block"><Menu /></div>

            
            <div className="flex-1 ">
              <Outlet />
            </div>
         </div>
         
         <Footer />
        </>
      )
}

export default Admin