import { getProducts } from "../lib/products.js";
import LikeButton from "./like-button.jsx";

export default async function Page() {
  const products = await getProducts();
  return (
    <main>
      <h1>Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} <LikeButton name={product.name} />
          </li>
        ))}
      </ul>
    </main>
  );
}
