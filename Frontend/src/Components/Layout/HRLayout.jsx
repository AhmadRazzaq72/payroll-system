import Sidebar from "../HRSidebar";
import Header from "../Header";
import { Outlet } from "react-router-dom";

const HrLayoutDashboard = ()=>{
    return(
<div className="min-h-screen flex flex-col bg-gray-1">
<Header/>
<div className="flex flex-1">
<Sidebar/>
<main className="flex-1 overflow-y-auto">
<Outlet />
</main>
</div>
</div>
    );
};
export default HrLayoutDashboard;