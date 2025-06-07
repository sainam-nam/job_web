import { Link } from "react-router-dom";

export default function Dashboardvolun() {
    return(
        <main className="flex-1 p-6">
        {/* Tab Switch */}
        <div className="flex space-x-4">
          <Link to="/Admin/Dashboard"><button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg">งาน</button></Link>
          <Link to="/Admin/Dashboardvolun"><button className="px-4 py-2 bg-purple-600 text-white rounded-lg">กิจกรรมจิตอาสา</button></Link>
        </div>

        {/* สถิติข้อมูล */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-white shadow-md rounded-lg text-center">
            <p className="text-xl text-purple-600 font-bold">0000000</p>
            <p className="text-gray-500">ผู้สมัครงาน</p>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg text-center">
            <p className="text-xl text-purple-600 font-bold">153</p>
            <p className="text-gray-500">นายจ้าง</p>
          </div>
          <div className="p-4 bg-purple-600 shadow-md rounded-lg text-center text-white">
            <p className="text-xl font-bold">1,532</p>
            <p>งาน</p>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg text-center">
            <p className="text-xl text-purple-600 font-bold">204</p>
            <p className="text-gray-500">ประเภทงาน</p>
          </div>
        </div>

        {/* กราฟ / Chart */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-white shadow-md rounded-lg">📊 กราฟวงกลม</div>
          <div className="p-4 bg-white shadow-md rounded-lg">📊 กราฟแท่ง</div>
        </div>
      </main>
    )
}