import { Outlet } from "react-router-dom";
import Footer from "../components/common/Footer";
import Sidebar from "../components/headers/Sidebar";
import Header from "../components/headers/Header";

const Layout = () => {
  return (
    <div className="grid grid-cols-12 h-screen">
      <div className="col-span-2">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 col-span-10 overflow-hidden">
        <Header />
        <main className="p-6 bg-gray-50 flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
