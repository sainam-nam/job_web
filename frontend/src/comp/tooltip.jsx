import { useState } from "react";
import { Info } from "lucide-react"; // ใช้ icon ! จาก lucide-react

function TooltipField({ label, tooltip, children }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-2 text-[#8E80FF] font-bold">
        {label}
        <div 
          className="relative inline-block"
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          <Info className="w-4 h-4 text-[#8E80FF] cursor-pointer" />
          {show && (
            <div className="absolute z-10 w-56 p-2 text-xs text-white bg-[#8E80FF] rounded-lg shadow-md -top-2 left-6 whitespace-pre-line">
              {tooltip}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default TooltipField