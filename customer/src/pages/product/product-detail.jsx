import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { slug } = useParams();
  
  return (
    <div>
      <h1>Product Detail</h1>
      <p>Slug: {slug}</p>
      {/* TODO: Implement product detail view */}
    </div>
  );
}
