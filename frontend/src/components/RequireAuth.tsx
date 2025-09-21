import React from "react";
import { Outlet } from "react-router-dom";
import AuthRequired from "../pages/AuthRequired";

export default function RequireAuth(){
  const token = localStorage.getItem("token");
  return token ? <Outlet/> : <AuthRequired/>;
}
