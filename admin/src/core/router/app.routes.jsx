// app.routes.tsx

import { Route, Routes } from "react-router-dom";
import Layout from "@/components/global/layout.jsx";
import { appRoutes } from "./routes";
import Login from "@/pages/login/login";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public – no Layout */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Protected – with Layout */}
      <Route element={<Layout />}>
        {appRoutes.map((route, index) => (
          <Route
            key={route.path || index}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>
    </Routes>
  );
}