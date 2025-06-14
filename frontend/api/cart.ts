import { fetchWithAuth } from "./utils/fetchWithAuth";

export const getCart = async () => {
  const response = await fetchWithAuth("/cart");
  const cart = await response.json();
  console.log(`cart.ts: ${cart}`);
  return cart;
};

export const addToCart = async (productId: number, amount: number) => {
  const response = await fetchWithAuth("/cart", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, amount: amount }),
  });
  if (response.ok) {
    // const cart = await response.json();
    console.log("Item added to cart");
    const updatedCart = await getCart(); // Fetch the updated cart
    return updatedCart;
  } else {
    const error = await response.json();
    console.error("Failed to add item to cart:", error.message);
    throw new Error(error.message);
  }
};

export const updateCartItem = async (productId: number, amount: number) => {
  console.log(productId, amount);
  const response = await fetchWithAuth("/cart", {
    method: "PUT",
    body: JSON.stringify({ product_id: productId, amount: amount }),
  });
  if (response.ok) {
    console.log("Cart item updated successfully");
    const updatedCart = await getCart(); // Fetch the updated cart
    return updatedCart;
  } else {
    const error = await response.json();
    console.error("Failed to update cart item:", error.message);
    throw new Error(error.message);
  }
};

export const deleteCartItem = async (productId: number) => {
  const response = await fetchWithAuth("/cart", {
    method: "DELETE",
    body: JSON.stringify({ product_id: productId }),
  });
  if (response.ok) {
    console.log("Cart item deleted");
    const updatedCart = await getCart(); // Fetch the updated cart
    return updatedCart;
  } else {
    const error = await response.json();
    console.error("Failed to delete cart item:", error.message);
    throw new Error(error.message);
  }
};

// only sets up stripe payment session
export const checkout = async () => {
  try {
    // Added try-catch around the fetchWithAuth call
    const response = await fetchWithAuth("/cart/stripe-checkout", {
      method: "POST",
    });

    if (response.ok) {
      // It's possible for a successful HTTP status (200-299) to still return
      // a non-JSON body if the backend sends an empty response, or plain text.
      // If the backend sends an empty 200 response, response.json() would throw an error.
      const data = await response.json(); // <--- This line might be throwing if body is empty or not JSON
      console.log("Backend response data:", data);

      if (data && data.sessionUrl) {
        console.log("Checkout session URL received:", data.sessionUrl);
        return { success: true, sessionUrl: data.sessionUrl };
      } else {
        console.error("Backend response missing sessionUrl:", data);
        return {
          success: false,
          error:
            "Failed to get Stripe Checkout session URL or unexpected data format.",
        };
      }
    } else {
      // Handle HTTP errors (e.g., 400, 500 from your backend)
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText })); // Try to parse, but handle non-JSON error bodies
      console.error(
        "Checkout failed:",
        errorData.message || `HTTP error! Status: ${response.status}`
      );
      return { success: false, error: errorData.message || "Checkout failed" };
    }
  } catch (err) {
    // This catches errors from fetchWithAuth itself (e.g., "Unauthorized", network errors)
    console.error("Error during fetchWithAuth or processing response:", err);

    return {
      success: false,
      error: err || "An unexpected error occurred.",
    };
  }
};
