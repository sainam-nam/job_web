import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./login";
import Admin from "./admin";
import User from "./user";
import Register from "./register";
import ForgetPassword from "./forget_pass";
import Login_em from "./login_em";
import Dashboard from "./comp/dashb";
import HS from "./comp/hs";
import SS from "./comp/ss";
import JobType from "./comp/jobtype";
import Dashboardvolun from "./comp/dashbvolun";


function App() {
    return (
        <BrowserRouter>
            
            <Routes>
                <Route path="" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login_em" element={<Login_em />} />
                
                <Route path="/Admin" element={<Admin />}>
                    <Route index element={<Dashboard />} />
                    <Route path="Dashboard" element={<Dashboard />} />
                    <Route path="Dashboardvolun" element={<Dashboardvolun />} />
                    <Route path="HS" element={<HS />} />
                    <Route path="SS" element={<SS />} />
                    <Route path="jobtype" element={<JobType />} />
                </Route>

                <Route path="/User" element={<User />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/forget-password" element={<ForgetPassword />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;