import React, { useState , useEffect} from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { FaTrash } from "react-icons/fa";

const EduView = () => {
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
          
  
          const res = await fetch(`${apiUrl}/user_edu?jobber_id=${userId}`);
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
      
      const [delData , setDelData] = useState();
      const handleDel = (val) => {
        setDelData(val);
        document.getElementById("del_modal").showModal();
      };

      const handleDelete = async () => {
      try {
        const res = await fetch(`${apiUrl}/user_edu/${delData}`, {
          method: "DELETE",
          
        });

        if (res.ok) {
          //alert("ลบข้อมูลสำเร็จ!");
          document.getElementById("del_modal").close();
          profile(userId);
        } else {
          console.error("ลบข้อมูลไม่สำเร็จ");
        }
      } catch (error) {
        console.error("Error updating data:", error);
      }
    };
  
      useEffect(() =>{
          if (userId) {
              profile(userId);
          }
      }, [userId])
  
    return (
      <div>
         <div className='text-white rounded-3xl p-6 relative' style={{ boxShadow: '0 0 10px rgba(255, 255, 255, 1)' }}>
              <div className="flex gap-4 items-center mb-4">
                  <h2 className="font-bold text-xl">ข้อมูลการศึกษา</h2>
                  <button onClick={() => navigate("/profile/edu/add")} className="bg-[#8E80FF] text-white px-3 py-1 rounded-xl text-sm">
                      เพิ่ม
                  </button>
              </div>
              <div className="flex items-center justify-center mb-4 w-full px-10">
                  <div className="grid grid-cols-1 gap-4 text-sm w-full overflow-y-auto max-h-[800px] pr-2">
                    {data.map((data, index) => {
                      return(
                        <div key={index} className='flex flex-col justify-center bg-white p-3 rounded-3xl '>
                          <div className='flex justify-end gap-2'>
                            <button onClick={() => navigate(`/profile/edu/edit/${data.user_edu_id}`)} className="btn btn-warning btn-sm text-white px-3 py-1 rounded-xl text-sm">
                                แก้ไข
                            </button>
                            <button onClick={() => handleDel(data.user_edu_id)} className="btn btn-error btn-sm text-white px-3 py-1 rounded-xl text-sm">
                                ลบ
                            </button>
                          </div>
                          <table className="table-auto w-full text-lg text-[#8E80FF] overflow-hidden ml-8 mb-5">
                            <tbody>
                              {data.edu_name && (
                                <tr>
                                <td className="font-bold p-2 w-[30%]">ระดับการศึกษา</td>
                                <td className="p-2">{data.edu_name}</td>
                                </tr>
                              )}
                              {data.institution && (
                                <tr className="">
                                <td className="font-bold p-2 ">ชื่อสถาบัน</td>
                                <td className="p-2">{data.institution}</td>
                                </tr>
                              )}
                              {data.major && ( 
                                <tr className="">
                                <td className="font-bold p-2 ">สาขาวิชา/คณะ</td>
                                <td className="p-2">{data.major}</td>
                                </tr>
                              )}
                              {data.year_graduat && ( 
                                <tr className="">
                                <td className="font-bold p-2 ">ปีที่สำเร็จการศึกษา</td>
                                <td className="p-2">
                                    {data.year_graduat}
                                </td>
                                </tr>
                              )}
                              {data.grade && ( 
                                <tr className="">
                                <td className="font-bold p-2 ">เกรดเฉลี่ย <a className='text-xs'>(ถ้ามี)</a></td>
                                <td className="p-2">{data.grade}</td>
                                </tr>
                              )}
                                {data.edu_cert && (
                                  <tr>
                                    <td className="font-bold p-2">หลักฐานรับรองการศึกษา</td>
                                    <td className="p-2">
                                      <a
                                        href={`/uploads/user_file/${data.edu_cert}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#8E80FF] text-white px-3 py-1 rounded-xl text-sm"
                                      >
                                        แสดงไฟล์
                                      </a>
                                    </td>
                                  </tr>
                                )}
                                
                                
                            </tbody>
                          </table>
                        </div>
                      )
                    })}
                  </div>
              </div>
              
            </div>
              {/* Modal สำหรับลบบบบบบบบบบ */}
              <dialog id="del_modal" className="modal">
                <div className="modal-box  bg-white">
                  <center><h2 className="text-xs md:text-lg text-red-500 font-bold mb-4">คุณยืนยันการลบข้อมูลการศึกษา</h2></center>
                    <div className="flex justify-center mb-4">
                      <FaTrash className="text-red-500 text-4xl md:text-5xl" />
                    </div>
                  <div className="modal-action flex justify-center">
                    
                    <button className="btn btn-sm md:btn-md bg-red-500 border border-red-500 text-white px-4 py-2 rounded-md" onClick={() => handleDelete()}>
                      ยืนยัน
                    </button>
                    <button className="btn btn-sm md:btn-md bg-green-500 border border-green-500 text-white px-4 py-2 rounded-md" onClick={() => document.getElementById("del_modal").close()}>
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </dialog>
      </div>
    );
  };

export default EduView;
