import { Routes, Route } from 'react-router-dom';
import Emp_InfoForm from './form_info';
import { EMP_Profile } from './profile';
import Emp_CheckProfileStatus from './Check_Pf_status';
import Emp_InfoView from './view_info';
import Emp_WorkView from './view_work';
import Emp_EditWork from './edit_work';
import Emp_VolunView from './view_volun';
import Emp_EditVolun from './edit_volun';


const Emp_ProfileRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<EMP_Profile />}>
        <Route index element={<Emp_CheckProfileStatus />} />
        <Route path="status" element={<Emp_CheckProfileStatus />} />
        <Route path="info/view" element={<Emp_InfoView />} />
        <Route path="work/view" element={<Emp_WorkView />} />
        <Route path="volun/view" element={<Emp_VolunView />} />

        <Route path="info/edit" element={<Emp_InfoForm />} />
        <Route path="work/edit" element={<Emp_EditWork />} />
        <Route path="volun/edit" element={<Emp_EditVolun />} />
      </Route>
    </Routes>
  );
};

export default Emp_ProfileRoutes;
