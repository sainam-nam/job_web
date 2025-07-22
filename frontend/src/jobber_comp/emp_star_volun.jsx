import React, { useEffect, useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const EmpRating_volun = ({ emp_id , cl }) => {
  const [stars, setStars] = useState(0);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    //console.log('emp_id:', cl);
    //if (!emp_id) return;
    fetch(`${apiUrl}/volun_rating?emp_id=${emp_id}`)
      .then(res => res.json())
      .then(data => setStars(data.stars || 0));
  }, [emp_id , cl]);

  const full = Math.floor(stars);
  const half = stars % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  //const starPercent = Math.max(0, Math.min(5, stars)) / 5 * 100;

  // const getStarFill = (index) => {
  //   const diff = stars - index;
  //   if (diff >= 1) return 100;
  //   if (diff > 0) return diff * 100;
  //   return 0;
  // };

  return (
    <div className={`flex text-[${cl}] text-xl md:text-3xl lg:text-4xl xl:text-5xl`}>
      {[...Array(full)].map((_, i) => <FaStar key={i} />)}
      {half && <FaStarHalfAlt />}
      {[...Array(empty)].map((_, i) => <FaRegStar key={i + full + 1} />)}
      <div className='text-[8px] md:text-xs'>{stars}</div>
    </div>
    // <div className="relative w-[120px] h-[24px] text-xl">
    //   {/* ดาวล่าง = ว่าง */}
    //   <div className="absolute top-0 left-0 flex text-gray-300 pointer-events-none">
    //     {[...Array(5)].map((_, i) => <FaStar key={`bg-${i}`} />)}
    //   </div>

    //   {/* ดาวบน = เติมสีตามเปอร์เซ็นต์ */}
    //   <div
    //     className="absolute top-0 left-0 flex text-[#7B6ADA] overflow-hidden pointer-events-none"
    //     style={{ width: `50%` }}
    //   >
    //     {[...Array(5)].map((_, i) => <FaStar key={`fg-${i}`} />)}
    //   </div>
    // </div>
    // <div className="flex space-x-1 text-xl">
    //   {[...Array(5)].map((_, i) => {
    //     const fill = getStarFill(i); // คำนวณเปอร์เซ็นต์ของแต่ละดวง
    //     return (
    //       <div key={i} className="relative w-6 h-6">
            

    //         {/* ดาวสีซ้อน */}
    //         <FaStar
    //           className="absolute text-[#7B6ADA] w-full h-full overflow-hidden"
    //           style={{
    //             //width: `${fill}%`,
    //             clipPath: 'inset(0 0 0 0)',
    //             background: `linear-gradient(90deg, #7B6ADA ${fill}%, #d1d5db ${fill}%)`
    //           }}
    //         />
    //         {/* ดาวว่าง (พื้นหลัง) */}
    //         {/* <FaStar className="absolute border border-white w-full h-full" /> */}
    //         {[...Array(empty)].map((_, i) => <FaRegStar key={i + full + 1}  className='absolute w-full h-full text-white'/>)}
    //       </div>
    //     );
    //   })}
    // </div>
  );
};

export default EmpRating_volun;
