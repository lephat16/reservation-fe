import { Outlet } from "react-router-dom";
import Sidebar from "../components/global/Sidebar";
import Topbar from "../components/global/Topbar";

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
