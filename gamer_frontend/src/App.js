import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from './pages/Login';
import Home from "./pages/Home";
import CreateProf from './pages/CreateProf';
import Profile from './pages/Profile';
import CreatePost from "./pages/CreatePost";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route path="/createprof" element={<CreateProf />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/createpost" element={<CreatePost />} />
            </Routes>
        </Router>
    );
}

export default App;
