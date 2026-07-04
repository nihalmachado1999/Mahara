import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Food from "./pages/Food";
import Events from "./pages/Events";
import Plan from "./pages/Plan";
import Culture from "./pages/Culture";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/food" element={<Food />} />
        <Route path="/events" element={<Events />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/culture" element={<Culture />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
