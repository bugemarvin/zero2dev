export default function BlogLayout({ children }) {
  return (
    <div>
      <aside>Blog sidebar</aside>
      {children}
    </div>
  );
}
