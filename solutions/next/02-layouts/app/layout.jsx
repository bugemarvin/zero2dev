import Link from "next/link";

export const metadata = { title: "My site" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Home</Link> <Link href="/blog">Blog</Link> <Link href="/about">About</Link>
        </nav>
        <main>{children}</main>
        <footer>My site</footer>
      </body>
    </html>
  );
}
