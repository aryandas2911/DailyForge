import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Base Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.10),transparent_30%),linear-gradient(to_bottom_right,#050816,#0b1120,#111827)]" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:70px_70px]" />

      {/* Animated Blobs */}
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl animate-pulse" />

      <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-3xl animate-pulse delay-1000" />

      <div className="absolute bottom-[-120px] left-1/3 h-[24rem] w-[24rem] rounded-full bg-cyan-500/15 blur-3xl animate-pulse delay-500" />

      {/* Subtle Glow Effects */}
      <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/5 blur-[140px]" />

      {/* Noise Texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:url('https://www.transparenttextures.com/patterns/asfalt-light.png')]" />

      {/* Main Content */}
        <Navbar/>
      <main className="relative z-10 min-h-screen pt-15 flex justify-center items-center">
        <Outlet />
      </main>
    </div>
  );
}
