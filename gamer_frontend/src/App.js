import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./pages/Auth/Signup";
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import ProtectPages from "./ProtectPages";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<Home />} />
                
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <ProtectPages />
                        </ProtectedRoute>
                    }
                />          
            </Routes>
        </Router>
    );
}

export default App;
