import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import Tasks from "./pages/Tasks.jsx";
import RoutineBuilder from "./pages/RoutineBuilder.jsx";
import Footer from "./components/Footer.jsx";
import NotFound from "./pages/NotFound.jsx";
import About from "./pages/About.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Landing from "./pages/Landing.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <main className="app-bg min-h-screen flex justify-center items-center">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<><Navbar /><div className="pt-15 w-full flex justify-center items-center min-h-screen"><Login /></div></>} />
          <Route path="/signup" element={<><Navbar /><div className="pt-15 w-full flex justify-center items-center min-h-screen"><Signup /></div></>} />
          <Route path="/about" element={<><Navbar /><div className="pt-15 w-full"><About /></div></>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoutes>
                <Navbar />
                <div className="pt-15 w-full"><Dashboard /></div>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoutes>
                <Navbar />
                <div className="pt-15 w-full"><Tasks /></div>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/routine-builder"
            element={
              <ProtectedRoutes>
                <Navbar />
                <div className="pt-15 w-full"><RoutineBuilder /></div>
              </ProtectedRoutes>
            }
          />
          <Route path="*" element={<><Navbar /><div className="pt-15 w-full"><NotFound /></div></>} />
        </Routes>
      </main>
      <Footer />
      <ScrollToTop />
    </BrowserRouter>
    
  );
};

export default App;
