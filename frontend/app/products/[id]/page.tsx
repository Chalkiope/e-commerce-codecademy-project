import { getProductById } from "@/api/products";
import { ProductType } from "../ProductPage";
import { notFound } from "next/navigation";
import SingleProductPage from "./SingleProductPage";

type Params = Promise<{ id: string }>;

export default async function page(props: { params: Params }) {
  const params = await props.params;
  const id = Number(params.id);
  // const product = null;
  const product: ProductType | null = await getProductById(id);
  console.log(params);

  if (!product) return notFound();
  console.log(product);

  return <SingleProductPage product={product} />;
}
