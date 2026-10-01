import Link from "next/link";
import { getProducts } from "../../lib/products.js";

export default function ProductsPage() {
  return (
    <ul>
      {getProducts().map((product) => (
        <li key={product.id}>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </li>
      ))}
    </ul>
  );
}
