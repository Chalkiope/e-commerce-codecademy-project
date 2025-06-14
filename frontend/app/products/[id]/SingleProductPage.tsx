"use client";
import { ProductType } from "../ProductPage";
import { Button, Card } from "@mui/material";

type Props = {
  product: ProductType;
};

const SingleProductPage = ({ product }: Props) => {
  const handleAddToCart = async () => {
    console.log(product.id);
    // const response = await addItemToCart();
    // return response.json();
  };

  if (!product) return <p>Loading...</p>;

  console.log(product);
  return (
    <div>
      <Card>
        <div className="flex flex-col p-4">
          <h1 className="text-2xl mb-4">{product.name}</h1>
          <p>{product.description}</p>
          <div className="flex justify-between my-2">
            <span>{product.stock_available} available</span>
            <span>{product.price}$</span>
          </div>
          <Button variant="contained" color="primary" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </Card>
    </div>
  );
};
export default SingleProductPage;
