import { Route, Routes } from "react-router-dom";
import Layout from "@/components/global/layout.jsx";
import { appRoutes } from "./routes";

export default function AppRoutes() {
  const layoutRoutes = appRoutes.filter((route) => route.withLayout);
  const bareRoutes = appRoutes.filter((route) => !route.withLayout);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {layoutRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path === "/" ? undefined : route.path}
            index={route.path === "/"}
            element={route.element}
          />
        ))}
      </Route>

      {bareRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}

      {/* 404 Route */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}