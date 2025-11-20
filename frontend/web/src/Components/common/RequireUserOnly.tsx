import React from "react";
import { Navigate } from "react-router-dom";
import { isSuperUser } from "../../Services/auth";

export const RequireUserOnly = ({ children }: { children: React.ReactNode }) => {
  return isSuperUser() ? <Navigate to="/moderar-reportes" replace /> : <>{children}</>;
};
