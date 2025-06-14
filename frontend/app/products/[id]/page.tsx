import { getProductById } from "@/api/products";
import { ProductType } from "../ProductPage";
import { notFound } from "next/navigation";
import SingleProductPage from "./SingleProductPage";

type Props = {
  params: { id: string };
};

export default async function page({ params }: Props) {
  const id: number = Number(params.id);
  // const product = null;
  const product: ProductType | null = await getProductById(id);
  console.log(params);

  if (!product) return notFound();
  console.log(product);

  return <SingleProductPage product={product} />;
}
