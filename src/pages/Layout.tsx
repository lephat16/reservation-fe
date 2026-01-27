import { Outlet } from "react-router-dom";
import Sidebar from "../shared/components/global/Sidebar";
import Topbar from "../shared/components/global/Topbar";

const MainLayout = () => {
  return (
    <div className="App">
      <Sidebar />
      <main className="content">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
