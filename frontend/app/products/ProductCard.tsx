"use client";
import { useState } from "react";
import { ProductType } from "./ProductPage";
import { Button, Card, TextField } from "@mui/material";
import { addToCart } from "@/api/cart";

const ProductCard = ({
  id,
  name,
  stock_available,
  description,
  price,
}: ProductType) => {
  const [amount, setAmount] = useState<number>(1);

  const handleAddToCart = async () => {
    const response = await addToCart(id, amount);
    if (response) {
      console.log("Item added to cart successfully");
    } else {
      console.error("Failed to add item to cart");
    }
    console.log(id);
  };

  return (
    <Card>
      <div className="product-tile flex flex-col p-4">
        <h1 className="text-2xl mb-4">{name}</h1>
        <p>{description}</p>
        <div className="flex justify-between my-2">
          <span>{stock_available} available</span>
          <span>{price}$</span>
        </div>
        <div className="flex justify-between gap-4">
          <Button variant="outlined" href={`/products/${id}`}>
            View Product
          </Button>
          <TextField
            id="outlined-number"
            label="Number"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          <Button variant="contained" color="primary" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
};
export default ProductCard;
