import { API_ENDPOINT } from "./api";

export const getProducts = async () => {
  const response = await fetch(`${API_ENDPOINT}/products`);
  const products = await response.json();
  return products;
};

export const getProductById = async (id: number) => {
  const response = await fetch(`${API_ENDPOINT}/products/${id}`);
  const product = await response.json();
  console.log(product);
  return product;
};
