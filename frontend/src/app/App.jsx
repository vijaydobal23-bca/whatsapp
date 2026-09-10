import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app.routes.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;