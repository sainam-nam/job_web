import { FaCircle } from "react-icons/fa";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartComponent = ({gotJob , lookingForJob}) => {
  //const gotJob = 10;
  //const lookingForJob = 100;
  const total = gotJob + lookingForJob;

  const data = {
    labels: ['ได้งานแล้ว', 'ยังหางานอยู่'],
    datasets: [
      {
        data: [gotJob, lookingForJob],
        backgroundColor: ['#7B6ADA', '#D9D9D9'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: {
        display: false  // ✅ ปิด datalabel บนพาย
      }
    },
  };

  return (
    <div className="relative w-[150px] h-[150px] md:w-[280px] md:h-[280px] mx-auto">
      
      <Pie data={data} options={options} />

      {/* กล่องคำอธิบายด้านขวาบน */}
      <div className="absolute top-0 right-0 bg-[#7B6ADA] rounded-xl shadow-md p-4 text-[10px] md:text-sm text-[#D9D9D9] text-center font-bold  "style={{ boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
        {((gotJob / total) * 100).toFixed(0)}% <br />
        ได้งานแล้ว <br />
        {gotJob} ราย
      </div>

      {/* กล่องคำอธิบายด้านล่างซ้าย */}
      <div className="absolute bottom-0 left-0 bg-[#D9D9D9] rounded-xl shadow-md p-4 text-[10px] md:text-sm text-[#7B6ADA] text-center font-bold  "style={{ boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)' }}>
        {((lookingForJob / total) * 100).toFixed(0)}% <br />
        ยังหางานอยู่ <br />
        {lookingForJob} ราย
      </div>
    </div>
  );
};

export default PieChartComponent;
