import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import Tasks from "./pages/Tasks.jsx";
import RoutineBuilder from "./pages/RoutineBuilder.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-bg min-h-screen pt-15 flex justify-center items-center">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/routine-builder" element={<RoutineBuilder />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
