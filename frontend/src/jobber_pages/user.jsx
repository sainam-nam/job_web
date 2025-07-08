import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../jobber_comp/navbar";
import Menu from "../jobber_comp/menu";
import Footer from "../jobber_comp/footer";
import SideBar_Type from "../jobber_comp/sidebar_type";
import { Outlet } from "react-router-dom";

function User() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // ถ้าไม่มี token อาจ redirect ไป login

      window.location.href = "/login";
      return;
    }

    axios.get("http://localhost:8081/jobber_profile", {
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

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
        <Navbar />
        <div className="relative w-full group">
          <img src="/user.png" className="w-full" />
          <button className="btn btn-xs xl:btn-lg w-15 h-4.5 xl:w-76 xl:h-23 bg-white border-white text-[7px] xl:text-4xl text-[#7B6ADA] rounded-lg xl:rounded-3xl absolute top-8/11 left-3/5 xl:top-10/14 xl:left-9/15 transform -translate-x-1/2 -translate-y-1/2">
            กรอกข้อมูล
          </button>
        </div>
        <div className="flex flex-col min-h-screen bg-white">
            <div className="flex">
              <div className="flex pl-10 pt-5"><SideBar_Type /></div>
              <div className="flex-1 p-6">
                <Outlet />
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="carousel w-2/3 h-50">
                <div id="slide1" className="carousel-item relative w-full">
                  <img src="/gray.png" className="w-full" />
                  <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                    <a href="#slide3" className="btn btn-circle">❮</a>
                    <a href="#slide2" className="btn btn-circle">❯</a>
                  </div>
                </div> 
                <div id="slide2" className="carousel-item relative w-full">
                  <img src="/gray.png" className="w-full" />
                  <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                    <a href="#slide1" className="btn btn-circle">❮</a>
                    <a href="#slide3" className="btn btn-circle">❯</a>
                  </div>
                </div> 
                <div id="slide3" className="carousel-item relative w-full">
                  <img src="/gray.png" className="w-full" />
                  <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                    <a href="#slide2" className="btn btn-circle">❮</a>
                    <a href="#slide1" className="btn btn-circle">❯</a>
                  </div>
                </div>
              </div>
            </div>
         </div>
         
         <Footer />

    </div>
  );
}

export default User;
