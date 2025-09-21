import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function App(){
  return (
    <div style={{display:"grid", gridTemplateColumns:"280px 1fr", height:"100vh"}}>
      <Sidebar/>
      <div className="scroll" style={{padding:"20px 28px"}}>
        <Outlet/>
      </div>
    </div>
  );
}
