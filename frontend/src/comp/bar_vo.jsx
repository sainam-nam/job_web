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

const BarChartVoComponent = ({ volun , emp , numvolun , volunteer }) => {
  const [barThickness, setBarThickness] = useState(0);
  const [fontSize, setFontSize] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {setBarThickness(65); setFontSize(20);}       // หน้าจอใหญ่ (XL)
      else if (width >= 1024) {setBarThickness(50); setFontSize(18);}  // หน้าจอ LG
      else if (width >= 768) {setBarThickness(70); setFontSize(13);}   // หน้าจอ MD
      else {setBarThickness(30); setFontSize(8);}                     // หน้าจอเล็ก
    };
      handleResize(); 

      window.addEventListener("resize", handleResize); 

      return () => { 
        window.removeEventListener("resize", handleResize); 
      };
  }, []);

  const dataLabels = [
    'จิตอาสา',
    'ผู้จัดกิจกรรม',
    'อัตรา',
    'กิจกรรมจิตอาสา'
    
  ];
  const percentages = [volun , emp , numvolun , volunteer];

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
    labels: dataLabels,
    datasets: [
      {
        data: percentages,
        backgroundColor: colors,
        borderRadius: 10,
        barThickness: barThickness,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // แนวนอน
    layout: {
        padding: {
            right:0,
        },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: {
        anchor: 'center',
        align: 'center',
        offset: -20,
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label} [ ${value} ] `;
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
    beginAtZero: true,
    max: Math.max(...percentages), // ✅ ใช้ spread เพื่อหา max
    ticks: { display: false },
    grid: { 
      display: true,           // ✅ เปิดการแสดงเส้น
      color: '#EAEAEA',        // ✅ สีเส้น (จางๆ)
      lineWidth: 1,            // ✅ ความหนาเส้น
      drawTicks: false,        // ซ่อนขีด tick
      drawBorder: false,       // ซ่อนเส้นกรอบ
    },
  },
  y: {
    ticks: { display: false },
    grid: { display: false }, // แกน y ไม่ต้องมีเส้น
  },
},

  };

  return (
    <div className=" mx-auto w-full h-[150px] md:h-[300px] lg:h-[300px]">
      <Bar data={data} options={options} plugins={[ChartDataLabels]} />
      {/* <p className="text-[10px] text-[#7B6ADA] text-right pr-2">อื่นๆ %</p> */}
    </div>
    
  );
};

export default BarChartVoComponent;
