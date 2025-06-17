"use client";
import { useEffect, useState } from "react";
import { OrdersPage } from "./OrdersPage";
import { getOrders } from "@/api/orders";
import { useRouter } from "next/navigation";

export default function Page() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getOrderData = async () => {
      try {
        const ordersData = await getOrders();
        if (ordersData && ordersData.length > 0) {
          setOrders(ordersData);
        } else {
          console.warn("No orders found");
          // router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    getOrderData();
  }, []);
  if (isLoading) return <p>Loading...</p>;

  console.log(`Orders: ${orders}`);
  if (!orders || !orders.length) return <>Your Cart is empty</>;
  return <OrdersPage orders={orders} />;
}
