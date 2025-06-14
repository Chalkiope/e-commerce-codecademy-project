import { API_ENDPOINT } from "../api";

type Options = RequestInit & {
  headers?: Record<string, string> | Headers;
  serverCookie?: string;
};

export const fetchWithAuth = async (url: string, options: Options = {}) => {
  const { serverCookie, ...restOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Safely merge existing headers if they exist and are of the expected type
  if (restOptions.headers) {
    if (restOptions.headers instanceof Headers) {
      // If it's a Headers object, convert it to a plain object
      restOptions.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else {
      // If it's a plain Record<string, string>
      Object.assign(headers, restOptions.headers);
    }
  }

  if (serverCookie) {
    headers["Cookie"] = serverCookie;
  }
  console.log(url);
  const response = await fetch(`${API_ENDPOINT}${url}`, {
    ...restOptions,
    credentials: "include",
    headers: headers,
  });

  if (response.ok) {
    return response;
  } else {
    if (response.status === 401) {
      throw new Error("Unauthorized"); // Throw a specific error for authentication issues
    }
    throw new Error(
      `HTTP error! Status: ${response.status} - ${response.statusText}`
    );
  }
};
