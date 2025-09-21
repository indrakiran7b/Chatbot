import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import Search from "./pages/Search";
import RequireAuth from "./components/RequireAuth";
import "./theme.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>}>
          <Route index element={<Login/>}/>
          <Route path="register" element={<Register/>}/>
          <Route element={<RequireAuth/>}>
            <Route path="dashboard" element={<Dashboard/>}/>
            <Route path="chat/:projectId" element={<ChatPage/>}/>
            <Route path="search" element={<Search/>}/>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
