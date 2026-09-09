import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import ForgotPassword from "./pages/ForgotPassword";
import Analyse from "./pages/Analyse";
import Results from "./pages/Results";
import Parametres from "./pages/Parametres";

function App() {
  return (
    <Routes>

      {/* PAGE PRESENTATION */}
      <Route
        path="/"
        element={<Home />}
      />

      {/* LOGIN ADMIN */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* INSCRIPTION */}
      <Route
        path="/register"
        element={<Register />}
      />

      {/* MOT DE PASSE OUBLIÉ */}
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      {/* DOCUMENTS */}
      <Route
        path="/documents"
        element={<Documents />}
      />

      {/* ANALYSE */}
      <Route
        path="/analyse"
        element={<Analyse />}
      />

      {/* RESULTATS */}
      <Route
        path="/results"
        element={<Results />}
      />

      {/* PARAMETRES */}
      <Route
        path="/settings"
        element={<Parametres />}
      />

      {/* PAGE INEXISTANTE */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;