import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./comp/navbar";
import Header from "./comp/header";
import Menu from "./comp/menu";
import Footer from "./comp/footer";
import './App.css'
import Menu_xs from "./comp/menu_xs";



function Admin() {
    return (
        <>
         <Navbar />
         <Header />
         
         <div className="flex min-h-screen bg-white">
         
            <div className="hidden md:block"><Menu /></div>

            
            <div className="flex-1 ">
              <Outlet />
            </div>
         </div>
         
         <Footer />
        </>
      )
}

export default Admin