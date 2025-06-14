"use client";
import { getProducts } from "@/api/products";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export interface ProductType {
  id: number;
  name: string;
  stock_available: number;
  description: string;
  price: number;
}

const ProductPage = () => {
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    async function fetchData() {
      const productData = await getProducts();
      setProducts(productData);
    }
    fetchData();
  }, []);
  return (
    <div className="m-2 flex flex-wrap gap-8">
      {products.map((product) => {
        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            stock_available={product.stock_available}
            description={product.description}
            price={product.price}
          />
        );
      })}
    </div>
  );
};
export default ProductPage;
