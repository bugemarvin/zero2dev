import { notFound } from "next/navigation";
import { getProduct } from "../../../lib/products.js";

export default async function ProductPage({ params }) {
  return <h1>Product</h1>;
}
