"use client";
import { useState } from "react";
import { CartItem } from "./CartItem";
import { deleteCartItem, updateCartItem } from "@/api/cart";
import { Button } from "@mui/material";

export interface CartType {
  id: number;
  product_id: number;
  cart_id: number;
  amount: number;
  name: string;
  stock_available: number;
  description: string;
  price: number;
}

export const CartPage = ({ cartData }: { cartData: CartType[] }) => {
  const [cart, setCart] = useState<CartType[] | null>(cartData || []);

  const handleUpdateCartItem = async (product_id: number, amount: number) => {
    const response = await updateCartItem(product_id, amount);
    if (response) {
      console.log("Item added to cart successfully");
      setCart(response.cart);
    } else {
      console.error("Failed to add item to cart");
    }
    console.log(response.cart);
  };

  const handleDeleteCartItem = async (product_id: number) => {
    const response = await deleteCartItem(product_id);
    if (response) {
      console.log("Item deleted from cart");
      setCart(response.cart);
    } else {
      console.error("Failed to delete item");
    }
    console.log(response.cart);
  };
  //   console.log(cart);
  if (!cart || cart.length === 0) return <>Your cart is empty</>;
  return (
    <div>
      <h1>Shopping Cart</h1>
      <div className="flex flex-col gap-4">
        {cart?.map((cartItem: CartType) => {
          return (
            <div key={cartItem.id}>
              <CartItem
                item={cartItem}
                onUpdate={handleUpdateCartItem}
                onDelete={handleDeleteCartItem}
              />
            </div>
          );
        })}
      </div>
      <div className="my-4">
        <Button href="/checkout" variant="contained">
          Checkout
        </Button>
      </div>
    </div>
  );
};
