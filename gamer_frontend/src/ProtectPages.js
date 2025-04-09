import {Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CreateProf from './pages/CreateProf';
import Profile from './pages/Profile';
import Group from './pages/Group/Group';
import CreateGroup from './pages/Group/CreateGroup';

function App() {
    return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/createprof" element={<CreateProf />} />
                <Route path="/profile" element={<Profile />} />

                <Route path="/group" element={<Group />} />
                <Route path="/creategroup" element={<CreateGroup />} />
            </Routes>
    );
}

export default App;
