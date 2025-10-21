import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../emp_comp/navbar";
import Footer from "../emp_comp/footer";
import { MdOutlineSearch, MdWorkOff } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import JobCard from "../emp_comp/job_card";
import { Editor } from "@tinymce/tinymce-react";
import { FiRefreshCw } from "react-icons/fi";
import { AlertTriangle } from "lucide-react";
import TooltipField from "../comp/tooltip";
import TiptapEditor from "../comp/tiptap";

const apiUrl = import.meta.env.VITE_API_BASE_URL;


function Employer_index() {
  const [data, setData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [limit, setLimit] = useState(4);
  
  const navigate = useNavigate();


  const [userId, setUserId] = useState([]);
  const [newPost_id, setNewPost_id] = useState();
  const [MJlimit, setMJLimit] = useState(3);
  const [MJdata, setMJData] = useState([]);
  const [MJpage, setMJPage] = useState(1);
  const [MJtotal, setMJTotal] = useState();
  const [MJtotalPages, setMJTotalPages] = useState(1);
  const [search, setSearch ] = useState("");
  const [status, setStatus] = useState("p");

  const [jangwatList, setJangwatList] = useState([]);
  const [ampherList, setAmpherList] = useState([]);
  const [tambonList, setTambonList] = useState([]);

  const [jobtypeList, setJobTypeList] = useState([]);
  const [positionList, setPositionList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [selectedJobType, setSelectedJobType] = useState("");
  
  
  const [currentStep, setCurrentStep] = useState(1);
  const defaultFormData = {
    num_position: "1",
    minsalary: "",
    maxsalary: "",
    address: 0,
    location: "",
    tambon_id: "",
    ampher_id: "",
    jangwat_id: "",
    latitude: "",
    longitude: "",
    details: "",
    min_age: "",
    max_age: "",
    gender: "A",
    year_expe: 0,
    experience: "",
    notes: "",
    ownbenefit: 0,
    benefits: "",
    hour: "",
    end_hour: "",
    days: "",
    owncontact: 0,
    emp_id: "",
    jobtype_id: "",
    position_code: "",
    education_code: "",
    job_pic: null,
    type: "f",
    selectedHs: [""],
    selectedSs: [""],
    phone: "",
    email: "",
  };
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("jobForm");
    return saved
      ? {
          selectedHs: [""],
          selectedSs: [""],
          ...JSON.parse(saved),
        }
      : defaultFormData;
  });

  const handleResetFilters = () => {
    setFormData(defaultFormData);
    localStorage.removeItem("jobForm"); // ถ้าอยากเคลียร์ localStorage ด้วย
  };

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

      const encodeBitString = (obj, order) => {
        return order.map(key => (obj[key] ? "1" : "0")).join("");
      };

      const weekdaysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat",  "Sun"];
      const daywork = encodeBitString(weekdays, weekdaysOrder);
      
      //เพิ่มจำนวนคนที่มาสมัครงานเรา 
      //เพิ่มจำนวนตำแหน่งที่ต้องการรับสมัคร
      
      const [hs, setHs] = useState([]);
      //const [selectedHs, setSelectedHs] = useState([""]);
      const [ss, setSs] = useState([]);
      //const [selectedSs, setSelectedSs] = useState([""]);
      

      useEffect(() => {
        axios.get(`${apiUrl}/hs`).then((res) => {
          setHs(res.data.data || []);
          //console.log("Hsdata",res.data.data);
        });
      }, []);

      useEffect(() => {
        axios.get(`${apiUrl}/ss`).then((res) => {
          setSs(res.data.data || []);
          //console.log("Ssdata",res.data.data);
        });
      }, []);

      const addHs = () => {
        setFormData((prev) => ({
          ...prev,
          selectedHs: ["", ...prev.selectedHs],
        }));
      };

      
      const removeHs = (index) => {
        setFormData((prev) => {
          const newSelected = [...prev.selectedHs];
          newSelected.splice(index, 1);
          return { ...prev, selectedHs: newSelected };
        });
      };

      const addSs = () => {
        setFormData((prev) => ({
          ...prev,
          selectedSs: ["", ...prev.selectedSs],
        }));
      };

      
      const removeSs = (index) => {
        setFormData((prev) => {
          const newSelected = [...prev.selectedSs];
          newSelected.splice(index, 1);
          return { ...prev, selectedSs: newSelected };
        });
      };

      const getHsAvailableOptions = (index) => {
        return (hs || []).filter(
          (skill) =>
            !(formData.selectedHs || []).includes(skill.hardskill_id) ||
            (formData.selectedHs && formData.selectedHs[index] === skill.hardskill_id)
        );
      };

      //console.log("selectHS",selectedHs);

      const getSsAvailableOptions = (index) => {
        return (ss || []).filter(
          (skill) =>
            !(formData.selectedSs || []).includes(skill.softskill_id) ||
            (formData.selectedSs && formData.selectedSs[index] === skill.softskill_id)
        );
      };



      const handleHsChange = (index, value) => {
        setFormData((prev) => {
          const newSelected = [...prev.selectedHs];
          newSelected[index] = parseInt(value);
          return { ...prev, selectedHs: newSelected };
        });
      };

      const handleSsChange = (index, value) => {
        setFormData((prev) => {
          const newSelected = [...prev.selectedSs];
          newSelected[index] = parseInt(value);
          return { ...prev, selectedSs: newSelected };
        });
      };

      
      const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setFormData((prev) => ({
            ...prev,
            job_pic: file,   // เก็บไฟล์ใน state โดยตรง
          }));
        }
      };



  const handleEditorChange = (field, content) => {
    setFormData((prev) => ({
      ...prev,
      [field]: content,
    }));
  };


  useEffect(() => {
    localStorage.setItem("jobForm", JSON.stringify(formData));
  }, [formData]);

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
//ข้อมูลยังไม่เข้า แต่ข้อมูล เปลี่ยนแท็บแล้วยังอยู่ดี ผ่าน แต่ถ้ารีเฟรชอาจจะหายไปบางข้อมูล
  
  const handleGoGo = async (e) => {
    if (e) e.preventDefault();

    const requiredFields = [
              "num_position",
              "location",
              "position_code",
              "education_code",
              "type",
              "phone",
              "email",
              "tambon_id",
            ];
            
            const missingFields = requiredFields.filter(
              (field) => !formData[field] || formData[field].toString().trim() === ""
            );

            if (missingFields.length > 0 || daywork === "0000000") {
              console.warn("ข้อมูลไม่ครบ:", missingFields);
              document.getElementById("incomplete_modal")?.showModal();
            } else {
              await document.getElementById("save_modal").showModal();
            }
  }

  const handleSubmit = async () => {
            const form = new FormData();

            

            let salaryValue = "0";

            if (formData.minsalary && formData.maxsalary) {
              salaryValue = `${formData.minsalary}-${formData.maxsalary}`;
            } else if (formData.minsalary) {
              salaryValue = formData.minsalary;
            } else if (formData.maxsalary) {
              salaryValue = formData.maxsalary;
            }

            

              try {
                form.append("num_position", formData.num_position);
                form.append("salary", salaryValue);
                form.append("location", formData.location);
                form.append("tambon_id", formData.tambon_id ?? "");
                form.append("latitude", formData.latitude ?? "");
                form.append("longitude", formData.longitude ?? "");
                form.append("details", formData.details ?? "");            
                form.append("min_age", formData.min_age ?? "");
                form.append("max_age", formData.max_age ?? "");
                form.append("gender", formData.gender ?? "");
                form.append("year_expe", formData.year_expe ?? 0);
                form.append("experience", formData.experience ?? "");

                form.append("notes", formData.notes ?? "");
                form.append("benefits", formData.benefits ?? "");
                form.append("hour", formData.hour ?? "");
                form.append("end_hour", formData.end_hour ?? "");
                form.append("days", daywork);
                form.append("emp_id", userId);
                form.append("position_code", formData.position_code ?? "");            
                form.append("education_code", formData.education_code ?? "");
                form.append("type", formData.type ?? "");
                form.append("phone", formData.phone ?? "");
                form.append("email", formData.email ?? "");

                formData.selectedHs.forEach(id => form.append('selectedHs[]', id));
                formData.selectedSs.forEach(id => form.append('selectedSs[]', id));

                if (formData.job_pic instanceof File) {
                  form.append("job_pic", formData.job_pic);
                }


                // console.log("=== FormData Preview ===");
                // for (let [key, value] of form.entries()) {
                //   console.log(key, ":", value);
                // }

                const res = await axios.post(`${apiUrl}/api/job_posting_add`, form);
                console.log("Response status:", res.status, res.data);

                if (res.status === 200 || res.status === 201) {
                  document.getElementById("save_modal")?.close();
                  document.getElementById("success_modal")?.showModal();
                  handleResetFilters();
                  setCurrentStep(1);
                  MJfetchData();
                  setNewPost_id(res.data.post_id);
                  //บันทึกยังไม่ได้ ติดเรื่องรูป ตอนรีเฟรชแล้วรูปหาย ใกล้ละๆ
                } else {
                  console.error("Unexpected status:", res.status, res.data);
                  //document.getElementById("incomplete_modal")?.showModal();
                  //ตรงนี้
                }
            } catch (error) {
                console.error("Upload failed:", error?.response || error);
                //document.getElementById("incomplete_modal")?.showModal();
            }
            };
            //เข้าละไอเวร ลืมกดหน้าถัดไปในDB

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
      setUserData(res.data.user);
      setUserId(res.data.user.emp_id);
      //console.log(res.data.user);
    })
    .catch(err => {
      console.error(err);
      // token หมดอายุหรือไม่ถูกต้อง -> กลับหน้า login
      alert("เกิดข้อผิดพลาด กรุณาเข้าสู่ระบบอีกครั้ง");
      window.location.href = "/login";
    });
    
    const updateLimit = () => {
      const width = window.innerWidth;

      if (width <= 640) {
        // sm: < 640px
        setLimit(6);
      } else if (width <= 768) {
        // md: < 768px
        setLimit(6);
      } else if (width <= 1024) {
        // lg: < 1024px
        setLimit(4);
      } else {
        // xl และใหญ่กว่า
        setLimit(4);
      }
    };

    // รันตอนแรก
    updateLimit();

    // ฟัง event resize
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, [limit ]);


  // if (!userData) return <div>Loading...</div>;

useEffect(() => {
    if (!userId) return;
    MJfetchData();
  }, [userId, MJpage, MJlimit, search, status]);

  const MJfetchData = async () => {
    try {
        
    let endpoint = "";

    if (status === "p") {
      endpoint = `${apiUrl}/my_job?emp_id=${userId}&page=${MJpage}&limit=${MJlimit}&keyword=${search}&status=ON`;
    } else if (status === "f") {
      endpoint = `${apiUrl}/my_job?emp_id=${userId}&page=${MJpage}&limit=${MJlimit}&keyword=${search}&status=Finish`;
    } else {
      console.error("Unknown status:", status);
      setMJData([]);
      return; // ออกจากฟังก์ชันทันที
    }
///////เหลือให้คะแนนผู้สมัคร
      const res = await fetch(endpoint);
      const result = await res.json();
      //console.log("result=",result);

      if(Array.isArray(result.data)){
        //console.log("sql", res)
        setMJData(result.data);
        //console.log(result.data);
      } else {
        console.error("Data format error:", result);
        setMJData([]);
      }
      setMJTotal(result.totalRecords);
      setMJTotalPages(result.totalPages || 1);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
        axios.get(`${apiUrl}/api/jangwat`).then((res) => {   
            if (Array.isArray(res.data.data)) {
                setJangwatList(res.data.data);
                } else {
                setJangwatList([]);
                }
        });
    }, []);

    useEffect(() => {
        if (formData.jangwat_id) {
            axios.get(`${apiUrl}/api/ampher?jangwat_id=${formData.jangwat_id}`).then((res) => {
            if (Array.isArray(res.data.data)) {
                setAmpherList(res.data.data);
                setIsAmpherLoaded(true);
                } else {
                setAmpherList([]);
                }

        });
    }
    }, [formData.jangwat_id]);

    useEffect(() => {
        if (formData.ampher_id) {
            axios.get(`${apiUrl}/api/tambon?ampher_id=${formData.ampher_id}`).then((res) => {
                if (Array.isArray(res.data.data)) {
                setTambonList(res.data.data);
                } else {
                setTambonList([]);
                }
            });
    }
    }, [formData.ampher_id]);

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
              axios.get(`${apiUrl}/position_add?jobtype_id=${formData.jobtype_id}`).then((res) => {
                  //console.log("จังหวัดที่ได้จาก backend:", res.data);    
                  if (Array.isArray(res.data.data)) {
                      setPositionList(res.data.data);
                      } else {
                      setPositionList([]); // fallback
                      }
              });
          }, [formData.jobtype_id]);

      useEffect(() => {
              axios.get(`${apiUrl}/api/edu`).then((res) => {   
                  if (Array.isArray(res.data.data)) {
                      setEducationList(res.data.data);
                      } else {
                      setEducationList([]); // fallback
                      }
              });
          }, []);

      useEffect(() => {
            if (formData.address === 1 && userId ) {
              axios.get(`${apiUrl}/emp_address?emp_id=${userId}`).then((res) => {
                 
                  if (res.data && res.data.data && res.data.data.length > 0) {
                    const empAddr = res.data.data[0];
                    const tambonId = empAddr.tambon_id?.toString() || "";

                    // ✅ เซตค่าเข้า formData
                    setFormData((prev) => ({
                      ...prev,
                      location: empAddr.address || "",

                      latitude: empAddr.latitude || "",
                      longitude: empAddr.longitude || "",
                      tambon_id: tambonId || "",
                      ampher_id: tambonId.substring(0, 4) || "",
                      jangwat_id: tambonId.substring(0, 2) || "",
                    }));
                    
                  } 
                
              });
            } else if (formData.address === 0) {
              setFormData((prev) => ({
                ...prev,
                location: "",
                latitude: "",
                longitude: "",
                tambon_id: "",
                ampher_id: "",
                jangwat_id: "",
              }));

            }
          }, [formData.address , userId]);

          useEffect(() => {
            if (formData.ownbenefit === 1 && userId ) {
              axios.get(`${apiUrl}/emp_benefit?emp_id=${userId}`).then((res) => {
                 
                  if (res.data && res.data.data && res.data.data.length > 0) {
                    const empAddr = res.data.data[0];
                    
                    setFormData((prev) => ({
                      ...prev,
                      benefits: empAddr.benefits || "",
                    }));
                  } 
                console.log('benefit----',formData.benefits);
              });
            } else if (formData.ownbenefit === 0) {
              setFormData((prev) => ({
                ...prev,
                benefits: "",
              }));
            }
          }, [formData.ownbenefit , userId]);

          useEffect(() => {
            if (formData.owncontact === 1 && userId ) {
              axios.get(`${apiUrl}/emp_contact?emp_id=${userId}`).then((res) => {
                 
                  if (res.data && res.data.data && res.data.data.length > 0) {
                    const empAddr = res.data.data[0];
                    
                    setFormData((prev) => ({
                      ...prev,
                      phone: empAddr.phone || "",
                      email: empAddr.email || "",
                    }));
                  } 
                console.log('benefit----',formData.benefits);
              });
            } else if (formData.owncontact === 0) {
              setFormData((prev) => ({
                ...prev,
                phone: "",
                email: "",
              }));
            }
          }, [formData.owncontact , userId]);

          const stepLabels = [
              "รายละเอียดงาน",
              "สถานที่และเวลาทำงาน",
              "คุณสมบัติของผู้สมัคร",
              "ข้อมูลการติดต่อ"
          ];

          const stepCompletion = [
            // step 1: ต้องมี job_pic, jobtype_id, position_code เป็นต้น
            formData.job_pic instanceof File && formData.jobtype_id && formData.position_code && formData.num_position ,
            // step 2: ต้องมี jangwat_id, ampher_id, tambon_id
            formData.jangwat_id && formData.ampher_id && formData.tambon_id && formData.location && formData.hour && formData.end_hour && daywork != "0000000",
            // step 3: ต้องมี min_age, max_age, gender เป็นต้น
            formData.min_age !== "" && formData.max_age !== "" && formData.gender && formData.education_code,
            // step 4: ต้องมี phone, email
            formData.phone && formData.email,
          ];
          
          const [queryType , setQueryType] = useState('job'); // default เป็น "job"

  return (
    <div>
        {userData && <Navbar user={userData} />}
        <div className="relative w-full group">
          <img src="/index_emp.png" className="w-full" />

        </div>
          <div className="flex flex-col min-h-screen bg-white">
             
          
            <>
              <div className="flex flex-col items-center w-full gap-2 bg-white">
                 {(MJdata.length != 0  ) && (status === 'p' || status === 'f') && (
                  <>
                  <div className="flex flex-col justify-center items-center w-full px-5 pt-3 lg:pt-5 lg:px-0 lg:pr-4">
                                <h1 className="text-lg md:text-3xl font-bold mb-2 text-[#8E80FF] my-3">
                                  {status === "p" ? (
                                    <>งานที่ประกาศไว้ [ {MJtotal ? (MJtotal):("0")} ]</>
                                  ) : (
                                    <>งานที่เสร็จสิ้นไปแล้ว [ {MJtotal ? (MJtotal):("0")} ]</>
                                  ) }
                                </h1>
                                <div className="tabs tabs-lift mb-3">
                                  <button
                                    className={`tab  [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF]  ${status === "p" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                    onClick={() => {
                                      setStatus("p");
                                      setMJPage(1);
                                    }}
                                  >
                                    งานที่ประกาศไว้
                                  </button>
                                  
                                  <button
                                    className={`tab [--tab-bg:#8E80FF] [--tab-border-color:#8E80FF] ${status === "f" ? "tab-active !rounded-t-xl" : "!text-[#8E80FF]"}`}
                                    onClick={() => {
                                      setStatus("f");
                                      setMJPage(1);
                                    }}
                                  >
                                    งานที่เสร็จสิ้นไปแล้ว
                                  </button>
                                  
                                </div>
              
                                                      <div className="mb-3">
                                                        {MJdata.length === 0 && status === 'f' ? (
                                                          <div className="flex flex-col items-center justify-center py-7 text-center text-[#8E80FF]">
                                                            <MdWorkOff className="text-7xl mb-6" />
                                                            <h2 className="text-xl font-semibold mb-2">
                                                              ยังไม่มีงานที่เสร็จสิ้น
                                                            </h2>
                                                            {/* <p className="text-sm text-gray-500">
                                                              คุณสามารถเลือกชมงานได้จากงานที่ประกาศด้านล่าง
                                                            </p> */}
                                                          </div>
                                                        ) : MJdata.length === 0 ? (
                                                          <div className="flex flex-col items-center justify-center py-7 text-center text-[#8E80FF]">
                                                            <MdWorkOff className="text-7xl mb-6" />
                                                            <h2 className="text-xl font-semibold mb-2">
                                                              ยังไม่มีงานในหมวดนี้
                                                            </h2>
                                                            {/* <p className="text-sm text-gray-500">
                                                              คุณสามารถเลือกชมงานได้จากงานที่ประกาศด้านล่าง
                                                            </p> */}
                                                            {/* <a
                                                              href="/User/alljob"
                                                              className="mt-4 px-5 py-2 bg-[#8E80FF] text-white rounded-full hover:bg-[#695bd6] transition"
                                                            >
                                                              ไปที่หน้าหลัก
                                                            </a> */}
                                                          </div>
                                                        ) : (
                                                          <div className="flex flex-col items-center">
                                                            {MJdata.length > 0 && (
                                                              <label className="input w-50 md:w-70 h-7 lg:h-9 bg-white my-5 rounded-lg border border-[#8E80FF]">
                                                                <button>
                                                                  <MdOutlineSearch className="fill-[#8E80FF] mt-0 md:size-5" />
                                                                </button>
                                                                <input 
                                                                  type="search" 
                                                                  className="text-[#8E80FF] text-xs md:text-sm lg:text-lg" 
                                                                  placeholder="ชื่อตำแหน่งงาน" 
                                                                  value={search}
                                                                  onChange={(e) => {
                                                                    setSearch(e.target.value);
                                                                    setMJPage(1);
                                                                  }}
                                                              /> 
                                                              </label>
                                                            )}
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 w-full xl:grid-cols-3 gap-4 px-50">
                                                              {MJdata.map((post , index) => (
                                                                <JobCard key={index} post={post} />
                                                              ))}
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
              
                                                      
                                                      <center>
                                                        <div className="join items-center gap-2 my-2">
                                                          {/* ปุ่มย้อนกลับ */}
                                                          {MJpage > 1 && (
                                                            <button
                                                              onClick={() => setMJPage(MJpage - 1)}
                                                              className="btn btn-xs bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item"
                                                            >
                                                              «
                                                            </button>
                                                          )}

                                                          {/* ปุ่มเลขเพจ */}
                                                          {Array.from({ length: MJtotalPages }, (_, i) => i + 1).map((pageNum) => (
                                                            <button
                                                              key={pageNum}
                                                              onClick={() => setMJPage(pageNum)}
                                                              className={`btn btn-xs rounded-3xl join-item 
                                                                ${MJpage === pageNum ? "bg-[#8E80FF] border-[#8E80FF] text-white" : "bg-white border-[#8E80FF] text-[#8E80FF]"}`}
                                                            >
                                                              {pageNum}
                                                            </button>
                                                          ))}

                                                          {/* ปุ่มถัดไป */}
                                                          {MJpage < MJtotalPages && (
                                                            <button
                                                              onClick={() => setMJPage(MJpage + 1)}
                                                              className="btn btn-xs bg-[#8E80FF] border-[#8E80FF] rounded-3xl join-item"
                                                            >
                                                              »
                                                            </button>
                                                          )}
                                                        </div>
                                                      </center>

                                                </div>
                  </>
                 )}             
                              
              </div>

              <div className="flex flex-col gap-3 mt-10">

                  <div className="flex flex-col lg:flex-row justify-center px-50 w-full">

                    <div className="flex flex-col justify-center lg:justify-start gap-3 mb-4 w-1/3 mt-36">
                    <button 
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                      className={`px-4 py-4 rounded-bl-xl rounded-tl-xl font-bold 
                        ${currentStep === 1 
                          ? "bg-[#7B6ADA] text-white border-[#7B6ADA]" 
                          : "bg-white text-[#7B6ADA] border-[#7B6ADA] hover:bg-[#f0eeff]"
                        }`}
                    >
                      รายละเอียดงาน
                    </button>

                    <button 
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                      className={`px-4 py-4 rounded-bl-xl rounded-tl-xl  font-bold 
                        ${currentStep === 2 
                          ? "bg-[#7B6ADA] text-white border-[#7B6ADA]" 
                          : "bg-white text-[#7B6ADA] border-[#7B6ADA] hover:bg-[#f0eeff]"
                        }`}
                    >
                      สถานที่และเวลาทำงาน
                    </button>

                    <button 
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                      className={`px-4 py-4 rounded-bl-xl rounded-tl-xl  font-bold  
                        ${currentStep === 3 
                          ? "bg-[#7B6ADA] text-white border-[#7B6ADA]" 
                          : "bg-white text-[#7B6ADA] border-[#7B6ADA] hover:bg-[#f0eeff]"
                        }`}
                    >
                      คุณสมบัติของผู้สมัคร
                    </button>
                    

                    <button 
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
                      className={`px-4 py-4 rounded-bl-xl rounded-tl-xl  font-bold  
                        ${currentStep === 4 
                          ? "bg-[#7B6ADA] text-white border-[#7B6ADA]" 
                          : "bg-white text-[#7B6ADA] border-[#7B6ADA] hover:bg-[#f0eeff]"
                        }`}
                    >
                      ข้อมูลการติดต่อ
                    </button>
                    <div className="text-[#8E80FF] text-xs">
                        <div className="text-[#8E80FF] text-xs leading-relaxed mt-2 px-1">
                          <p className="font-bold">คำแนะนำการลงประกาศงาน:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li><span className="font-semibold">รายละเอียดงาน:</span> ระบุหน้าที่ ความรับผิดชอบ และลักษณะงานอย่างชัดเจน</li>
                            <li><span className="font-semibold">สถานที่และเวลาทำงาน:</span> แจ้งที่ตั้งบริษัท/สถานที่ทำงาน วันและเวลาทำงานที่แน่นอน</li>
                            <li><span className="font-semibold">คุณสมบัติของผู้สมัคร:</span> เช่น วุฒิการศึกษา อายุ เพศ ประสบการณ์ หรือทักษะที่จำเป็น</li>
                            <li><span className="font-semibold">ข้อมูลการติดต่อ:</span> ใส่เบอร์โทร อีเมล หรือช่องทางที่ติดต่อได้สะดวก</li>
                          </ul>
                          <p className="font-semibold mt-2">ควรกรอกข้อมูลครบถ้วนเพื่อให้งานของคุณดูน่าเชื่อถือ และดึงดูดผู้สมัครที่ตรงตามความต้องการ</p>
                        </div>

                    </div>

                  </div>
                  <div id="section_post" className="flex flex-col w-full gap-2">
                    <h1 className="text-center text-lg md:text-4xl font-bold mb-2 text-[#8E80FF] my-3">ลงประกาศงาน</h1>
                    <ul className="steps text-[#8E80FF] text-lg w-full">
                      {stepLabels.map((label, index) => {
                        const isComplete = stepCompletion?.[index];
                        const isActive = index+1 === currentStep;

                        // กำหนด class สำหรับแต่ละสถานะ
                        const stepClass = `
                          step 
                          ${isComplete ? "step-primary" : ""} 
                          ${isActive ? "step-warning opacity-100 border-dashed" : ""} 
                        `;

                        // กำหนดสัญลักษณ์ (✓ = เสร็จ, → = กำลังอยู่, "" = ยังไม่เริ่ม)
                        const symbol = isComplete ? "✓" : isActive ? index+1 : "";

                        return (
                          <li
                            key={index}
                            data-content={symbol}
                            className={stepClass}
                            onClick={() => setCurrentStep(index)} // คลิกเปลี่ยนขั้นได้ด้วย
                          >
                            {label}
                          </li>
                        );
                      })}
                    </ul>
                    <div className='text-[#8E80FF] bg-white rounded-b-3xl rounded-tr-3xl p-5 w-full' style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                      
                      <div className="flex justify-center items-center gap-3">
                        <div className='text-center pl-4 font-bold text-xl'>
                          {currentStep === 1 && "รายละเอียดงาน"}
                          {currentStep === 2 && "สถานที่และเวลาทำงาน"}
                          {currentStep === 3 && "คุณสมบัติของผู้สมัคร"}
                          {currentStep === 4 && "ข้อมูลการติดต่อ"}
                        </div>
                        <button
                          onClick={handleResetFilters}
                          className="flex items-center p-2 h-8 gap-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 justify-center"
                        >
                          <FiRefreshCw className="w-4 h-4" strokeWidth={4} />
                        </button>
                      </div>
                      
                      
                          <form onSubmit={(e) => {handleGoGo(e);}} className='mt-3 '>
                          
                              <div className="flex flex-col gap-2 items-center justify-center ">
                                {currentStep === 1 && (
                                  <>
                                    <div className="flex flex-col gap-1 text-sm w-2/3">
                                        <div className="flex flex-col gap-2 mt-2">
                                          {formData.job_pic instanceof File && (
                                            <img
                                              src={URL.createObjectURL(formData.job_pic)}
                                              alt="Preview"
                                              className="mt-2 w-1/2 h-32 object-cover rounded-lg border"
                                            />
                                          )}

                                            <div className="flex">
                                              {/* <label className='text-[#8E80FF] font-bold'>เพิ่มรูปภาพ</label> */}
                                              <TooltipField 
                                                label="เพิ่มรูปภาพ" 
                                                tooltip={`ไฟล์รูปภาพงาน/ประกาศงาน\n(เช่น ภาพประกอบงาน)`}
                                              >
                                              <input
                                                name="job_pic"
                                                type="file"
                                                accept="image/*"
                                                required
                                                onChange={handleFileChange}
                                                className="file-input file-input-bordered border border-[#A3A3A3] bg-white text-[#8E80FF] file-input-md rounded-box w-full"
                                              />  
                                              </TooltipField>
                                            </div> 
                                                
                                        </div> 
                                        <div className="flex justify-between  mt-2">
                                              <TooltipField 
                                                label="ประเภทงาน" 
                                                tooltip="เลือกประเภทงานที่คุณต้องการก่อนเลือกตำแหน่งงาน"
                                              ></TooltipField>
                                        </div>
                                                            
                                        <select
                                          name='jobtype'
                                          className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                          value={formData.jobtype_id}
                                          onChange={(e) => setFormData({ ...formData, jobtype_id: e.target.value })}
                                      >
                                          <option value="">-- กรุณาเลือกประเภทงาน --</option>
                                          {Array.isArray(jobtypeList) && jobtypeList.map((jt) => (
                                              <option key={jt.jobtype_id} value={jt.jobtype_id} className='text-[#8E80FF]'>
                                                  {jt.jobtype_name}
                                              </option>
                                              ))}
                                      </select>

                                      <div className="flex justify-between mt-2">
                                            <TooltipField 
                                                label="ตำแหน่ง" 
                                                tooltip={`เลือกตำแหน่งงานจากรายการมาตรฐาน\nใช้ในการจับคู่`}
                                              ></TooltipField>
                                        </div>
                                                            
                                        <select
                                          name='position_code'
                                          className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                          value={formData.position_code}
                                          onChange={(e) => setFormData({ ...formData, position_code: e.target.value })}
                                      >
                                          <option value="">-- กรุณาเลือกตำแหน่งงาน --</option>
                                          {Array.isArray(positionList) && positionList.map((ps) => (
                                              <option key={ps.position_id} value={ps.position_id}>
                                                  {ps.position_name}
                                              </option>
                                              ))}
                                      </select>

                                    <div className="flex gap-2">
                                      <div className="flex flex-col w-full">
                                          <div className="text-[#8E80FF] font-bold">จำนวน <a className="text-xs">( อัตรา )</a></div>
                                              <input 
                                                  type="number" 
                                                  
                                                  className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                  name="num_position"
                                                  value={formData.num_position || ""}
                                                  onChange={handleChange} 
                                                  required/>
                                      </div>
                                      

                                      <div className="flex flex-col w-full">
                                        <TooltipField 
                                                label="ประเภทการจ้างงาน" 
                                                tooltip={`งานประจำ → ทำงานเต็มเวลา\nงานพาร์ทไทม์ → ทำงานชั่วคราว/ไม่เต็มเวลา\nงานสัญญาจ้าง → ทำงานตามสัญญา\nงานรายวัน → ทำงานเป็นวัน รับค่าจ้างรายวัน`}
                                              ></TooltipField>
                                          
                                              <select
                                                  className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                                  value={formData.type}
                                                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                              >
                                                  
                                                    <option value="f">งานประจำ</option>
                                                    <option value="p">งานพาร์ทไทม์</option>
                                                    <option value="c">งานสัญญาจ้าง</option>
                                                    <option value="d">งานรายวัน</option>
                                                      
                                              </select>
                                      </div>
                                      
                                  </div><div className="flex items-center gap-2">
                                      <div className="flex flex-col w-full">
                                            <div className="text-[#8E80FF] font-bold">ค่าตอบแทน <a className="text-xs">( บาท )</a></div>
                                                <input 
                                                type="number" 
                                                className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                name="minsalary"
                                                value={formData.minsalary || ""}
                                                placeholder="ขั้นต่ำ"
                                                onChange={handleChange} 
                                                required/>
                                        
                                          </div>
                                              <div className="text-[#8E80FF] font-bold mt-3">-</div>

                                      
                                          <div className="flex flex-col w-full">
                                            <div className="text-white font-bold">ค่าตอบแทน <a className="text-xs"></a></div>
                                                <input 
                                                type="number" 
                                                className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                name="maxsalary"
                                                placeholder="สูงสุด"
                                                value={formData.maxsalary || ""}
                                                onChange={handleChange} 
                                                required/>
                                        
                                          </div>
                                    </div>
                                  <div className="flex items-end gap-2 mt-2">
                                                        <a className="text-[#8E80FF] font-bold">รายละเอียดงาน</a>
                                                        {/* <a className="text-[#A3A3A3] text-xs">รายละเอียดงาน</a> */}
                                                    </div>
                                                    <TiptapEditor
                                                      value={formData.details}
                                                      onEditorChange={(content) => handleEditorChange("details", content)}
                                                    />            
                                                    
                                    <div className="flex gap-2 mt-2">
                                                        <a className="text-[#8E80FF] font-bold">สวัสดิการ</a>
                                                        <label className="label">
                                                            <input 
                                                                type="checkbox" 
                                                                name="address" 
                                                                className="checkbox checkbox-sm border-[#8E80FF] checked:text-[#8E80FF]" 
                                                                checked={formData.ownbenefit === 1} 
                                                                onChange={(e) => setFormData({ ...formData, ownbenefit: e.target.checked ? 1 : 0 })}
                                                            />
                                                            <a className='text-xs'>ใช้สวัสดิการจากโปรไฟล์</a>
                                                        </label>
                                                    </div>

                                                    <TiptapEditor
                                                      value={formData.benefits}
                                                      onEditorChange={(content) => handleEditorChange("benefits", content)}
                                                    />                                                    
                                                                        
                                                             

                                        
                                    </div>
                                  </>
                                )}
                                {currentStep === 2 && (
                                  <>
                                    <div className="flex flex-col gap-1 text-sm w-2/3">
                                      <div className="flex items-center gap-2 mt-2">
                                            <a className="text-[#8E80FF] font-bold">สถานที่ทำงาน</a>
                                            <label className="label pt-1">
                                                  <input 
                                                      type="checkbox" 
                                                      name="address" 
                                                      className="checkbox checkbox-sm border-[#8E80FF] checked:text-[#8E80FF]" 
                                                      checked={formData.address === 1} 
                                                      onChange={(e) => setFormData({ ...formData, address: e.target.checked ? 1 : 0 })}
                                                  />
                                                  <a className='text-xs'>ใช้ที่อยู่ของผู้จ้างเอง</a>
                                              </label>
                                        </div>
                                          
                                              <select
                                                  className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                                  value={formData.jangwat_id}
                                                  onChange={(e) => setFormData({ ...formData, jangwat_id: e.target.value })}
                                                  
                                              >
                                                  <option value="">-- กรุณาเลือกจังหวัด --</option>
                                                  {Array.isArray(jangwatList) && jangwatList.map((jangwat) => (
                                                      <option key={jangwat.jangwat_id} value={jangwat.jangwat_id}>
                                                          {jangwat.jangwat_name}
                                                      </option>
                                                      ))}
                                              </select>
                                              <div className="flex gap-2">
                                                  <div className="flex flex-col w-full">
                                                          <select
                                                              className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                                              value={formData.ampher_id}
                                                              onChange={(e) => 
                                                                setFormData({ 
                                                                  ...formData, 
                                                                  ampher_id: e.target.value,
                                                                  tambon_id: ""
                                                                })}
                                                              
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
                                                      {/* ตำบล */}
                                                      <select
                                                          className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                                          value={formData.tambon_id}
                                                          onChange={(e) => setFormData({ ...formData, tambon_id: e.target.value })}
                                                          
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
                                                <input 
                                                    //type={showCPassword ? "text" : "password"} 
                                                    type='text'
                                                    className="input w-full bg-white text-[#8E80FF] border border-[#A3A3A3] rounded-box" 
                                                    name="location"
                                                    placeholder='ที่อยู่ อาคาร หมู่บ้าน'
                                                    value={formData.location || ""}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <div className="flex gap-2">
                                                  <div className="flex flex-col w-full">
                                                      <div className="flex items-center justify-start text-[#8E80FF] font-bold">
                                                        <a>พิกัด</a>
                                                        <a className="w-1/3 text-xs ml-1">( ละติจูด )</a>
                                                        <TooltipField 
                                                          label="" 
                                                          tooltip={`ใช้กรณีอยากให้แสดงงานบนแผนที่\nสามารถ copy พิกัดจาก Google Maps`}
                                                        ></TooltipField>
                                                      </div>
                                                          <input 
                                                              type="number" 
                                                              className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                              name="latitude"
                                                              value={formData.latitude || ""}
                                                              onChange={handleChange} 
                                                              required/>
                                                  </div>
                                                  <div className="flex flex-col w-full">
                                                      <div className="text-[#8E80FF] font-bold"><a className="text-xs">( ลองจิจูด )</a></div>
                                                          <input 
                                                          type="number" 
                                                          className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                          name="longitude"
                                                          value={formData.longitude || ""}
                                                          onChange={handleChange} 
                                                          required/>
                                                  </div>
                                                </div>
                                                <div className="flex gap-2">
                                                  <div className="flex flex-col w-full">
                                                      <div className="text-[#8E80FF] font-bold">เวลาทำงาน <a className="text-xs">( ตั้งแต่ )</a></div>
                                                          <input 
                                                              type="time" 
                                                              className="input w-full bg-[#8E80FF] text-white border-[#A3A3A3] rounded-box" 
                                                              name="hour"
                                                              value={formData.hour || ""}
                                                              onChange={handleChange} 
                                                              required/>
                                                  </div>
                                                  <div className="flex flex-col w-full">
                                                      <div className="text-[#8E80FF] font-bold"><a className="text-xs">( ถึง )</a></div>
                                                          <input 
                                                          type="time" 
                                                          className="input w-full bg-[#8E80FF] text-white border-[#A3A3A3] rounded-box" 
                                                          name="end_hour"
                                                          value={formData.end_hour || ""}
                                                          onChange={handleChange} 
                                                          required/>
                                                  </div>
                                                </div>  
                                              <div className="flex flex-col">
                        <a>วันทำงาน</a>
                        <div className='flex gap-2 my-2'>      
                                    <div className="flex gap-3 flex-wrap">
                                        <button type="button" onClick={selectAllDays} className="btn btn-sm btn-outline rounded-xl">ทุกวัน</button>
                                        <button type="button" onClick={selectWeekdaysOnly} className="btn btn-sm btn-outline rounded-xl">จันทร์-ศุกร์</button>
                                        <button type="button" onClick={selectWeekendOnly} className="btn btn-sm btn-outline rounded-xl">เสาร์-อาทิตย์</button>
                                    </div>

                                </div>  
                                <div className="flex gap-2 grid grid-cols-5 justify-center">
                                    {Object.keys(weekdays).map((day) => (
                                    <label key={day} className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={weekdays[day]}
                                        onChange={() =>
                                        setWeekdays((prev) => ({ ...prev, [day]: !prev[day] }))
                                        }
                                        className="checkbox checkbox-lg border-[#8E80FF] text-white checked:text-[#8E80FF] mr-1" 
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
                                  </>
                                )}  
                                {currentStep === 3 && (
                                  <>
                                    <div className="flex flex-col gap-1 text-sm w-2/3">
                                      
                                        <div className="flex items-center gap-2">
                                          <div className="flex flex-col w-full">
                                              <div className="flex items-center gap-2 text-[#8E80FF] font-bold pb-1">
                                                อายุ 
                                                <a className="text-xs">( ปี )</a>
                                                <label className="label">
                                                            <input 
                                                                type="checkbox" 
                                                                name="age" 
                                                                className="checkbox checkbox-sm border-[#8E80FF] checked:text-[#8E80FF]" 
                                                                checked={formData.min_age === 0 && formData.max_age === 0} 
                                                                onChange={(e) => 
                                                                      setFormData({ 
                                                                        ...formData, 
                                                                        min_age: e.target.checked ? 0 : '', 
                                                                        max_age: e.target.checked ? 0 : '' 
                                                                      })
                                                                    }                                                        />
                                                            <a className='text-xs'>ไม่จำกัดอายุ</a>
                                                        </label>
                                              </div>
                                                  <input 
                                                      type="number" 
                                                      className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                      name="min_age"
                                                      placeholder='ตั้งแต่'
                                                      value={formData.min_age || ""}
                                                      onChange={handleChange} 
                                                      required/>
                                          </div>
                                          <div className="mt-5 text-[#8E80FF] font-bold">-</div>
                                          <div className="flex flex-col w-full">
                                              <div className="text-white font-bold">-</div>
                                                  <input 
                                                  type="number" 
                                                  className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                  name="max_age"
                                                  placeholder='ถึง'
                                                  value={formData.max_age || ""}
                                                  onChange={handleChange} 
                                                  required/>
                                          </div>

                                          <div className="flex flex-col w-full">
                                              <div className="text-[#8E80FF] font-bold">เพศ</div>
                                                  <select
                                                      className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                                      value={formData.gender}
                                                      onChange={(e) => setFormData({ ...formData, gender: e.target.value  })}
                                                  >
                                                      
                                                        <option value="A">ไม่กำหนด</option>
                                                        <option value="M">ชาย</option>
                                                        <option value="F">หญิง</option>
                                                          
                                                  </select>
                                          </div>
                                          
                                      </div>
                                      
                                          <div className="flex justify-between  mt-2">
                                                <TooltipField 
                                                  label="การศึกษา" 
                                                  tooltip="เลือกวุฒิการศึกษาต่ำสุดที่ต้องการ"
                                                ></TooltipField>
                                            </div>
                                                                
                                            <select
                                              name='education_code'
                                              className="select w-full bg-white border border-[#A3A3A3] text-[#8E80FF] rounded-box"
                                              value={formData.education_code}
                                              onChange={handleChange}
                                          >
                                              <option value="">-- กรุณาเลือกระดับการศึกษา --</option>
                                              {Array.isArray(educationList) && educationList.map((ps) => (
                                                  <option key={ps.edu_id} value={ps.edu_id}>
                                                      {ps.edu_name}
                                                  </option>
                                                  ))}
                                          </select>

                                        <div className="flex gap-2">
                                          <div className="flex flex-col w-full">
                                              <div className="text-[#8E80FF] font-bold">ประสบการณ์ <a className="text-xs">ตั้งแต่ ( ปี )</a></div>
                                                  <input 
                                                      type="number" 
                                                      className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                      name="year_expe"
                                                      value={formData.year_expe}
                                                      onChange={handleChange} 
                                                      placeholder="ใส่จำนวนปีขั้นต่ำของประสบการณ์ที่ต้องการ"
                                                      required/>
                                          </div>
                                      </div>
                                      <div className="flex items-end gap-2 mt-2">
                                                        <a className="text-[#8E80FF] font-bold">ประสบการณ์เพิ่มเติม</a>
                                                        {/* <a className="text-[#A3A3A3] text-xs">รายละเอียดงาน</a> */}
                                                    </div>
                                                    <TiptapEditor
                                                      value={formData.experience}
                                                      onEditorChange={(content) => handleEditorChange("experience", content)}
                                                    />                                                                        
                                                    
                                      <div className="flex flex-col gap-2">
                                        <TooltipField 
                                          label="ทักษะด้านความรู้ที่จำเป็น" 
                                          tooltip="เพิ่มรายการทักษะที่คุณต้องการ โดยกด + เพื่อเพิ่ม และกด - เพื่อลบทักษะ สามารถกรอกได้หลายรายการเพื่อช่วยในการจับคู่"
                                        />

                                        {formData.selectedHs.map((skill, index) => (
                                          <div key={index} className="flex gap-2 items-center">
                                            <select
                                              value={formData.selectedHs[index] || ""}
                                              onChange={(e) => handleHsChange(index, e.target.value)}
                                              className="select select-bordered bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box  w-full"
                                            >
                                              <option value="">เลือกทักษะด้านความรู้...</option>
                                              {getHsAvailableOptions(index).map((s) => (
                                                <option key={s.hardskill_id} value={s.hardskill_id}>
                                                  {s.hardskill_name}
                                                </option>
                                              ))}
                                            </select>


                                            {index === 0 ? (
                                              <button
                                                type="button"
                                                onClick={addHs}
                                                className="btn btn-sm bg-green-500 text-white btn-outline w-8 rounded-xl"
                                              >
                                                +
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => removeHs(index)}
                                                className="btn btn-sm bg-red-500 text-white btn-outline w-8 rounded-xl"
                                              >
                                                -
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>  
                                      <div className="flex flex-col gap-2">
                                        <label className="font-bold text-[#7B6ADA]">ทักษะด้านอารมณ์ที่จำเป็น</label>

                                        {formData.selectedSs.map((skill, index) => (
                                          <div key={index} className="flex gap-2 items-center">
                                            <select
                                              value={formData.selectedSs[index] || ""}
                                              onChange={(e) => handleSsChange(index, e.target.value)}
                                              className="select select-bordered bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box  w-full"
                                            >
                                              <option value="">เลือกทักษะด้านอารมณ์...</option>
                                              {getSsAvailableOptions(index).map((s) => (
                                                <option key={s.softskill_id} value={s.softskill_id}>
                                                  {s.softskill_name}
                                                </option>
                                              ))}
                                            </select>


                                            {index === 0 ? (
                                              <button
                                                type="button"
                                                onClick={addSs}
                                                className="btn btn-sm bg-green-500 text-white btn-outline w-8 rounded-xl"
                                              >
                                                +
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => removeSs(index)}
                                                className="btn btn-sm bg-red-500 text-white btn-outline w-8 rounded-xl"
                                              >
                                                -
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                      <div className="flex justify-between  mt-2">
                                                        <a className="text-[#8E80FF] font-bold">หมายเหตุคุณสมบัติ ส่วนนี้เพียงแสดงให้ผู้สมัครเห็นเท่านั้น ไม่มีผลกับการจับคู่</a>
                                                    </div>
                                                    <TiptapEditor
                                                                                                          value={formData.notes}
                                                                                                          onEditorChange={(content) => handleEditorChange("notes", content)}
                                                                                                        />                    
                                                     
                                      
                                    </div>
                                  </>
                                )}
                                {currentStep === 4 && (
                                  <>
                                    <div className="flex flex-col gap-1 text-sm w-2/3">
                                      
                                      <div className="flex justify-center gap-2  mt-2">
                                                        
                                                        <label className="label">
                                                            <input 
                                                                type="checkbox" 
                                                                name="address" 
                                                                className="checkbox checkbox-sm border-[#8E80FF] checked:text-[#8E80FF]" 
                                                                checked={formData.owncontact === 1} 
                                                                onChange={(e) => setFormData({ ...formData, owncontact: e.target.checked ? 1 : 0 })}
                                                            />
                                                            <a className='text-xs'>ใช้ข้อมูลติดต่อเดิม</a>
                                                        </label>
                                                    </div>
                                                  <div className="flex flex-col gap-2 mt-2">
                                                        <a className="text-[#8E80FF] font-bold">เบอร์โทรติดต่อ</a>
                                                                <input 
                                                                    type="text" 
                                                                    className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                    name="phone"
                                                                    value={formData.phone || ""}
                                                                    onChange={handleChange} 
                                                                    required/>
                                                        
                                                    </div>                     
                                                  <div className="flex flex-col gap-2 ">
                                                        <a className="text-[#8E80FF] font-bold">อีเมล</a>
                                                                <input 
                                                                    type="email" 
                                                                    className="input w-full bg-white text-[#8E80FF] border-[#A3A3A3] rounded-box" 
                                                                    name="email"
                                                                    value={formData.email || ""}
                                                                    onChange={handleChange} 
                                                                    required/>
                                                        
                                                    </div>
                                      
                                    </div>
                                  </>
                                )}
                                

                                  <div className="flex w-full p-4 justify-center">
                                      <hr className="w-1/2 border border-[#D9D9D9]" />
                                  </div> 
                                  {currentStep === 4 && (
                                    <button 
                                      className="btn bg-[#8E80FF] border-[#8E80FF] rounded-xl mb-2 hover:border-5">
                                        บันทึก
                                    </button>
                                  )}
                                  
                              </div>
                          </form>

                          {currentStep != 4 && (
                            <div className="flex justify-center">
                              <button 
                                onClick={() => {
                                  // เพิ่ม step ก่อน
                                  setCurrentStep((prev) => prev + 1);

                                  // เลื่อนไปยัง section_post
                                  const section = document.getElementById("section_post");
                                  if (section) {
                                    section.scrollIntoView({ behavior: "smooth" });
                                  }
                                }}
                                className="btn bg-[#8E80FF] border-[#8E80FF] rounded-xl mb-2 hover:border-5">
                                  ต่อไป
                              </button>
                            </div>
                          )}

                    </div>
                  </div>
                  </div>
              </div>
            </>
          
            {/* ad */}
            <div className="flex justify-center items-center py-5 sm:px-5 md:px-8 lg:px-10 lg:py-12 lg:mt-10">
              <div className="flex flex-col items-center justify-center bg-gray-500 h-80 rounded-3xl w-4/5">
                <b className="text-6xl">พื้นที่โฆษณา</b>
                ติดต่อ jobvolun.service@gmail.com
              </div>
          </div> 
            <Footer />
        
      </div>
      {/* Modal เซฟข้อมูล */}
            <dialog id="save_modal" className="modal">
            <div className="modal-box bg-white">
                <center>
                    <p className="text-4xl  text-[#8E80FF]">ยืนยันการลงประกาศงาน</p>
                <div className="w-30 h-30 flex items-center justify-center my-6">
                    {/* <AlertTriangle className="w-full h-full text-[#8E80FF]" /> */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#8E80FF" className="size-25">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>


                </div>
                </center>   
                <div className="modal-action flex justify-center gap-4">
                  
                  <button 
                    type="button"
                    className="btn border border-gray-400 text-gray-600 px-4 py-2 rounded-lg bg-white"
                    onClick={() => document.getElementById("save_modal").close()}
                  >
                    ยกเลิก
                  </button>

                  <button 
                    type="button"
                    className="btn bg-[#8E80FF] border border-[#8E80FF] text-white px-4 py-2 rounded-lg"
                    onClick={() => {
                      handleSubmit(); 
                    }}
                  >
                    ยืนยัน
                  </button>
                </div>
            </div>
            </dialog>
            {/* Modal บันทึกสำเร็จ */}
            <dialog id="success_modal" className="modal">
              <div className="modal-box bg-white">
                <center>
                  <p className="text-2xl text-[#8E80FF]">บันทึกสำเร็จ!</p>
                  <div className="w-20 h-20 my-4">
                    <img src="/check.png" className="rounded-full" />
                  </div>
                </center>
                <div className="modal-action flex justify-center">
                  <button className="btn bg-[#8E80FF] text-white" 
                    onClick={() => {navigate(`/Emp_Job_Post?pi=${newPost_id}`);
                    window.scrollTo(0,0);}}>
                    ไปที่รายละเอียดงาน
                  </button>
                </div>
              </div>
            </dialog>
            {/* Modal ข้อมูลไม่ครบ */}
            <dialog id="incomplete_modal" className="modal">
              <div className="modal-box bg-white">
                <center>
                  <p className="text-2xl text-red-500 font-semibold">กรอกข้อมูลไม่ครบ</p>
                  <div className="w-20 h-20 my-4">
                    <AlertTriangle className="w-full h-full text-red-300" />
                    
                  </div>
                  <p className="text-gray-600">กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน</p>
                </center>
                <div className="modal-action flex justify-center">
                  <button
                    className="btn bg-red-500 text-white"
                    onClick={() => document.getElementById("incomplete_modal").close()}
                  >
                    ตกลง
                  </button>
                </div>
              </div>
            </dialog>
                    
    </div>
  );
}

export default Employer_index;
