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
import Search from "./pages/Search";

// Shared component
import NavBar from "./components/NavBar";

/**
 * ProtectPages component
 * - Wraps all routes of the app
 * - Optionally hides the NavBar on certain pages (like create/edit profile)
 * - Passes props like `hasUnread` to NavBar
 *
 * Props:
 * - hasUnread: boolean indicating if there are unread notifications
 * - setHasUnread: function to update the unread state
 * - userId: current logged-in user's ID
 */
const ProtectPages = ({ hasUnread, setHasUnread, userId }) => {
  const location = useLocation();

  // Hide NavBar on specific routes (create/edit profile)
  const hideNavBar = ["/createprof", "/editprof"].includes(location.pathname);

  return (
    <>
      {/* Conditional NavBar rendering */}
      {!hideNavBar && <NavBar hasUnread={hasUnread} />}

      {/* App Routes */}
      <Routes>
        {/* Profile pages */}
        <Route path="/createprof" element={<CreateProf />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/editprof" element={<CreateProf editMode={true} />} />

        {/* Group pages */}
        <Route path="/group" element={<Group />} />
        <Route path="/creategroup" element={<CreateGroup />} />
        <Route path="/group/edit/:groupId" element={<CreateGroup />} />
        <Route path="/yourgroups" element={<YourGroupList />} />
        <Route path="/joinedgroups" element={<JoinedGrpList />} />
        <Route path="/group/view/:id" element={<GroupView />} />

        {/* Suggest page */}
        <Route path="/suggest" element={<Suggest />} />

        {/* Saved posts */}
        <Route path="/save" element={<Save />} />

        {/* All profiles */}
        <Route path="/allprof" element={<AllProfiles />} />
        <Route path="/profile/view/:email" element={<ViewProfile />} />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={<Notifications userId={userId} setHasUnread={setHasUnread} />}
        />

        {/* Chat pages */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:email" element={<Chat />} />

        {/* Search page */}
        <Route path="/search" element={<Search />} />
      </Routes>
    </>
  );
};

export default ProtectPages;
