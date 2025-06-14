"use client";
import { useEffect, useState } from "react";
import { Button, Card } from "@mui/material";
import { CartType } from "../cart/CartPage";
import { checkout } from "@/api/cart";

export const CheckoutPage = ({ cartData }: { cartData: CartType[] }) => {
  const [cartTotal, setCartTotal] = useState<number | null>(0);
  const [loadingCheckout, setLoadingCheckout] = useState(false); // Renamed for clarity
  const [errorCheckout, setErrorCheckout] = useState<null | string>(null); // Renamed

  const handleProceedToPayment = async () => {
    setLoadingCheckout(true);
    setErrorCheckout(null); // Clear previous errors
    try {
      const response = await checkout(); // Call your backend
      //   const data = response.sessionUrl; // This 'data' should now contain { sessionUrl: '...' }

      if (response.success && response.sessionUrl) {
        // Redirect the user to the Stripe Checkout page
        window.location.href = response.sessionUrl;
      } else {
        setErrorCheckout(
          response?.error || response?.error || "Failed to initiate checkout."
        );
        console.error(
          "Frontend: Failed to get session URL from backend:",
          response
        );
      }
    } catch (err) {
      console.error("Frontend: Error initiating checkout:", err);
      setErrorCheckout("Network error or unexpected issue during checkout.");
    } finally {
      setLoadingCheckout(false);
    }
  };

  useEffect(() => {
    let total = 0;
    cartData.map((item) => {
      total += item.amount * item.price;
    });
    setCartTotal(total);
  }, [cartData]);

  if (!cartData || cartData.length === 0) {
    return <div>Your cart is empty.</div>;
  }
  if (!cartData || cartData.length === 0) return <>Your cart is empty</>;
  return (
    <div>
      <h1>Shopping Cart</h1>
      <div className="flex flex-col gap-4">
        {cartData?.map((cartItem: CartType) => {
          return (
            <div key={cartItem.id}>
              <Card>
                <div className="product-tile flex flex-col p-4">
                  <h1 className="text-2xl mb-4">{cartItem.name}</h1>
                  <p>{cartItem.description}</p>
                  <div className="flex justify-between my-2">
                    <span>{cartItem.amount} in Cart</span>
                    <span>{cartItem.price}$ per item</span>
                    <span>{cartItem.price * cartItem.amount}$ total</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <Button
                      variant="outlined"
                      href={`/products/${cartItem.product_id}`}
                    >
                      View Product
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
        <div className="flex justify-end">
          <div>Cart Total: ${cartTotal}</div>
        </div>
        {/* Display loading/error messages */}
        {loadingCheckout && <div>Redirecting to Stripe Checkout...</div>}
        {errorCheckout && <div>Error: {errorCheckout}</div>}

        {/* Button to initiate the checkout process */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleProceedToPayment}
          disabled={loadingCheckout || !cartTotal || cartTotal <= 0}
        >
          Proceed to Payment (Redirect to Stripe)
        </Button>
      </div>
    </div>
  );
};
