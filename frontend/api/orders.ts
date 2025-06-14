import { fetchWithAuth } from "./utils/fetchWithAuth";

export const getOrders = async (cookieHeaderString: string) => {
  const response = await fetchWithAuth(`/orders`, {
    serverCookie: cookieHeaderString, // Pass the cookie string to fetchWithAuth
    cache: "no-store", // Ensures the data is always fresh
  });
  if (response.ok) {
    const orders = await response.json();
    return orders;
  }
  return null;
};

export const createOrder = async (cookieHeaderString: string) => {
  const response = await fetchWithAuth("/orders", {
    serverCookie: cookieHeaderString,
    method: "POST",
    cache: "no-store",
  });
  if (response.ok) {
    const newOrder = await response.json();
    return newOrder;
  }
  return null;
};
