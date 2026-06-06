import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HotelReg from "./components/HotelReg";
import Layout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";
import Loader from "./components/Loader";
import PageTransition from "./components/PageTransition";

const App = () => {
  const { pathname } = useLocation();
  const { showHotelReg } = useAppContext();

  const isOwnerPath = pathname.includes("owner");
  const isAuthPage  = pathname === '/login' || pathname === '/register';

  return (
    <div style={{ background: "var(--color-surface)" }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-surface-2)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />

      {!isOwnerPath && !isAuthPage && <Navbar />}
      {showHotelReg && <HotelReg />}

      {/* pt-16 offsets the 48px floating navbar + 12px gap */}
      <div className={`min-h-[70vh] ${!isOwnerPath && !isAuthPage ? "pt-16" : ""}`}>
        <PageTransition>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/rooms"       element={<AllRooms />} />
            <Route path="/rooms/:id"   element={<RoomDetails />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/loader/:nextUrl" element={<Loader />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />

            <Route path="/owner" element={<Layout />}>
              <Route index            element={<Dashboard />} />
              <Route path="add-room"  element={<AddRoom />} />
              <Route path="list-room" element={<ListRoom />} />
            </Route>
          </Routes>
        </PageTransition>
      </div>

      {!isOwnerPath && !isAuthPage && <Footer />}
    </div>
  );
};

export default App;