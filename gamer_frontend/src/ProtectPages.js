import {Route, Routes } from "react-router-dom";
import CreateProf from './pages/CreateProf';
import Profile from './pages/Profile';
import Group from './pages/Group/Group';
import CreateGroup from './pages/Group/CreateGroup';
import Suggest from './pages/Suggest/Suggest';
import Save from './pages/SavedPosts';

function App() {
    return (
            <Routes>
                <Route path="/createprof" element={<CreateProf />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/editprof" element={<CreateProf editMode={true} />} />

                <Route path="/group" element={<Group />} />
                <Route path="/creategroup" element={<CreateGroup />} />

                <Route path="/suggest" element={<Suggest />} />

                <Route path="/save" element={<Save />} />
            </Routes>
    );
}

export default App;
