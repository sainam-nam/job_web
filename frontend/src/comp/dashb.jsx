import { useNavigate } from "react-router-dom";
import React, { useState , useEffect } from "react"
import PieChartComponent from "./Pie";
import BarChartComponent from "./bar";
import BarComponent from "./barnormal";

export default function Dashboard() {
  const [labels, setLabels] = useState({labels: [], jobs: [], interested: [], hired: []});
  const [empCount, setEmpCount] = useState(0);
  const [jobbCount, setJobbCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [numjobCount, setNumJobCount] = useState(0);
  const [jobTypeCount, setJobTypeCount] = useState(0);
  const [gotJob, setgotJob] = useState(0);
  const [lookingForJob, setlookingForJob] = useState(0);
  const jobnum = String(jobCount).length;
  const textjob = jobnum >= 5 ? "text-lg md:text-xl lg:text-2xl" : jobnum >= 3 ? "text-xl md:text-4xl lg:text-5xl" : "text-4xl md:text-5xl lg:text-6xl";
  const empnum = String(empCount).length;
  const textemp = empnum >= 5 ? "text-lg md:text-xl lg:text-2xl" : empnum >= 3 ? "text-xl md:text-4xl lg:text-5xl" : "text-4xl md:text-5xl lg:text-6xl";
  const jobbnum = String(jobbCount).length;
  const textjobb = jobbnum >= 5 ? "text-lg md:text-xl lg:text-2xl" : jobbnum >= 3 ? "text-xl md:text-4xl lg:text-5xl" : "text-4xl md:text-5xl lg:text-6xl";
  const jobtnum = String(jobTypeCount).length;
  const textjobt = jobtnum >= 5 ? "text-lg md:text-xl lg:text-2xl" : jobtnum >= 3 ? "text-xl md:text-4xl lg:text-5xl" : "text-4xl md:text-5xl lg:text-6xl";
  const navigate = useNavigate();

  useEffect(() => {
          fetchData();
        }, []);

  const fetchData = async () => {
  try {
    const res = await fetch(`http://localhost:8081/apidash_job`);
    const result = await res.json();

    if (typeof result === 'object' &&
      'empCount' in result &&
      'jobbCount' in result &&
      'jobCount' in result &&
      'jobTypeCount' in result &&
      'gotJob' in result &&
      'lookingForJob' in result &&
      'numjobCount' in result
      ) {
      setEmpCount(result.empCount);
      setJobbCount(result.jobbCount);
      setJobCount(result.jobCount);
      setJobTypeCount(result.jobTypeCount);
      setgotJob(result.gotJob);
      setlookingForJob(result.lookingForJob);
      setNumJobCount(result.numjobCount);
    } else {
      //console.log("sql", res);
      console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
    }
    if(Array.isArray(result.labels)){
        const labels = result.labels.map(item => item.position_name.split(' (')[0]);
        const jobs = result.labels.map(item => item.jobs);
        const interested = result.labels.map(item => item.interest);
        const hired = result.labels.map(item => item.hired);
        //console.log(".", labels);
        setLabels({
          labels,
          jobs,
          interested,
          hired,
        });
      } else {
        console.error("Data format error:", result);
        setLabels([]);
      }
    

  } catch (err) {
    console.error('Fetch error:', err);
  }
};
  
    return(
        <main className="flex-1 p-6 md:p-8">
        {/* Tab Switch */}
        <div className="relative flex items-center mb-3">
          <button onClick={() => navigate("/Admin/Dashboard")} className="z-10 btn btn-xs md:btn-sm bg-[#7B6ADA] border-[#7B6ADA] rounded-full pt-0.5 px-5 w-25 md:w-35 lg:w-40 hover:w-40 lg:text-sm">งาน</button>
          <button onClick={() => navigate("/Admin/Dashboardvolun")} className="z-0 -ml-5 btn btn-xs md:btn-sm bg-white text-[#7B6ADA] border-3 pt-0.5 px-5 w-30 md:w-40  border-[#7B6ADA] rounded-full hover:w-40 lg:text-sm">กิจกรรมจิตอาสา</button>
        </div>

        {/* สถิติข้อมูล */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <div className="flex flex-col justify-center w-full h-20 md:h-30 lg:h-40 p-2 bg-[#7B6ADA] rounded-xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <p className="text-[10px] lg:text-xs text-white">ผู้สมัครงาน</p>
            <p className={`${textjobb} md:py-3 lg:py-6 text-white font-bold text-center`} >{jobbCount}</p>
            <p className="text-[10px] lg:text-xs text-white text-right">ราย</p>
          </div>
          <div className="flex flex-col justify-center w-full h-20 md:h-30 lg:h-40 p-2 bg-white shadow-xl rounded-xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <p className="text-[10px] lg:text-xs text-[#7B6ADA]">นายจ้าง</p>
            <p className={`${textemp} md:py-3 lg:py-6 text-[#7B6ADA] font-bold text-center`}>{empCount}</p>
            <p className="text-[10px] lg:text-xs text-[#7B6ADA] text-right">ราย</p>
          </div>
          <div className="flex flex-col justify-center w-full h-20 md:h-30 lg:h-40 p-2 bg-[#7B6ADA] shadow-xl rounded-xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <p className="text-[10px] lg:text-xs text-white">งาน</p>
            <p className={`${textjob} md:pt-4 md:pb-5 lg:pt-6 lg:pb-7 text-white font-bold text-center`}>{jobCount}</p>
            
          </div>
          <div className="flex flex-col justify-center w-full h-20 md:h-30 lg:h-40 p-2 bg-white shadow-xl rounded-xl " style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <p className="text-[10px] lg:text-xs text-[#7B6ADA]">ประเภทงาน</p>
            <p className={`${textjobt} md:py-3 lg:py-6 text-[#7B6ADA] font-bold text-center`}>{jobTypeCount}</p>
            <p className="text-[10px] lg:text-xs text-[#7B6ADA] text-right">รายการ</p>
          </div>
        </div>

        {/* กราฟ / Chart */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-2 bg-white shadow-md rounded-3xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <div className="pt-2 pb-1 text-[#7B6ADA] font-bold text-sm">ผู้สมัครงาน</div> 
            <PieChartComponent gotJob={gotJob} lookingForJob={lookingForJob} />
          </div>
          <div className="pt-2 pb-5 px-2 bg-white shadow-md rounded-3xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <div className="pt-2 pb-1 text-[#7B6ADA] font-bold text-sm">เปรียบเทียบ</div> 
            <BarChartComponent jobber={jobbCount} emp={empCount} job={jobCount} numjob={numjobCount} />
          </div>
        </div>
        {/* กราฟ / Chart */}
        <div className="grid grid-cols-1 gap-4 mt-6">
          
          <div className="pt-2 pb-5 px-2 bg-white shadow-md rounded-3xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <div className="pt-2 pb-1 text-[#7B6ADA] font-bold text-sm">ภาพรวม</div> 
            <BarComponent 
              labels={labels.labels}
              jobs={labels.jobs}
              interested={labels.interested}
              hired={labels.hired}
            />
          </div>
        </div>
      </main>
    )
  }