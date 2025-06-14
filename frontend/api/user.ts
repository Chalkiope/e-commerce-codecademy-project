import { API_ENDPOINT } from "./api";

export const getAuthUser = async () => {
  const response = await fetch(`${API_ENDPOINT}/auth/profile`, {
    method: "GET",
    credentials: "include",
  });
  console.log(response);
  if (response.ok) {
    const authUser = await response.json();
    return authUser;
  } else {
    const error = await response.json();
    console.error(error.message);
    return null;
  }
};
