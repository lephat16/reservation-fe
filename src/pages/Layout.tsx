import { Outlet } from "react-router-dom";
import Sidebar from "../shared/components/global/Sidebar";
import Topbar from "../shared/components/global/Topbar";
import { Drawer,} from "@mui/material";
import { useState } from "react";
import { useScreen } from "../shared/components/global/ScreenContext";

const MainLayout = () => {
  const {isSM} = useScreen();
  const [openSidebar, setOpenSidebar] = useState(false);
  return (
    <div className="App">
      {!isSM && <Sidebar />}

      {isSM && (
        <Drawer
          anchor="right"
          open={openSidebar}
          onClose={() => setOpenSidebar(false)}
        >
          <Sidebar onClose={() => setOpenSidebar(false)}/>
        </Drawer>
      )}
      <main className="content">
        <Topbar onSidebarClick={() => setOpenSidebar(true)}/>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
