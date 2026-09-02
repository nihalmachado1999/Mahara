import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import CustomCursor from "./components/CustomCursor";
import Footer from "./components/Footer";
import InstallPrompt from "./components/InstallPrompt";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import Food from "./pages/Food";
import Events from "./pages/Events";
import Plan from "./pages/Plan";
import PearlingPath from "./pages/PearlingPath";
import Culture from "./pages/Culture";
import Stories from "./pages/Stories";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/food" element={<Food />} />
        <Route path="/events" element={<Events />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/pearling-path" element={<PearlingPath />} />
        <Route path="/culture" element={<Culture />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
      <InstallPrompt />
    </BrowserRouter>
  );
}