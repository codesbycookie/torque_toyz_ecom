import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "@/core/contexts/api.context";
import {
  FeaturedProducts,
  ProductGrid,
} from "@/modules/product/product.components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Mail,
  Package,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { products } = useApi();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    products.getFeatured(8);
  }, []);

  const handleAddToCart = (product) => {
    console.log("Add to cart:", product.name);
    // later: cart.addItem(product)
  };

  const handleToggleWishlist = (product) => {
    console.log("Toggle wishlist:", product.name);
    // later: wishlist.toggle(product)
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    // later: call API
    toast.success("Thanks for subscribing!");
    setEmail("");
  };

  // Temporary static categories (replace when Category module is ready)
  const categories = [
    { name: "Electronics", slug: "electronics", count: 24 },
    { name: "Fashion", slug: "fashion", count: 48 },
    { name: "Home & Living", slug: "home-living", count: 32 },
    { name: "Beauty", slug: "beauty", count: 19 },
    { name: "Sports", slug: "sports", count: 15 },
    { name: "Books", slug: "books", count: 27 },
  ];

  return (
    <div className="min-h-screen">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-muted/40 border-b">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <Badge variant="secondary" className="mb-2">
              New Season Collection
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Discover products you love
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
              Shop the latest collection with fast delivery and exclusive deals.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button size="lg" onClick={() => navigate("/products")}>
                Shop Now
                <ArrowRight className="ml-2 size-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/categories")}
              >
                Browse Categories
              </Button>
            </div>
          </div>

          <div className="flex-1 hidden md:block">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border" />
          </div>
        </div>
      </section>

      {/* ─── Trust Badges ─────────────────────────────────────── */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              {
                icon: Truck,
                label: "Free Shipping",
                desc: "On orders over ₹999",
              },
              {
                icon: ShieldCheck,
                label: "Secure Payment",
                desc: "100% protected",
              },
              {
                icon: RotateCcw,
                label: "Easy Returns",
                desc: "30-day return policy",
              },
              {
                icon: Package,
                label: "Quality Assured",
                desc: "Verified products",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Shop by Category
          </h2>
          <Button variant="ghost" onClick={() => navigate("/categories")}>
            View all
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/category/${cat.slug}`}>
              <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/40">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted/60 flex items-center justify-center">
                    <Package className="size-10 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="font-medium text-sm line-clamp-1">
                      {cat.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cat.count} items
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── New Arrivals ─────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12 md:py-16 border-t">
        <FeaturedProducts
          title="New Arrivals"
          products={products.state}
          loading={products.loading.getAll}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlistedIds={[]}
          viewAllLink="/products?sort=latest"
        />
      </section>

      {/* ─── Best Sellers ─────────────────────────────────────── */}
      <section className="bg-muted/30 border-y">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Best Sellers
            </h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/products?sort=popular")}
            >
              View all
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>

          <ProductGrid
            products={products.state.slice(0, 4)}
            loading={products.loading.getAll}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistedIds={[]}
          />
        </div>
      </section>

      {/* ─── Newsletter ───────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground px-6 py-12 md:px-12 md:py-16">
          <div className="relative z-10 max-w-xl mx-auto text-center space-y-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary-foreground/10 mx-auto">
              <Mail className="size-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Stay in the loop
            </h2>
            <p className="text-primary-foreground/80">
              Subscribe to our newsletter and get 10% off your first order plus
              early access to new drops.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/30"
              />
              <Button type="submit" variant="secondary" className="shrink-0">
                Subscribe
              </Button>
            </form>
          </div>

          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary-foreground/5" />
          <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-primary-foreground/5" />
        </div>
      </section>
    </div>
  );
}