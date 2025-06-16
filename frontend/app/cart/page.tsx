"use client";
// import { cookies } from "next/headers";
import { useRouter } from "next/navigation";
// import { fetchWithAuth } from "@/api/utils/fetchWithAuth";
import { CartPage } from "./CartPage";
import { useEffect, useState } from "react";
import { getCart } from "@/api/cart";

// to do: overlap with cart.ts method, clean up

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

  console.log(`Cart Data: ${cartData}`);

  if (!cartData || !cartData.length) return <>Your Cart is empty</>;

  return <CartPage cartData={cartData} />;
}
