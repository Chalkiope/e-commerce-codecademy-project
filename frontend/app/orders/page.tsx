import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OrdersPage } from "./OrdersPage";
import { getOrders } from "@/api/orders";

const getOrderData = async () => {
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
    const ordersData = await getOrders(cookieHeaderString);
    if (ordersData) {
      return ordersData;
    }
    return null;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        console.log(
          "Authentication failed during order fetch, redirecting to login."
        );
        redirect("/login");
      }
    }
    redirect("/login");
  }
};

export default async function Page() {
  const orders = await getOrderData(); // This will handle redirects if unauthorized
  console.log(`Orders: ${orders}`);
  if (!orders || !orders.length) return <>Your Cart is empty</>;
  return <OrdersPage orders={orders} />;
}
