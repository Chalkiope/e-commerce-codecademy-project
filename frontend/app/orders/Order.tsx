"use client";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { OrderType } from "./OrdersPage";

export interface OrderItemType {
  order_item_id: number;
  product_id: number;
  product_name: string;
  product_description: string;
  product_price: number;
  quantity_ordered: number;
}

export const Order = ({
  order,
  isLatest,
}: {
  order: OrderType;
  isLatest: boolean;
}) => {
  console.log(isLatest);
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        {isLatest ? (
          <Badge badgeContent={"NEW ORDER"} color="primary">
            <h2 className="w-full">Order No: #{order.id}</h2>
          </Badge>
        ) : (
          <h2>Order No: #{order.id}</h2>
        )}
      </AccordionSummary>
      <AccordionDetails>
        <h3 className="font-bold">Ordered Items:</h3>
        <ul>
          {order.items?.map((item: OrderItemType) => {
            return <li key={item.order_item_id}>{item.product_name}</li>;
          })}
        </ul>
        <div className="flex justify-between w-full">
          <div className="font-bold">Order status: {order.status}</div>
          <div className="font-bold">Total: ${order.total}</div>
        </div>
      </AccordionDetails>
    </Accordion>
  );
};
