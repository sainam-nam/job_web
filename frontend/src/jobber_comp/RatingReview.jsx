import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const RatingReview = ({ initialScore = 0, onChange }) => {
  const [score, setScore] = useState(initialScore);

  const handleClick = (index, e) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - left;
    const isHalf = clickX < width / 2; // ครึ่งซ้าย = 0.5
    const newScore = index + (isHalf ? 0.5 : 1);
    setScore(newScore);
    onChange?.(newScore); // ส่งค่าออกไปถ้าต้องการ
  };

  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center space-x-1 text-5xl">
      {[...Array(5)].map((_, i) => {
        // คำนวณ icon ที่ต้องแสดง
        let icon;
        if (i < full) icon = <FaStar />;
        else if (i === full && half) icon = <FaStarHalfAlt />;
        else icon = <FaRegStar />;

        return (
          <span
            key={i}
            className="cursor-pointer"
            onClick={(e) => handleClick(i, e)}
          >
            {icon}
          </span>
        );
      })}
      <span className="text-sm">{score}</span>
    </div>
  );
};

export default RatingReview;
