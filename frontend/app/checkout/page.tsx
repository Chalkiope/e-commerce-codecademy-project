import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchWithAuth } from "@/api/utils/fetchWithAuth";
import { CheckoutPage } from "./CheckoutPage";

const getCartData = async () => {
  const cookieStore = cookies();
  const sessionCookie = (await cookieStore).get("connect.sid");
  const cookieHeaderString = sessionCookie
    ? `${sessionCookie.name}=${sessionCookie.value}`
    : "";

  if (!cookieHeaderString) {
    console.log("No session cookie found, redirecting to login.");
    redirect("/login");
  }

  try {
    const response = await fetchWithAuth("/cart", {
      serverCookie: cookieHeaderString, // Pass the cookie string to fetchWithAuth
      cache: "no-store", // Ensures the data is always fresh
    });

    // The fetchWithAuth utility will throw an 'Unauthorized' error for 401 status
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching cart data:", error);
      // Catch the specific 'Unauthorized' error for clean redirection
      if (error.message === "Unauthorized") {
        console.log(
          "Authentication failed during cart fetch, redirecting to login."
        );
        redirect("/login");
      }
      // For other errors, you might want to show an error message or redirect to a generic error page
      // For now, let's redirect to login for simplicity in this example
    }
    redirect("/login");
  }
};

export default async function Page() {
  const cartData = await getCartData(); // This will handle redirects if unauthorized
  if (!cartData || !cartData.cart.length) return <>Your Cart is empty</>;
  return <CheckoutPage cartData={cartData.cart} />;
}
