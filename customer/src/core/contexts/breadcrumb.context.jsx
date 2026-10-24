import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const BreadcrumbContext = createContext({
  customBreadcrumbs: null,
  setCustomBreadcrumbs: () => {},
});

export const useBreadcrumb = () => useContext(BreadcrumbContext);

export function BreadcrumbProvider({ children }) {
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState(null);
  const location = useLocation();

  // Automatically reset custom breadcrumbs whenever the URL changes
  useEffect(() => {
    setCustomBreadcrumbs(null);
  }, [location.pathname]);

  return (
    <BreadcrumbContext.Provider value={{ customBreadcrumbs, setCustomBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}
