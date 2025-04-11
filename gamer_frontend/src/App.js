import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from './pages/Login';
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import ProtectPages from "./ProtectPages";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
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
