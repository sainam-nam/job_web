import { NavLink  } from "react-router-dom";
import { useState, useEffect , useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { RotateCcw } from "lucide-react";
import { FiRefreshCw } from "react-icons/fi";

export default function Menu({ onFilterChange , onJVTypeChange }) {
      
      const [jvtype, setJVType ] = useState("job");
      const [isMenuOpen, setIsMenuOpen] = useState(false);
      const [typeList, setTypeList] = useState([]);
      const [positionList, setPositionList] = useState([]);
      const [selectedJobType, setSelectedJobType] = useState("");
      const [selectedVolunType, setSelectedVolunType] = useState("");
      const [selectedPosition, setSelectedPosition] = useState("");

      const [ampherList, setAmpherList] = useState([]);
      const [tambonList, setTambonList] = useState([]);
      
      const [selectedAmpher, setSelectedAmpher] = useState("");
      const [selectedTambon, setSelectedTambon] = useState("");
      const [selectedAge, setSelectedAge] = useState("");
      const [selectedExper, setSelectedExper] = useState("");
      const [num_position, setNum_position] = useState("");
      const [selectedSalaryMin, setSelectedSalaryMin] = useState("");
      const [selectedSalaryMax, setSelectedSalaryMax] = useState("");
      const [keyword, setKeyword] = useState("");
      
      const [date_start, setDate_start] = useState("");
      const [date_end, setDate_end] = useState("");
      const [employment_type, setEmploymentType] = useState({
        fulltime: false,
        parttime: false,
        contract: false,
        daily: false,
      });
      // const [experience, setExperience] = useState({
      //   none: false,
      //   year1: false,
      //   year2: false,
      //   year3: false,
      // });
      const [gender, setGender] = useState({
        male: false,
        female: false,
        all: false,
      });
      const [is_lgbtq , setIsLGBTQ] = useState("2");

      const asideRef = useRef(null);
      const navigate = useNavigate();

      const apiUrl = import.meta.env.VITE_API_BASE_URL;
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
              axios.get(`${apiUrl}/sb_jobtype?type=${jvtype}`).then((res) => {
                  
                  if (Array.isArray(res.data.data)) {
                      setTypeList(res.data.data);
                      } else {
                      setTypeList([]); // fallback
                      }
              });
          }, [jvtype]);

      useEffect(() => {
              axios.get(`${apiUrl}/position_add?jobtype_id=${selectedJobType}`).then((res) => {
                  //console.log("จังหวัดที่ได้จาก backend:", res.data);    
                  if (Array.isArray(res.data.data)) {
                      setPositionList(res.data.data);
                      } else {
                      setPositionList([]); // fallback
                      }
              });
          }, [selectedJobType]);

      useEffect(() => {
        
        axios.get(`${apiUrl}/api/ampherall`).then((res) => {
          if (Array.isArray(res.data.data)) {
                      setAmpherList(res.data.data);
                      } else {
                      setAmpherList([]); // fallback
                      }
        });
        
    }, []);

    // โหลดตำบลเมื่อเลือกอำเภอ
    useEffect(() => {
        if (selectedAmpher) {
        axios.get(`${apiUrl}/api/tambon?ampher_id=${selectedAmpher}`).then((res) => {
          if (Array.isArray(res.data.data)) {
                      setTambonList(res.data.data);
                      } else {
                      setTambonList([]); // fallback
                      }
            
            
        });
        }
    }, [selectedAmpher]);
    

      

      useEffect(() => {
        if (isMenuOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'auto';
        }

        return () => {
          document.body.style.overflow = 'auto'; // ป้องกันค้าง
        };
      }, [isMenuOpen]);

    
      useEffect(() => {
        const baseFilters  = {
          keyword,
          ampher: selectedAmpher,
          tambon: selectedTambon,
          age: selectedAge !== "no-limit" ? selectedAge : "",
          gender,
        };
        const jobFilters = {
          jobtype: selectedJobType,
          position: selectedPosition,
          salary_min: selectedSalaryMin,
          salary_max: selectedSalaryMax,
          weekdays,
          employment_type,
          selectedExper,
          is_lgbtq 
        };

        const volunFilters = {
          volunType: selectedVolunType,
          num_position,
          date_start ,
          date_end 
          
        };

        const filters = {
          ...baseFilters,
          ...(jvtype === "job" ? jobFilters : volunFilters),
        };

        if (onFilterChange) {
          onFilterChange(filters);
        }
      }, [
        keyword,
        selectedJobType,
        selectedPosition,
        selectedAmpher,
        selectedTambon,
        selectedSalaryMin,
        selectedSalaryMax,
        selectedAge,
        weekdays,
        employment_type,
        selectedExper,
        gender,
        is_lgbtq,
        selectedVolunType ,
        num_position,
        date_start ,
        date_end 
      ]);

      const handleResetFilters = () => {
        setKeyword("");
        setSelectedJobType("");
        setSelectedPosition("");
        setSelectedAmpher("");
        setSelectedTambon("");
        setSelectedSalaryMin("");
        setSelectedSalaryMax("");
        setSelectedAge("");
        setSelectedExper("");
        setWeekdays({
          Mon: false,
                  Tue: false,
                  Wed: false,
                  Thu: false,
                  Fri: false,
                  Sat: false,
                  Sun: false
        });
        setEmploymentType({
          fulltime: false,
          parttime: false,
          contract: false,
          daily: false,
        });
        // setExperience({
        //   none: false,
        //   year1: false,
        //   year2: false,
        //   year3: false,
        // });
        setGender({
          male: false,
          female: false,
          all: false,
        });
        setIsLGBTQ(2);
        
      };


    const handleResetVolunFilters = () => {
        setKeyword("");
        setSelectedVolunType("");
        setSelectedAmpher("");
        setSelectedTambon("");
        setNum_position("");
        setSelectedAge("");
        setGender({
          male: false,
          female: false,
          all: false,
        });
        setDate_start("");
        setDate_end("");
      };


    return(
        <div className="w-full bg-white p-2">
            <div className="flex flex-col items-start justify-center">
                <a className="text-lg sm:text-xl md:text-xl text-gray-400 font-bold  bg-white rounded-3xl mt-0.5">ประเภท</a>
                <a className="text-xs sm:text-sm md:text-lg text-[#8E80FF] font-bold pl-1 pt-0.5"></a>
            </div>
            {/* ปุ่มเลือกงานกับจิตอาสา */}
            <div className="relative flex items-center justify-center mb-3 lg:mb-2">
                <button onClick={() =>{setJVType("job"); if (onJVTypeChange) onJVTypeChange("job"); navigate("/User/alljob");}} className={` -ml-5 btn btn-xs sm:btn-sm md:btn-md lg:btn-md xl:btn-lg text-sm sm:text-md md:text-lg lg:text-xl border-3 pt-0.5 px-5 w-1/2  rounded-full  ${jvtype === "job" ? "z-10 bg-[#8E80FF] border-[#8E80FF]" : "z-0 bg-white text-[#8E80FF] border-[#8E80FF]"}`}>งาน</button>
                <button onClick={() =>{setJVType("volun"); if (onJVTypeChange) onJVTypeChange("volun"); navigate("/User/allvolun");}} className={` -ml-5 lg:-ml-8 btn btn-xs sm:btn-sm md:btn-md lg:btn-md xl:btn-lg text-sm sm:text-md md:text-lg lg:text-lg border-3 pt-0.5 px-5 lg:px-0 lg:pl-6 w-1/2  rounded-full ${jvtype === "job" ? "z-0 bg-white text-[#8E80FF] border-[#8E80FF]" : "z-10 bg-[#8E80FF] border-[#8E80FF]"}`}>กิจกรรมจิตอาสา</button>
            </div>
            {/* ปุ่มเปิดเมนู (เฉพาะจอเล็ก) */}
            <div className="flex justify-center lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-sm text-[#8E80FF] font-bold border border-[#8E80FF] px-4 py-1 rounded-full hover:bg-[#8E80FF] hover:text-white"
              >
                ☰ เลือกประเภท
              </button>
            </div>
            {/* ✅ overlay ดำ เมื่อเมนูเปิด (เฉพาะมือถือ) */}
            {isMenuOpen && (
              <div
                className="fixed inset-0 bg-black/20 z-10 lg:hidden"
                onClick={() => setIsMenuOpen(false)}
              ></div>
            )}
          {jvtype === "job" ? (
              <>
              <aside 
              ref={asideRef}
              className={`bg-white transition-transform duration-300 ease-in-out fixed z-20 top-0 left-0 h-full w-80 p-2 overflow-y-auto lg:static lg:block 
              ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 `}>
                
                <div className="flex flex-col items-center bg-[#8E80FF] rounded-3xl w-full gap-2 p-3 py-8">
                  
                    

                <div className="flex flex-col items-center justify-center w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <a className="font-bold">ค้นหางาน</a>
                    <button
                      onClick={handleResetFilters}
                      className="flex items-center p-1 gap-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 justify-center"
                    >
                      <FiRefreshCw className="w-4 h-4" strokeWidth={4} />
                      
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="คำที่เกี่ยวข้อง"
                    className="input input-bordered bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 w-full">
                  <div className="flex flex-col">
                    <a>ประเภทงาน</a>
                    <select
                                    name='jobtype'
                                    className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                    value={selectedJobType}
                                    onChange={(e) => setSelectedJobType(e.target.value)}
                                >
                                    <option value="">เลือกประเภทงาน</option>
                                    {Array.isArray(typeList) && typeList.map((jt) => (
                                        <option key={jt.jobtype_id} value={jt.jobtype_id}>
                                            {jt.jobtype_name}
                                        </option>
                                        ))}
                                </select>
                  </div>
                  <div className="flex flex-col">
                    <a>ตำแหน่งงาน</a>
                    <select
                                    name='position_id'
                                    className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                    value={selectedPosition}
                                    onChange={(e) => setSelectedPosition(e.target.value)}
                                >
                                    <option value="">เลือกตำแหน่งงาน</option>
                                    {Array.isArray(positionList) && positionList.map((ps) => (
                                        <option key={ps.position_id} value={ps.position_id}>
                                            {ps.position_name}
                                        </option>
                                        ))}
                                </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a>การจ้างงาน</a>
                    <div className="flex justify-center items-center gap-3">
                      <label className="label text-white">
                        <input 
                          type="checkbox"  
                          checked={employment_type.fulltime}
                          onChange={(e) =>
                            setEmploymentType({ ...employment_type, fulltime: e.target.checked })
                          } 
                          className="checkbox checkbox-lg border-white checked:text-white"
                        />
                        ประจำ
                      </label>
                      <label className="label text-white">
                        <input 
                          type="checkbox"  
                          checked={employment_type.parttime}
                          onChange={(e) =>
                            setEmploymentType({ ...employment_type, parttime: e.target.checked })
                          } 
                          className="checkbox checkbox-lg border-white checked:text-white"
                        />
                        พาร์ทไทม์
                      </label>
                      </div>
                    <div className="flex justify-center items-center gap-3">
                    <label className="label text-white">
                        <input 
                          type="checkbox"  
                          checked={employment_type.contract}
                          onChange={(e) =>
                            setEmploymentType({ ...employment_type, contract: e.target.checked })
                          } 
                          className="checkbox checkbox-lg border-white checked:text-white"
                        />
                        สัญญาจ้าง
                      </label>
                      <label className="label text-white">
                        <input 
                          type="checkbox"  
                          checked={employment_type.daily}
                          onChange={(e) =>
                            setEmploymentType({ ...employment_type, daily: e.target.checked })
                          } 
                          className="checkbox checkbox-lg border-white checked:text-white"
                        />
                        รายวัน
                      </label>
                      {/* <label className="label text-white">
                        <input 
                          type="checkbox"  
                          checked={employment_type.daily}
                          onChange={(e) =>
                            setEmploymentType({ ...employment_type, daily: e.target.checked })
                          } 
                          className="checkbox checkbox-lg border-white"
                        />
                        ฝึกงาน
                      </label> */}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <a>ค่าตอบแทน</a>
                    {/* <select
                      className="select bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl"
                      value={selectedSalary}
                      onChange={(e) => setSelectedSalary(e.target.value)}
                    >
                      <option value="">เลือกค่าตอบแทน</option>
                      <option value="<300">ต่ำกว่า 300 บาท</option>
                      <option value="300">มากกว่า เท่ากับ 300 บาท</option>
                      <option value="500">มากกว่า 500 บาท</option>
                      <option value="1000">มากกว่า 1,000 บาท</option>
                      <option value="5000">มากกว่า 5,000 บาท</option>
                      <option value="9000">มากกว่า 9,000 บาท</option>
                      <option value="10000">มากกว่า 10,000 บาท</option>
                      <option value="30000">มากกว่า 30,000 บาท</option>
                    </select> */}
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="ต่ำสุด"
                        className="input bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl px-3 py-2"
                        value={selectedSalaryMin}
                        onChange={(e) => setSelectedSalaryMin(e.target.value)}
                      />
                      
                      <input
                        type="number"
                        min="0"
                        placeholder="สูงสุด"
                        className="input bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl px-3 py-2"
                        value={selectedSalaryMax}
                        onChange={(e) => setSelectedSalaryMax(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <a>อำเภอ</a>
                    {/* อำเภอ */}
                                        <select
                                            className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                            value={selectedAmpher}
                                            onChange={(e) => setSelectedAmpher(e.target.value)}
                                            
                                        >
                                            <option value="">เลือกอำเภอ</option>
                                            {Array.isArray(ampherList) && ampherList.map((a) => (
                                            <option key={a.ampher_id} value={a.ampher_id}>
                                                {a.ampher_name}
                                            </option>
                                            ))}
                                        </select>
                  </div>
                  <div className="flex flex-col w-full">
                    <a>ตำบล</a>
                    <select
                                        className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                        value={selectedTambon}
                                        onChange={(e) => setSelectedTambon(e.target.value)}
                                        //disabled={!selectedAmpher}
                                    >
                                        <option value="">เลือกตำบล</option>
                                        {Array.isArray(tambonList) && tambonList.map((t) => (
                                        <option key={t.tambon_id} value={t.tambon_id}>
                                            {t.tambon_name}
                                        </option>
                                        ))}
                                    </select>
                  </div>
                  <div className="flex flex-col">
                    <a>ประสบการณ์</a>
                    <input
                      type="number"
                      min="0"
                      placeholder="ระบุจำนวนปีประสบการณ์"
                      className="input bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl px-3 py-2"
                      value={selectedExper}
                      onChange={(e) => setSelectedExper(e.target.value)}
                    />
                    
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1">อายุ</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="ระบุอายุ เช่น 18"
                      className="input bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl px-3 py-2"
                      value={selectedAge}
                      onChange={(e) => setSelectedAge(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <a>เพศ</a>
                    <div className="flex justify-center items-center gap-3">
                    <label className="label text-white">
                        <input 
                          type="checkbox"  
                          className="checkbox checkbox-lg text-white border-[#D9D9D9] checked:text-white" 
                          checked={gender.male}
                          onChange={(e) =>
                            setGender({ ...gender, male: e.target.checked })
                          }
                        />ชาย
                      </label>
                    <label className="label text-white">
                        <input 
                          type="checkbox"  
                          className="checkbox checkbox-lg border-[#D9D9D9] checked:text-white" 
                          checked={gender.female}
                          onChange={(e) =>
                            setGender({ ...gender, female: e.target.checked })
                          }
                        />หญิง
                      </label>
                      <label className="label text-white">
                        <input 
                          type="checkbox"  
                          className="checkbox checkbox-lg border-[#D9D9D9] checked:text-white" 
                          checked={gender.all}
                          onChange={(e) =>
                            setGender({ ...gender, all: e.target.checked })
                          }
                        />ไม่จำกัด
                      </label>
                    </div>
                  </div>
                  {/* <div className="flex flex-col">
                    <a>LGBTQIA+</a>
                    <select
                      className="select bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl"
                      value={is_lgbtq}
                      onChange={(e) => setIsLGBTQ(e.target.value)}
                    >
                      <option value="">เลือกว่ารับ LGBTQIA+ หรือไม่</option>
                      <option value="0">งานที่ไม่รับ LGBTQIA+</option>
                      <option value="1">งานที่รับ LGBTQIA+</option>
                      <option value="2">ทั้งรับและไม่รับ</option>
                    </select>
                  </div> */}
                  
                  <div className="flex flex-col">
                    <a>วันทำงาน</a>
                    <div className='flex gap-2 my-2'>      
                                <div className="flex gap-3 flex-wrap">
                                    <button type="button" onClick={selectAllDays} className="btn btn-sm btn-outline rounded-xl">ทุกวัน</button>
                                    <button type="button" onClick={selectWeekdaysOnly} className="btn btn-sm btn-outline rounded-xl">จันทร์-ศุกร์</button>
                                    <button type="button" onClick={selectWeekendOnly} className="btn btn-sm btn-outline rounded-xl">เสาร์-อาทิตย์</button>
                                </div>

                            </div>  
                            <div className="flex gap-2 grid grid-cols-3 justify-center">
                                {Object.keys(weekdays).map((day) => (
                                <label key={day} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={weekdays[day]}
                                    onChange={() =>
                                    setWeekdays((prev) => ({ ...prev, [day]: !prev[day] }))
                                    }
                                    className="checkbox checkbox-lg border-white text-white checked:text-white mr-1" 
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
                </div>


                
              </div>
            
            </aside>  
              </>
          ):(
 <>
              <aside 
              ref={asideRef}
              className={`bg-white transition-transform duration-300 ease-in-out fixed z-20 top-0 left-0 h-full w-80 p-2 overflow-y-auto lg:static lg:block 
              ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 `}>
                
                <div className="flex flex-col items-center bg-[#8E80FF] rounded-3xl w-full gap-2 p-3 py-8">
                  
                    

                <div className="flex flex-col items-center justify-center w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <a className="font-bold">ค้นหากิจกรรมจิตอาสา</a>
                    <button
                      onClick={handleResetVolunFilters}
                      className="flex items-center p-1 gap-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 justify-center"
                    >
                      <FiRefreshCw className="w-4 h-4" strokeWidth={4} />
                      
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="คำที่เกี่ยวข้อง"
                    className="input input-bordered bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 w-full">
                  <div className="flex flex-col">
                    <a>ประเภทกิจกรรมจิตอาสา</a>
                    <select
                                    name='voluntype'
                                    className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                    value={selectedVolunType}
                                    onChange={(e) => setSelectedVolunType(e.target.value)}
                                >
                                    <option value="">เลือกประเภทกิจกรรม</option>
                                    {Array.isArray(typeList) && typeList.map((vt) => (
                                        <option key={vt.voluntype_id} value={vt.voluntype_id}>
                                            {vt.voluntype_name}
                                        </option>
                                        ))}
                                </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1">จำนวนผู้เข้าร่วม</label>
                    <input
                      type="text"
                      min="0"
                      placeholder="จำนวนผู้เข้าร่วมที่กิจกรรมรับ"
                      className="input bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl px-3 py-2"
                      value={num_position}
                      onChange={(e) => setNum_position(e.target.value)}
                    />
                  </div>
                 
                  <div className="flex flex-col">
                    <a>อำเภอ</a>
                    {/* อำเภอ */}
                                        <select
                                            className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                            value={selectedAmpher}
                                            onChange={(e) => setSelectedAmpher(e.target.value)}
                                            
                                        >
                                            <option value="">เลือกอำเภอ</option>
                                            {Array.isArray(ampherList) && ampherList.map((a) => (
                                            <option key={a.ampher_id} value={a.ampher_id}>
                                                {a.ampher_name}
                                            </option>
                                            ))}
                                        </select>
                  </div>
                  <div className="flex flex-col w-full">
                    <a>ตำบล</a>
                    <select
                                        className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                        value={selectedTambon}
                                        onChange={(e) => setSelectedTambon(e.target.value)}
                                        //disabled={!selectedAmpher}
                                    >
                                        <option value="">เลือกตำบล</option>
                                        {Array.isArray(tambonList) && tambonList.map((t) => (
                                        <option key={t.tambon_id} value={t.tambon_id}>
                                            {t.tambon_name}
                                        </option>
                                        ))}
                                    </select>
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="mb-1">อายุ</label>
                    <input
                      type="text"
                      min="0"
                      placeholder="จำนวนผู้เข้าร่วมที่กิจกรรมรับ"
                      className="input bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl px-3 py-2"
                      value={selectedAge}
                      onChange={(e) => setSelectedAge(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <a>เพศ</a>
                    <div className="flex justify-center items-center gap-3">
                    <label className="label">
                        <input 
                          type="checkbox"  
                          className="checkbox checkbox-sm border-[#D9D9D9] checked:text-white" 
                          checked={gender.male}
                          onChange={(e) =>
                            setGender({ ...gender, male: e.target.checked })
                          }
                        />ชาย
                      </label>
                    <label className="label">
                        <input 
                          type="checkbox"  
                          className="checkbox checkbox-sm border-[#D9D9D9] checked:text-white" 
                          checked={gender.female}
                          onChange={(e) =>
                            setGender({ ...gender, female: e.target.checked })
                          }
                        />หญิง
                      </label>
                      <label className="label">
                        <input 
                          type="checkbox"  
                          className="checkbox checkbox-sm border-[#D9D9D9] checked:text-white" 
                          checked={gender.all}
                          onChange={(e) =>
                            setGender({ ...gender, all: e.target.checked })
                          }
                        />ไม่กำหนด
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1">วันที่จัดกิจกรรม</label>
                    
                    <div className="flex items-center">
                     
                        <input
                          type="date"
                          className="input bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl px-3 py-2"
                          value={date_start}
                          onChange={(e) => setDate_start(e.target.value)}
                        />

                      <a className="px-1"> ถึง </a>
                      
                      <input
                        type="date"
                        className="input bg-white border-white w-full text-[#8E80FF] text-sm rounded-xl px-3 py-2"
                        value={date_end}
                        onChange={(e) => setDate_end(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  
                </div>


                
              </div>
            
            </aside>  
              </>
          )}
            

        </div>
    )
}