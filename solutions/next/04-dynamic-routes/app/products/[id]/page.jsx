import { notFound } from "next/navigation";
import { getProduct } from "../../../lib/products.js";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = getProduct(Number(id));
  if (!product) {
    notFound();
  }
  return (
    <main>
      <h1>{product.name}</h1>
      <p>{`Price: ${product.price} EUR`}</p>
    </main>
  );
}
