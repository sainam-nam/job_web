import { FaCircle } from "react-icons/fa";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartVoComponent = ({ pieinfo }) => {
  //const gotJob = 10;
  //const lookingForJob = 100;
  

  const total = pieinfo.count.reduce((sum, count) => sum + count, 0);

  const colors = [
    '#7B6ADA',
    '#8A78DD',
    '#9987DF',
    '#A996E2',
    '#B8A4E5',
    '#C7B3E8',
    '#E0DAF4', // อื่นๆ สีอ่อน
  ];

  const data = {
    labels: pieinfo.ap,
    datasets: [
      {
        data: pieinfo.count,
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: {
    legend: {
      display: true, // ✅ เปิดแถบสีชื่ออำเภอ
      position: 'bottom', // ตำแหน่ง legend: top, bottom, left, right
      labels: {
        color: '#000000ff', // สีข้อความ
        boxWidth: 12,  // ขนาดกล่องสี
        padding: 16,   // ช่องว่างระหว่างรายการ
      }
    },
    tooltip: {
      enabled: true
    },
  },
  };

  return (
    <div className="relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] mx-auto">
      
      <Pie data={data} options={options} />

    
    </div>
  );
};

export default PieChartVoComponent;
