"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutPage } from "./CheckoutPage";
import { getCart } from "@/api/cart";

export default function Page() {
  const [cartData, setCartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getCartData = async () => {
      try {
        const cart = await getCart(); // your existing helper using fetchWithAuth
        if (cart && cart.cart) {
          setCartData(cart.cart);
        } else {
          console.warn("No cart found, redirecting.");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    getCartData();
  }, []);

  if (isLoading) return <p>Loading...</p>;

  if (!cartData || !cartData.length) return <>Your Cart is empty</>;

  return <CheckoutPage cartData={cartData} />;
}
