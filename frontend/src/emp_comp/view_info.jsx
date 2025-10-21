import React, { useState , useEffect} from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Emp_InfoView = () => {
    const [userId, setUserId] = useState(null);
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // ถ้าไม่มี token อาจ redirect ไป login

      window.location.href = "/login";
      return;
    }

    axios.get(`${apiUrl}/emp_profile`, { //error
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setData(res.data.user);
      setUserId(res.data.user.emp_id);
    //   setEmpPercent(res.data.user.percent_match);
      //console.log(res.data.user);
    })
    .catch(err => {
      console.error(err);
      // token หมดอายุหรือไม่ถูกต้อง -> กลับหน้า login
      // alert("เกิดข้อผิดพลาด กรุณาเข้าสู่ระบบอีกครั้ง");
      window.location.href = "/login";
    });
  }, [userId]);

    

    function formatDateToThaiShort(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือน 0-11 ต้อง +1
        const year = date.getFullYear() + 543; // เพิ่ม 543 เพื่อเป็นปี พ.ศ.

        return `${day}/${month}/${year}`;
    }

   

  return (
    <div>
       <div className='text-[#8E80FF] bg-white rounded-3xl p-6 relative' style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <div className="flex gap-4 items-center mb-4">
                <h2 className="font-bold text-xl">ข้อมูลส่วนตัว</h2>
                <button onClick={() => navigate("/emp_profile/info/edit")} className="bg-[#8E80FF] text-white px-3 py-1 rounded-xl text-sm">
                    แก้ไข
                </button>
            </div>
            <div className="flex justify-center items-center mb-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                    <table className="table-auto w-full text-lg overflow-hidden">
                        <tbody>
                            <tr>
                            <td className="font-bold p-3 ">อีเมล</td>
                            <td className="p-3">{data?.email}</td>
                            </tr>
                            <tr className="">
                            <td className="font-bold p-3 ">ชื่อและนามสกุล</td>
                            <td className="p-3">{data?.fullname}</td>
                            </tr>
                            {/* <tr className="">
                            <td className="font-bold p-3 ">ชื่อและนามสกุล <a className='text-xs'>ภาษาอังกฤษ</a></td>
                            <td className="p-3">{data?.fullname_eng}</td>
                            </tr> */}
                            <tr className="">
                            <td className="font-bold p-3 ">เพศ</td>
                            <td className="p-3">
                                {data?.gender === "M"
                                    ? "ชาย"
                                    : data?.gender === "F"
                                    ? "หญิง"
                                    : data?.gender || "ไม่ระบุ"}
                                    
                                    
                            </td>
                            </tr>
                            <tr className="">
                            <td className="font-bold p-3 ">วันเกิด</td>
                            <td className="p-3">{data?.birthday ? formatDateToThaiShort(data?.birthday) : '-'}</td>
                            </tr>
                            <tr className="">
                            <td className="font-bold p-3 ">ที่อยู่ปัจจุบัน</td>
                            <td className="p-3">{data?.address} ต.{data?.tb} อ.{data?.ap} จ.{data?.jw}</td>
                            </tr>
                            <tr className="">
                            <td className="font-bold p-3 ">เบอร์โทรศัพท์</td>
                            <td className="p-3">{data?.phone}</td>
                            </tr>
                            
                        </tbody>
                        </table>

                </div>
            </div>
            <div className="absolute -top-10 right-1/10 opacity-10 text-[10rem] pr-4 pt-2 pointer-events-none select-none">
                {data?.gender === "M"
                                    ? <img src='/man.png' className='w-100' />
                                    : data?.gender === "F"
                                    ? <img src='/woman.png' className='w-80 rotate-50' />
                                    : data?.gender || "ไม่ระบุ"}
                
            </div>
            </div>
            
    </div>
  );
};

export default Emp_InfoView;
