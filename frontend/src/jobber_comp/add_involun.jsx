import React, { useState , useEffect} from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { AlertTriangle } from 'lucide-react';

const InterVolunAdd = () => {
      const [userId, setUserId] = useState(null);
      const navigate = useNavigate();
      const [voluntypeList, setVolunTypeList] = useState([]);
      const [weekdays, setWeekdays] = useState({
            Mon: false,
            Tue: false,
            Wed: false,
            Thu: false,
            Fri: false,
            Sat: false,
            Sun: false
        });

        const selectAllDays = () => {
            setWeekdays({
                Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true
            });
        };

        const selectWeekdaysOnly = () => {
            setWeekdays({
                Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false
            });
        };

        const selectWeekendOnly = () => {
            setWeekdays({
                Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: true, Sun: true
            });
        };


      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const [formData, setFormData] = useState({
            jobber_id: "",
            voluntype_id: "", 
            start: "",
            end: "",
            days:"",
            ready_travel: "",
            health_limit: "",
            experience: ""
        });
  
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
  
      

      useEffect(() => {
              axios.get(`${apiUrl}/voluntypeall`).then((res) => {  
                  if (Array.isArray(res.data.data)) {
                      setVolunTypeList(res.data.data);
                      } else {
                      setVolunTypeList([]); // fallback
                      }
              });
          }, []);

  
        const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        };



        const handleSubmit = async (e) => {
            e.preventDefault();
            
            if (!userId) {
                alert("กำลังโหลดข้อมูลผู้ใช้ กรุณารอสักครู่");
                return;
            }


            const available_days =
                `${weekdays.Mon ? '1' : '0'}` +
                `${weekdays.Tue ? '1' : '0'}` +
                `${weekdays.Wed ? '1' : '0'}` +
                `${weekdays.Thu ? '1' : '0'}` +
                `${weekdays.Fri ? '1' : '0'}` +
                `${weekdays.Sat ? '1' : '0'}` +
                `${weekdays.Sun ? '1' : '0'}`;

            const form = new FormData();
            form.append("jobber_id", userId);   
            form.append("voluntype_id", formData.voluntype_id);               // เพิ่ม id ผู้ใช้
            form.append("start", formData.start);
            form.append("end", formData.end);
            form.append("days", available_days);
            form.append("ready_travel", formData.ready_travel);
            form.append("health_limit", formData.health_limit);
            form.append("experience", formData.experience);


            try {
                const res = await axios.post(`${apiUrl}/api/user_intervolun_add`, form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                });

                if (res.status === 200) {
                document.getElementById("save_modal").showModal();
                //navigate("/profile/edu/view");
                }
            } catch (error) {
                console.error("Upload failed:", error);
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
            };



    return (
      <div>
         <div className='text-[#8E80FF] bg-white rounded-3xl p-6 relative' style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
              <div className="flex gap-4 items-center mb-4">
                  <h2 className="font-bold text-xl">เพิ่มข้อมูลการสมัครกิจกรรมจิตอาสา</h2>
              </div>
              
                  <form onSubmit={handleSubmit} className='mt-2 '>
                    <div className="flex flex-col gap-2 items-center justify-center ">
                        
                        <div className="flex flex-col gap-1 text-sm w-2/3">
                        {/* ประเภทงาน */}
                        
                            <a className="text-[#8E80FF] font-bold mt-2">ประเภทกิจกรรมที่สนใจ</a>
                                <select
                                    name='voluntype_id'
                                    className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                    value={formData.voluntype_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- กรุณาเลือกประเภทงาน --</option>
                                    {Array.isArray(voluntypeList) && voluntypeList.map((vt) => (
                                        <option key={vt.voluntype_id} value={vt.voluntype_id}>
                                            {vt.voluntype_name}
                                        </option>
                                        ))}
                                </select>
                        <div className="flex  mt-2">
                                <a className="text-[#8E80FF] font-bold">ความพร้อมในการเดินทาง</a>
                            </div>
                            <div className='flex justify-center gap-20'>
                                <div className='flex items-center gap-1'>
                                    <input 
                                        type="radio" 
                                        name="ready_travel" 
                                        value="1"
                                        className="radio" 
                                        checked={formData.ready_travel === "1"} 
                                        onChange={(e) => setFormData({ ...formData, ready_travel: e.target.value })} />
                                    เดินทางเองได้
                                </div>  
                                <div className='flex items-center gap-1'>
                                    <input 
                                        type="radio" 
                                        name="ready_travel" 
                                        value="0"
                                        className="radio" 
                                        checked={formData.ready_travel === "0"} 
                                        onChange={(e) => setFormData({ ...formData, ready_travel: e.target.value })} />
                                    ไม่สามารถเดินทางเองได้
                                </div> 
                                 
                                                    
                            </div>
                        <a className="text-[#8E80FF] font-bold mt-2">ช่วงเวลาที่สามารถทำงาน</a>
                
                            <div className="flex gap-2">
                                <div className="flex flex-col w-full">
                                    <div className="text-[#8E80FF] font-bold">จาก</div>
                                        <input 
                                            type="time" 
                                            className="input w-full bg-[#8E80FF] text-white border-[#A3A3A3] rounded-box" 
                                            name="start"
                                            value={formData.start || ""}
                                            onChange={handleChange} 
                                            required/>
                                </div>
                                <div className="flex flex-col w-full">
                                    <div className="text-[#8E80FF] font-bold">ถึง</div>
                                        <input 
                                            type="time" 
                                            className="input w-full bg-[#8E80FF] text-white border-[#A3A3A3] rounded-box" 
                                            name="end"
                                            value={formData.end || ""}
                                            onChange={handleChange} 
                                            required/>
                                </div>
                            </div>
                            <div className='flex gap-2 mt-4'>      
                                <a className="text-[#8E80FF] font-bold mt-2">ช่วงวันที่สามารถทำงาน</a>
                                <div className="flex gap-3 flex-wrap">
                                    <button type="button" onClick={selectAllDays} className="btn btn-sm btn-outline rounded-xl">ทุกวัน</button>
                                    <button type="button" onClick={selectWeekdaysOnly} className="btn btn-sm btn-outline rounded-xl">จันทร์-ศุกร์</button>
                                    <button type="button" onClick={selectWeekendOnly} className="btn btn-sm btn-outline rounded-xl">เสาร์-อาทิตย์</button>
                                </div>

                            </div>  
                            <div className="flex gap-2">
                                {Object.keys(weekdays).map((day) => (
                                <label key={day} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={weekdays[day]}
                                    onChange={() =>
                                    setWeekdays((prev) => ({ ...prev, [day]: !prev[day] }))
                                    }
                                    className="checkbox checkbox-sm border-[#8E80FF] checked:text-[#8E80FF] mr-1" 
                                /> 
                                 {day === 'Mon' ? 'จันทร์' :
                                day === 'Tue' ? 'อังคาร' :
                                day === 'Wed' ? 'พุธ' :
                                day === 'Thu' ? 'พฤหัสบดี' :
                                day === 'Fri' ? 'ศุกร์' :
                                day === 'Sat' ? 'เสาร์' : 'อาทิตย์'}
                                </label>
                            ))}
                            </div>

                            <div className='flex mt-3 gap-2 items-center'>
                              <a className="text-[#8E80FF] font-bold">ข้อจำกัดด้านสุขภาพ</a>
                              <a className='text-xs'> (ถ้ามี)</a>
                            </div> 
                                <input 
                                    type="text" 
                                    className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                                    name="health_limit"
                                    placeholder='โรคประจำตัว'
                                    value={formData.health_limit}
                                    onChange={handleChange} 
                                    />
                            <div className='flex mt-3 gap-2 items-center'>
                              <a className="text-[#8E80FF] font-bold">ประสบการณ์ที่เกี่ยวข้อง</a>
                              <a className='text-xs'> (ถ้ามี)</a>
                            </div>
                                <input 
                                    type="text" 
                                    className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                                    name="experience"
                                    placeholder='ประสบการณ์ในการเข้าร่วมกิจกรรมที่เกี่ยวข้อง'
                                    value={formData.experience}
                                    onChange={handleChange} 
                                    />
                            
                        </div>
                        <div className="flex w-full p-4 justify-center">
                            <hr className="w-1/2 border border-[#D9D9D9]" />
                        </div> 
                        <button className="btn bg-[#8E80FF] border-[#8E80FF] rounded-xl mb-2 hover:border-5">บันทึก</button>
                    </div>
                </form>
              
            </div>
              {/* Modal เซฟข้อมูล */}
            <dialog id="save_modal" className="modal">
            <div className="modal-box bg-white">
                <center>
                    <p className="text-4xl  text-[#8E80FF]">เพิ่มข้อมูลสำเร็จ</p>
                    <p className=" text-[#8E80FF]">คุณได้เพิ่มข้อมูลการสมัครงานเรียบร้อย </p>
                <div className="w-30 h-30 flex items-center justify-center my-6">
                    <img src="/check.png" className="rounded-full"></img>
                </div>
                </center>   
                <div className="modal-action flex justify-center">
                
                    <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" onClick={() => {navigate("/profile/inter_volun/view"); window.scrollTo(0, 0);}}>
                    ตกลง
                    </button>
                
                </div>
            </div>
            </dialog>
            
      </div>
    );
  };

export default InterVolunAdd;
