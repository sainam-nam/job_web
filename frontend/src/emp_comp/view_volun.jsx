import React, { useState , useEffect} from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Emp_VolunView = () => {
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

   

  return (
    <div>
       <div className='text-[#8E80FF] bg-white rounded-3xl p-6 relative' style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <div className="flex gap-4 items-center mb-4">
                <h2 className="font-bold text-xl">ข้อมูลส่วนตัว</h2>
                <button onClick={() => navigate("/emp_profile/volun/edit")} className="bg-[#8E80FF] text-white px-3 py-1 rounded-xl text-sm">
                    แก้ไข
                </button>
            </div>
            <div className="flex justify-center items-center mb-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                    <table className="table-auto w-full text-lg overflow-hidden">
                        <tbody>
                            <tr>
                            <td className="font-bold p-3 ">เกี่ยวกับจิตอาสา</td>
                            <td className="p-3">
                              <div
                                className="prose prose-sm md:prose lg:prose-lg"
                                dangerouslySetInnerHTML={{ __html: data?.about_volun }}
                              ></div>
                            </td>
                            </tr>
                            <tr>
                            <td className="font-bold p-3 ">วิสัยทัศน์</td>
                            <td className="p-3">
                              <div
                                className="prose prose-sm md:prose lg:prose-lg"
                                dangerouslySetInnerHTML={{ __html: data?.vission }}
                              ></div>
                            </td>
                            </tr>
                            <tr>
                            <td className="font-bold p-3 ">พันธกิจ</td>
                            <td className="p-3">
                              <div
                                className="prose prose-sm md:prose lg:prose-lg"
                                dangerouslySetInnerHTML={{ __html: data?.mission }}
                              ></div>
                            </td>
                            </tr>
                            
                            
                        </tbody>
                        </table>

                </div>
            </div>
            
            </div>
            
    </div>
  );
};

export default Emp_VolunView;
