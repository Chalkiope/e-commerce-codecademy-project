"use client";
import {} from "@/api/utils/fetchWithAuth";
import { CartType } from "./CartPage";
import { Button, Card, TextField } from "@mui/material";
import { useState } from "react";

interface CartItemProps {
  item: CartType;
  onUpdate: (productId: number, newAmount: number) => void;
  onDelete: (productId: number) => void;
}

export const CartItem = ({ item, onUpdate, onDelete }: CartItemProps) => {
  const [localAmount, setLocalAmount] = useState(item.amount);

  const handleUpdateClick = () => {
    onUpdate(item.product_id, localAmount);
  };

  const handleDeleteClick = () => {
    onDelete(item.product_id);
  };

  return (
    <Card>
      <div className="product-tile flex flex-col p-4">
        <h1 className="text-2xl mb-4">{item.name}</h1>
        <p>{item.description}</p>
        <div className="flex justify-between my-2">
          <span>{item.stock_available} available</span>
          <span>{item.amount} in Cart</span>
          <span>{item.price}$</span>
        </div>
        <div className="flex justify-between gap-4">
          <Button variant="outlined" href={`/products/${item.product_id}`}>
            View Product
          </Button>
          <TextField
            id="outlined-number"
            label="Number"
            type="number"
            value={localAmount}
            onChange={(e) => setLocalAmount(Number(e.target.value))}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateClick}
          >
            Update Cart
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};
