import React from 'react';
import { useEffect , useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  layouts,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const BarVoComponent = ({ labels = [], volunt = [], interested = [], matched = [] }) => {
  const [fontSize, setFontSize] = useState(0);
  
    useEffect(() => {
      const handleResize = () => {
        const width = window.innerWidth;
        if (width >= 1280) {setFontSize(20);}       
        else if (width >= 1024) {setFontSize(12);}  
        else if (width >= 768) {setFontSize(12);}  
        else {setFontSize(8);}    
      };
      handleResize(); 

      window.addEventListener("resize", handleResize); 

      return () => {
        window.removeEventListener("resize", handleResize); 
      };
    }, []);

  const data = {
    labels: labels,
    datasets: [
    {
      label: 'จำนวนกิจกรรมจิตอาสา',
      data: volunt,
      backgroundColor: '#7B6ADA',
    },
    {
      label: 'จำนวนคนที่สนใจ',
      data: interested,
      backgroundColor: '#9987DF',
    },
    {
      label: 'จำนวนคนที่คุณสมบัติตรง 50% ขี้นไป',
      data: matched,
      backgroundColor: '#E0DAF4',
    },
  ],
  };

  const options = {
    maintainAspectRatio: false,
    indexAxis: 'x', // แนวนอน
    responsive: true,
    layout: {
        padding: {
            right:0,
        },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: fontSize, // ✅ ลดขนาดตัวอักษร
          },
          color: '#555', // (ถ้าต้องการเปลี่ยนสีด้วย)
          
        },
      },
      
      tooltip: { enabled: false },
      datalabels: {
        anchor: 'start',
        align: 'end',
        
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${value}`;
        },
        color: '#fff',
        textStrokeColor: '#7B6ADA',      // ✅ ขอบสีดำ
        textStrokeWidth: 1,
        font: {
          weight: 'bold',
          size: fontSize,
        },
        padding: {
          left: 6,
        },
        clip: false,
      },
    },
    scales: {
      x: {
        ticks: {
          display: true,        // ✅ เปิดให้แสดงชื่อ
          font: {
            size: fontSize,           // ✅ ขนาดตัวอักษร
          },
          color: '#7B6ADA',         // (ถ้าอยากเปลี่ยนสี)
        },
        grid: {
          display: false        // ✅ ไม่โชว์เส้นกริดแนวตั้ง
        }
      },
      y: {
        ticks: { display: false },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="mx-auto w-full h-[200px] md:h-[300px] lg:h-[350px] xl:h-[400px]">
      <Bar data={data} options={options} plugins={[ChartDataLabels]} />
    </div>
    
  );
};

export default BarVoComponent;
