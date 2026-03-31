import { Routes, Route } from "react-router-dom";
import Login from "../pages/login.jsx";
import Register from "../pages/register.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;