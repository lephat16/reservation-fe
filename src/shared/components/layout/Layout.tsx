import { Outlet } from "react-router-dom";
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";
import { Box, Drawer, } from "@mui/material";
import { useState } from "react";
import { useScreen } from "../../hooks/ScreenContext";

const MainLayout = () => {
  const { isSM } = useScreen();
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
          <Sidebar onClose={() => setOpenSidebar(false)} />
        </Drawer>
      )}
      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: "auto",
          height: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
        className="content">
        <Topbar onSidebarClick={() => setOpenSidebar(true)} />
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </div>
  );
};

export default MainLayout;
