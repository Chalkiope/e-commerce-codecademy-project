import { API_ENDPOINT } from "./api";
import { fetchWithAuth } from "./utils/fetchWithAuth";

// export const login = async (email: string, password: string) => {
//   console.log(email, password);
//   const response = await fetch(`${API_ENDPOINT}/auth/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include", // if using cookies/session
//     body: JSON.stringify({ email, password }),
//   });
//   console.log(response);
//   if (response.ok) {
//     const data = await response.json();
//     console.log("Login successful", data);
//     return data;
//     // e.g., store token or redirect
//   } else {
//     const error = await response.json();
//     console.error("Login failed:", error.message);
//     return error.message;
//   }
// };
export const login = async (email: string, password: string) => {
  console.log(email, password);
  const response = await fetchWithAuth("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  console.log(response);
  if (response.ok) {
    const data = await response.json();
    console.log("Login successful", data);
    return data;
  } else {
    const error = await response.json();
    console.error("Login failed:", error.message);
    return error.message;
  }
};

export const register = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await fetch(`${API_ENDPOINT}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // if using cookies/session
    body: JSON.stringify({ name, email, password }),
  });
  console.log(response);
  if (response.ok) {
    const data = await response.json();
    console.log(data);
    console.log("Register successful", data);
    return { success: true, data };
  } else {
    const error = await response.json();
    console.error("Register failed:", error.message);
    return { success: false, error: error.message || "Registration failed" };
  }
};

export const logout = async () => {
  const response = await fetch(`${API_ENDPOINT}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Logout successful", data);
    return { success: true, data };
  } else {
    const error = await response.json();
    console.error("Logout failed:", error.message);
    return { success: false, error: error.message };
  }
};
