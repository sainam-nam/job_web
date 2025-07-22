import { useNavigate } from "react-router-dom";
import React, { useState , useEffect } from "react"
import PieChartVoComponent from "./Pie_vo";
import BarChartVoComponent from "./bar_vo";
import BarVoComponent from "./barnormal_vo";

export default function Dashboardvolun() {
  const [labels, setLabels] = useState({labels: [], volunt: [], interested: [], matched: []});
  const [empCount, setEmpCount] = useState(0);
  const [volunCount, setVolunCount] = useState(0);
  const [voluntCount, setVoluntCount] = useState(0);
  const [volunTypeCount, setVolunTypeCount] = useState(0);
  const [numvolunCount, setNumVolunCount] = useState(0);
  const [Pie_vo, setPie_vo] = useState({ap: [], count: []});
  // const [gotJob, setgotJob] = useState(0);
  // const [lookingForJob, setlookingForJob] = useState(0);
  const volunnum = String(volunCount).length;
  const textjob = volunnum >= 5 ? "text-lg md:text-xl lg:text-2xl" : volunnum >= 3 ? "text-xl md:text-4xl lg:text-5xl" : "text-4xl md:text-5xl lg:text-6xl";
  const empnum = String(empCount).length;
  const textemp = empnum >= 5 ? "text-lg md:text-xl lg:text-2xl" : empnum >= 3 ? "text-xl md:text-4xl lg:text-5xl" : "text-4xl md:text-5xl lg:text-6xl";
  const voluntnum = String(voluntCount).length;
  const textjobb = voluntnum >= 5 ? "text-lg md:text-xl lg:text-2xl" : voluntnum >= 3 ? "text-xl md:text-4xl lg:text-5xl" : "text-4xl md:text-5xl lg:text-6xl";
  const voluntypenum = String(volunTypeCount).length;
  const textjobt = voluntypenum >= 5 ? "text-lg md:text-xl lg:text-2xl" : voluntypenum >= 3 ? "text-xl md:text-4xl lg:text-5xl" : "text-4xl md:text-5xl lg:text-6xl";
  const navigate = useNavigate();

  useEffect(() => {
          fetchData();
        }, []);

  const fetchData = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const res = await fetch(`${apiUrl}/apidash_volun`);
    const result = await res.json();

    if (typeof result === 'object' &&
      'empCount' in result &&
      'volunCount' in result &&
      'voluntCount' in result &&
      'volunTypeCount' in result &&
      'numvolunCount' in result 
      ) {
      setEmpCount(result.empCount);
      setVolunCount(result.volunCount);
      setVoluntCount(result.voluntCount);
      setVolunTypeCount(result.volunTypeCount);
      setNumVolunCount(result.numvolunCount);
      //setlookingForJob(result.lookingForJob);
      
    } else {
      //console.log("sql", res);
      console.error('รูปแบบข้อมูลไม่ถูกต้อง:', result);
    }
    if(Array.isArray(result.labels)){
        const labels = result.labels.map(item => item.voluntype_name);
        const volunt = result.labels.map(item => item.volunt);
        const interested = result.labels.map(item => item.interested);
        const matched = result.labels.map(item => item.matched);
        //console.log(".", labels);
        setLabels({
          labels,
          volunt,
          interested,
          matched,
        });
      } else {
        console.error("Data format error:", result);
        setLabels([]);
      }

    if(Array.isArray(result.pie_vo)){
          //console.log("sql", res)
          const ap = result.pie_vo.map(item => item.ap);
          const count = result.pie_vo.map(item => item.count);
          setPie_vo({
            ap,
            count
          });
        } else {
          console.error("Data format error:", result);
          setPie_vo([]);
        }

  } catch (err) {
    console.error('Fetch error:', err);
  }
};
  
    return(
        <main className="flex-1 p-6 md:p-8">
        {/* Tab Switch */}
        <div className="relative flex items-center mb-3">
          <button onClick={() => navigate("/Admin/Dashboard")} className="z-0 btn btn-xs md:btn-sm bg-white text-[#7B6ADA] rounded-full pt-0.5 px-5 w-25 md:w-35 lg:w-40 border-3 border-[#7B6ADA] hover:w-40 lg:text-sm">งาน</button>
          <button onClick={() => navigate("/Admin/Dashboardvolun")} className="z-10 -ml-5 btn btn-xs md:btn-sm bg-[#7B6ADA] border-[#7B6ADA]  pt-0.5 px-5 w-30 md:w-40   rounded-full hover:w-40 lg:text-sm">กิจกรรมจิตอาสา</button>
        </div>

        {/* สถิติข้อมูล */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <div className="flex flex-col justify-center w-full h-20 md:h-30 lg:h-40 p-2 bg-[#7B6ADA] rounded-xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <p className="text-[10px] lg:text-xs text-white">จิตอาสา</p>
            <p className={`${textjobb} md:py-3 lg:py-6 text-white font-bold text-center`} >{volunCount}</p>
            <p className="text-[10px] lg:text-xs text-white text-right">ราย</p>
          </div>
          <div className="flex flex-col justify-center w-full h-20 md:h-30 lg:h-40 p-2 bg-white shadow-xl rounded-xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <p className="text-[10px] lg:text-xs text-[#7B6ADA]">ผู้จัดกิจกรรม</p>
            <p className={`${textemp} md:py-3 lg:py-6 text-[#7B6ADA] font-bold text-center`}>{empCount}</p>
            <p className="text-[10px] lg:text-xs text-[#7B6ADA] text-right">ราย</p>
          </div>
          <div className="flex flex-col justify-center w-full h-20 md:h-30 lg:h-40 p-2 bg-[#7B6ADA] shadow-xl rounded-xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <p className="text-[10px] lg:text-xs text-white">กิจกรรมจิตอาสา</p>
            <p className={`${textjob} md:pt-4 md:pb-5 lg:pt-6 lg:pb-7 text-white font-bold text-center`}>{voluntCount}</p>
            
          </div>
          <div className="flex flex-col justify-center w-full h-20 md:h-30 lg:h-40 p-2 bg-white shadow-xl rounded-xl " style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <p className="text-[10px] lg:text-xs text-[#7B6ADA]">ประเภทกิจกรรมจิตอาสา</p>
            <p className={`${textjobt} md:py-3 lg:py-6 text-[#7B6ADA] font-bold text-center`}>{volunTypeCount}</p>
            <p className="text-[10px] lg:text-xs text-[#7B6ADA] text-right">รายการ</p>
          </div>
        </div>

        {/* กราฟ / Chart */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="flex flex-col items-between p-2 bg-white shadow-md rounded-3xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <div className="pt-2 pb-1 text-[#7B6ADA] font-bold text-sm">เปรียบเทียบ</div> 
            <div className="mt-7 md:mt-0">
              <BarChartVoComponent volun={volunCount} emp={empCount} volunteer={voluntCount} numvolun={numvolunCount} />
            </div>
          </div>
          <div className="pt-2 pb-5 px-2 bg-white shadow-md rounded-3xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <div className="pt-2 pb-1 text-[#7B6ADA] font-bold text-sm">กิจกรรมในแต่ละอำเภอ</div> 
            <PieChartVoComponent pieinfo={Pie_vo} />
          </div>
        </div>
        {/* กราฟ / Chart */}
        <div className="grid grid-cols-1 gap-4 mt-6">
          
          <div className="pt-2 pb-5 px-2 bg-white shadow-md rounded-3xl" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
            <div className="pt-2 pb-1 text-[#7B6ADA] font-bold text-sm">ภาพรวม</div> 
            <BarVoComponent 
              labels={labels.labels}
              volunt={labels.volunt}
              interested={labels.interested}
              matched={labels.matched}
            />
          </div>
        </div>
      </main>
    )
  }