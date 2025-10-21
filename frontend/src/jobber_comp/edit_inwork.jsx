import React, { useState , useEffect} from 'react'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { AlertTriangle } from 'lucide-react';

const InterWorkEdit = () => {
        const { inter_work_id } = useParams();
        const [userId, setUserId] = useState(null);
        const navigate = useNavigate();
        const [jobtypeList, setJobTypeList] = useState([]);
        const [positionList, setPositionList] = useState([]);
        const [selectedJobType, setSelectedJobType] = useState("");

        const [ampherList, setAmpherList] = useState([]);
        const [tambonList, setTambonList] = useState([]);

        const [selectedAmpher, setSelectedAmpher] = useState("");
        const [selectedTambon, setSelectedTambon] = useState("");
            const [isInitialLoad, setIsInitialLoad] = useState(true);
      
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const [formData, setFormData] = useState({
            inter_work_id: inter_work_id,
            jobber_id: userId,
            position_id: "",        // select
            min: "",
            max: "",
            start: "",
            end: "",
            days: "",
            tambon_id: "",
            ampher_id: ""
        });
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

        
  
        // แปลง string เป็น object: เช่น "1100001" → {Mon: true, Tue: true, ..., Sun: true/false}
        const convertDaysToWeekdays = (daysString) => {
          const dayKeys = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const result = {};
          for (let i = 0; i < 7; i++) {
            result[dayKeys[i]] = daysString[i] === "1";
          }
          return result;
        };


      useEffect(() => {
          const fetchEduData = async () => {
            if (!userId) return;
            try {
              const res = await axios.get(`${apiUrl}/user_interworkdata?inter_work_id=${inter_work_id}`);
              if (res.data && res.data.data && res.data.data.length > 0) {
                const interwork = res.data.data[0]; // ดึงรายการแรก
                setFormData({
                  position_id: interwork.position_id,
                  min: interwork.salary_min || "",
                  max: interwork.salary_max || "",
                  start: interwork.hour || "",
                  end: interwork.end_hour || "",
                  days: interwork.days || "",
                  
                  
                });
                if (interwork.days) {
                  const converted = convertDaysToWeekdays(interwork.days);
                  setWeekdays(converted);
                }
                setSelectedJobType(interwork.jobtype_id);
                setSelectedAmpher(interwork.ampher_id);
                
                setSelectedTambon(interwork.tambon_id);
                //console.log("tambon",interwork.tambon_id);
              }
            } catch (error) {
              console.error("Error fetching education data:", error);
            }
          };

          if (userId) {
            fetchEduData();
          }
        }, [userId]);



      useEffect(() => {
              axios.get(`${apiUrl}/jobtypeall`).then((res) => {
                    
                  if (Array.isArray(res.data.data)) {
                      setJobTypeList(res.data.data);
                      } else {
                      setJobTypeList([]); // fallback
                      }
              });
          }, []);

      useEffect(() => {
              axios.get(`${apiUrl}/position_add?jobtype_id=${selectedJobType}`).then((res) => {
                     
                  if (Array.isArray(res.data.data)) {
                      setPositionList(res.data.data);
                      } else {
                      setPositionList([]); // fallback
                      }
              });
          }, [selectedJobType]);
  
        const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        };
        useEffect(() => {
                
                axios.get(`${apiUrl}/api/ampher?jangwat_id=57`).then((res) => {
                    setAmpherList(res.data.data);
                    setTambonList([]); // ล้างตำบลเมื่อจังหวัดเปลี่ยน
                    
                });
                
            }, []);
        
            // โหลดตำบลเมื่อเลือกอำเภอ
            useEffect(() => {
                if (selectedAmpher) {
                axios.get(`${apiUrl}/api/tambon?ampher_id=${selectedAmpher}`).then((res) => {
                    setTambonList(res.data.data);
                    if (!isInitialLoad) {
                        setSelectedTambon(""); // รีเซตเฉพาะกรณีที่ user เปลี่ยนจริง ๆ
                    }
                });
                }
            }, [selectedAmpher]);


        const handleSubmit = async (e) => {
            e.preventDefault();

            if (!userId) {
                alert("กำลังโหลดข้อมูลผู้ใช้ กรุณารอสักครู่");
                return;
            }
            if (!formData.position_id || !formData.min || !formData.max) {
                alert("กรุณากรอกข้อมูลให้ครบถ้วน");
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
            form.append("inter_work_id", inter_work_id); 
            form.append("position_id", formData.position_id);               // เพิ่ม id ผู้ใช้
            form.append("min", formData.min);
            form.append("max", formData.max);
            form.append("start", formData.start);
            form.append("end", formData.end);
            form.append("days", available_days);
            form.append("tambon_id", selectedTambon);
            form.append("ampher_id", selectedAmpher);

            try {
                const res = await axios.post(`${apiUrl}/api/user_interwork_update`, form, {
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
                  <h2 className="font-bold text-xl">แก้ไขข้อมูลประสบการณ์การทำงาน</h2>
              </div>
              
                  <form onSubmit={handleSubmit} className='mt-2 '>
                    <div className="flex flex-col gap-2 items-center justify-center ">
                        
                        <div className="flex flex-col gap-1 text-sm w-2/3">
                        {/* ประเภทงาน */}
                        
                            <a className="text-[#8E80FF] font-bold mt-2">ประเภทงานที่สนใจ</a>
                                <select
                                    name='jobtype_id'
                                    className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                    value={selectedJobType}
                                    onChange={(e) => setSelectedJobType(e.target.value)}
                                >
                                    <option value="">-- กรุณาเลือกประเภทงาน --</option>
                                    {Array.isArray(jobtypeList) && jobtypeList.map((jt) => (
                                        <option key={jt.jobtype_id} value={jt.jobtype_id}>
                                            {jt.jobtype_name}
                                        </option>
                                        ))}
                                </select>
                        {/* ตำแหน่งงาน */}
                            <a className="text-[#8E80FF] font-bold mt-2">ตำแหน่งงานที่สนใจ</a>
                                <select
                                    name='position_id'
                                    className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                    value={formData.position_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- กรุณาเลือกวุฒิการศึกษา --</option>
                                    {Array.isArray(positionList) && positionList.map((ps) => (
                                        <option key={ps.position_id} value={ps.position_id}>
                                            {ps.position_name}
                                        </option>
                                        ))}
                                </select>
                            <a className="text-[#8E80FF] font-bold mt-2">เงินเดือน</a>
                
                            <div className="flex gap-2">
                                <div className="flex flex-col w-full">
                                    <div className="text-[#8E80FF] font-bold">ต่ำสุด</div>
                                        <input 
                                            type="text" 
                                            className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                            name="min"
                                            value={formData.min || ""}
                                            onChange={handleChange} 
                                            required/>
                                </div>
                                <div className="flex flex-col w-full">
                                    <div className="text-[#8E80FF] font-bold">สูงสุด</div>
                                        <input 
                                            type="text" 
                                            className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                            name="max"
                                            value={formData.max || ""}
                                            onChange={handleChange} 
                                            required/>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex flex-col w-full">
                                    {/* อำเภอ */}
                                    <div className="text-[#8E80FF] font-bold">อำเภอ</div>
                                        <select
                                            className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                            value={selectedAmpher}
                                            onChange={(e) => setSelectedAmpher(e.target.value)}
                                            
                                        >
                                            <option value="">-- กรุณาเลือกอำเภอ --</option>
                                            {Array.isArray(ampherList) && ampherList.map((a) => (
                                            <option key={a.ampher_id} value={a.ampher_id}>
                                                {a.ampher_name}
                                            </option>
                                            ))}
                                        </select>
                                </div>
                                <div className="flex flex-col w-full">
                                    <div className="text-[#8E80FF] font-bold">ตำบล</div>
                                    {/* ตำบล */}
                                    <select
                                        className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                        value={selectedTambon}
                                        onChange={(e) => setSelectedTambon(e.target.value)}
                                        //disabled={!selectedAmpher}
                                    >
                                        <option value="">-- กรุณาเลือกตำบล --</option>
                                        {Array.isArray(tambonList) && tambonList.map((t) => (
                                        <option key={t.tambon_id} value={t.tambon_id}>
                                            {t.tambon_name}
                                        </option>
                                        ))}
                                    </select>
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
                                            />
                                </div>
                                <div className="flex flex-col w-full">
                                    <div className="text-[#8E80FF] font-bold">ถึง</div>
                                        <input 
                                            type="time" 
                                            className="input w-full bg-[#8E80FF] text-white border-[#A3A3A3] rounded-box" 
                                            name="end"
                                            value={formData.end || ""}
                                            onChange={handleChange} 
                                            />
                                </div>
                            </div>
                            <div className='flex gap-2 my-2'>      
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
                    <p className="text-4xl  text-[#8E80FF]">แก้ไขข้อมูลสำเร็จ</p>
                    <p className=" text-[#8E80FF]">คุณได้แก้ไขข้อมูลการสมัครงานเรียบร้อย </p>
                <div className="w-30 h-30 flex items-center justify-center my-6">
                    <img src="/check.png" className="rounded-full"></img>
                </div>
                </center>   
                <div className="modal-action flex justify-center">
                
                    <button className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg" onClick={() => {navigate("/profile/inter_work/view"); window.scrollTo(0, 0);}}>
                    ตกลง
                    </button>
                
                </div>
            </div>
            </dialog>
            
      </div>
    );
  };

export default InterWorkEdit;
