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
      // const cookieStore = cookies();
      // const sessionCookie = (await cookieStore).get("connect.sid");
      // const cookieHeaderString = sessionCookie
      //   ? `${sessionCookie.name}=${sessionCookie.value}`
      //   : "";

      // if (!cookieHeaderString) {
      //   console.log("No session cookie found, redirecting to login.");
      //   redirect("/login");
      // }

      // try {
      //   const response = await fetchWithAuth("/cart", {
      //     serverCookie: cookieHeaderString, // Pass the cookie string to fetchWithAuth
      //     cache: "no-store", // Ensures the data is always fresh
      //   });
      //   console.log(`CartPage.tsx`);

      //   // The fetchWithAuth utility will throw an 'Unauthorized' error for 401 status
      //   if (response.ok) {
      //     const data = await response.json();
      //     return data;
      //   }
      //   return null;
      // } catch (error: unknown) {
      //   if (error instanceof Error) {
      //     console.error("Error fetching cart data:", error);
      //     // Catch the specific 'Unauthorized' error for clean redirection
      //     if (error.message === "Unauthorized") {
      //       console.log(
      //         "Authentication failed during cart fetch, redirecting to login."
      //       );
      //       redirect("/login");
      //     }
      //     // For other errors, you might want to show an error message or redirect to a generic error page
      //     // For now, let's redirect to login for simplicity in this example
      //   }
      //   redirect("/login");
      // }
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
  // const cartData = await getCartData(); // This will handle redirects if unauthorized

  if (isLoading) return <p>Loading...</p>;

  console.log(`Cart Data: ${cartData}`);

  if (!cartData || !cartData.length) return <>Your Cart is empty</>;

  return <CartPage cartData={cartData} />;
}
