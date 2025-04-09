import { jwtDecode } from "jwt-decode";

export const getUserEmail = () => {
  const token = localStorage.getItem("token");
  if (token) {
    const decoded = jwtDecode(token);
    return decoded.sub; 
  }
  return null;
};

//use to display user name after logging