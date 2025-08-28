import { Route, Routes, useLocation } from "react-router-dom";
import CreateProf from './pages/CreateProf';
import Profile from './pages/Profile';
import Group from './pages/Group/Group';
import CreateGroup from './pages/Group/CreateGroup';
import YourGroupList from './pages/Group/YourGroupList';
import JoinedGrpList from "./pages/Group/JoinedGrpList";
import GroupView from "./pages/Group/GroupView";
import Suggest from './pages/Suggest/Suggest';
import Save from './pages/SavedPosts';
import AllProfiles from './pages/AllProfiles/AllProfiles';
import ViewProfile from './pages/AllProfiles/ViewProfile';
import Notifications from "./pages/Notification/Notifications";
import Chat from './pages/Chat/Chat';
import NavBar from "./components/NavBar";
import Search from "./pages/Search";

const ProtectPages = ({ hasUnread, setHasUnread, userId }) => {
  const location = useLocation();

  const hideNavBar = ["/createprof", "/editprof"].includes(location.pathname);

  return (
    <>
      {!hideNavBar && <NavBar hasUnread={hasUnread} />}

      <Routes>
        <Route path="/createprof" element={<CreateProf />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/editprof" element={<CreateProf editMode={true} />} />

        <Route path="/group" element={<Group />} />
        <Route path="/creategroup" element={<CreateGroup />} />
        <Route path="/group/edit/:groupId" element={<CreateGroup />} />
        <Route path="/yourgroups" element={<YourGroupList />} />
        <Route path="/joinedgroups" element={<JoinedGrpList />} />
        <Route path="/group/view/:id" element={<GroupView />} />

        <Route path="/suggest" element={<Suggest />} />

        <Route path="/save" element={<Save />} />

        <Route path="/allprof" element={<AllProfiles />} />
        <Route path="/profile/view/:email" element={<ViewProfile />} />

        <Route
          path="/notifications"
          element={
            <Notifications
              userId={userId}
              setHasUnread={setHasUnread}
            />
          }
        />

        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:email" element={<Chat />} />

        <Route path="/search" element={<Search />} />
      </Routes>
    </>
  );
};

export default ProtectPages;
