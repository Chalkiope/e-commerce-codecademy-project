import { fetchWithAuth } from "./utils/fetchWithAuth";

export const getOrders = async () => {
  const response = await fetchWithAuth(`/orders`, {
    cache: "no-store", // Ensures the data is always fresh
  });
  if (response.ok) {
    const orders = await response.json();
    return orders;
  }
  return null;
};

export const createOrder = async () => {
  const response = await fetchWithAuth("/orders", {
    method: "POST",
    cache: "no-store",
  });
  if (response.ok) {
    const newOrder = await response.json();
    return newOrder;
  }
  return null;
};
