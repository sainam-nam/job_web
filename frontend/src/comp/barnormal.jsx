import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const BarComponent = ({ labels = [], jobs = [], interested = [], hired = [] }) => {
  const [fontSize, setFontSize] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) setFontSize(15);
      else if (width >= 1024) setFontSize(14);
      else if (width >= 768) setFontSize(12);
      else setFontSize(8);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: 'จำนวนงาน',
        data: jobs,
        backgroundColor: '#7B6ADA',
        borderRadius: 10,
      },
      {
        label: 'จำนวนคนที่สนใจ',
        data: interested,
        backgroundColor: '#9987DF',
         borderRadius: 10,
      },
      {
        label: 'จำนวนคนที่ได้งานแล้ว',
        data: hired,
        backgroundColor: '#E0DAF4',
         borderRadius: 10,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    indexAxis: 'x',
    responsive: true,
    layout: {
      padding: { right: 0 },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: fontSize },
          color: '#555',
        },
      },
      tooltip: { enabled: false },
      datalabels: {
        anchor: 'start',
        align: 'end',
        formatter: (value) => `${value}`,
        color: '#fff',
        textStrokeColor: '#7B6ADA',
        textStrokeWidth: 1,
        font: {
          weight: 'bold',
          size: fontSize,
        },
        padding: { left: 6 },
        clip: false,
      },
    },
    scales: {
      x: {
        ticks: {
          display: true,
          font: { size: fontSize },
          color: '#7B6ADA',
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          display: true,
          font: { size: fontSize },
          color: '#EAEAEA',
          stepSize: 1,
        },
        grid: {
          display: true,
          color: '#EAEAEA', // ✅ สีเส้นกราฟแนวนอน (จางๆ)
          lineWidth: 1,
        },
      },
    },
  };

  return (
    <div className="mx-auto w-full h-[200px] md:h-[300px] lg:h-[350px] xl:h-[400px]">
      <Bar data={data} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};

export default BarComponent;
