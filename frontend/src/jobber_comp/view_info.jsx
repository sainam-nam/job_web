import React, { useState , useEffect} from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const InfoView = () => {
    const [userId, setUserId] = useState(null);
    const [data, setData] = useState([]);
    const navigate = useNavigate();

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
        const apiUrl = import.meta.env.VITE_API_BASE_URL;

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

    function formatDateToThaiShort(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือน 0-11 ต้อง +1
        const year = date.getFullYear() + 543; // เพิ่ม 543 เพื่อเป็นปี พ.ศ.

        return `${day}/${month}/${year}`;
    }

    useEffect(() =>{
        if (userId) {
            profile(userId);
        }
    }, [userId])

  return (
    <div>
       <div className='text-[#7B6ADA] bg-white rounded-3xl p-6 relative' style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <div className="flex gap-4 items-center mb-4">
                <h2 className="font-bold text-xl">ข้อมูลส่วนตัว</h2>
                <button onClick={() => navigate("/profile/info/edit")} className="bg-[#7B6ADA] text-white px-3 py-1 rounded-xl text-sm">
                    แก้ไข
                </button>
            </div>
            <div className="flex justify-center items-center mb-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                    <table className="table-auto w-full text-lg overflow-hidden">
                        <tbody>
                            <tr>
                            <td className="font-bold p-3 ">อีเมล</td>
                            <td className="p-3">{data[0]?.email}</td>
                            </tr>
                            <tr className="">
                            <td className="font-bold p-3 ">ชื่อและนามสกุล</td>
                            <td className="p-3">{data[0]?.fullname}</td>
                            </tr>
                            <tr className="">
                            <td className="font-bold p-3 ">ชื่อและนามสกุล <a className='text-xs'>ภาษาอังกฤษ</a></td>
                            <td className="p-3">{data[0]?.fullname_eng}</td>
                            </tr>
                            <tr className="">
                            <td className="font-bold p-3 ">เพศ</td>
                            <td className="p-3">
                                {data[0]?.gender === "M"
                                    ? "ชาย"
                                    : data[0]?.gender === "F"
                                    ? "หญิง"
                                    : data[0]?.gender || "ไม่ระบุ"}
                                    
                                    {data[0]?.LG
                                        ? "  🌈"
                                        : ""}
                            </td>
                            </tr>
                            <tr className="">
                            <td className="font-bold p-3 ">วันเกิด</td>
                            <td className="p-3">{data[0]?.birthday ? formatDateToThaiShort(data[0]?.birthday) : '-'}</td>
                            </tr>
                            <tr className="">
                            <td className="font-bold p-3 ">ที่อยู่ปัจจุบัน</td>
                            <td className="p-3">{data[0]?.address} ต.{data[0]?.tb} อ.{data[0]?.ap} จ.{data[0]?.jw}</td>
                            </tr>
                            <tr className="">
                            <td className="font-bold p-3 ">เบอร์โทรศัพท์</td>
                            <td className="p-3">{data[0]?.phone}</td>
                            </tr>
                            
                        </tbody>
                        </table>

                </div>
            </div>
            <div className="absolute top-0 right-0 opacity-10 text-[10rem] pr-4 pt-2 pointer-events-none select-none">
                <img src="/man.png" className='w-100' />
            </div>
            </div>
            
    </div>
  );
};

export default InfoView;
