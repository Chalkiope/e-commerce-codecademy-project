import { Order, OrderItemType } from "./Order";

export interface OrderType {
  id: number;
  items: OrderItemType[];
  status: string;
  total: number | null;
  user_id: number;
}
export const OrdersPage = ({ orders }: { orders: OrderType[] }) => {
  console.log(orders);
  if (!orders || orders.length === 0) return <>No orders made yet</>;
  return (
    <div>
      <h1>OrdersPage</h1>
      {orders?.map((order: OrderType, i) => (
        <Order key={order.id} order={order} isLatest={i === 0} />
      ))}
    </div>
  );
};
