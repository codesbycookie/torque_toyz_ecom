"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/core/contexts/auth.context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MapPin,
  ShoppingCart,
  Menu,
  Star,
  Heart,
  ArrowUp,
  Flame,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  User,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Dummy data — matches the shape the real endpoint returns.
   Swap the fetch block below for:
     const { home } = useApi();
     const { loadHomeData, state: data, loading, error } = home;
     useEffect(() => { loadHomeData(); }, []);
───────────────────────────────────────────────────────── */
const DUMMY_HOME_DATA = {
  banners: [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=1600&q=80",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1621361365424-06f0e1eb0e70?w=1600&q=80",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=1600&q=80",
    },
  ],
  categoryCards: [
    {
      id: "c1",
      title: "Restock your garage",
      cta: "See all deals",
      items: [
        {
          label: "Batteries",
          image:
            "https://images.unsplash.com/photo-1620825141326-8d1e0b0e0f6a?w=300&q=80",
        },
        {
          label: "Tires",
          image:
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&q=80",
        },
        {
          label: "Chassis parts",
          image:
            "https://images.unsplash.com/photo-1587613864411-4b78ffc7b7fd?w=300&q=80",
        },
        {
          label: "Tools",
          image:
            "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300&q=80",
        },
      ],
    },
    {
      id: "c2",
      title: "Up to 40% off | Nitro & electric kits",
      cta: "Shop the sale",
      items: [
        {
          label: "Nitro buggies",
          image:
            "https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=300&q=80",
        },
        {
          label: "Truggies",
          image:
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&q=80",
        },
        {
          label: "Drift cars",
          image:
            "https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=300&q=80",
        },
        {
          label: "Crawlers",
          image:
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&q=80",
        },
      ],
    },
    {
      id: "c3",
      title: "New arrivals in radio gear",
      cta: "Discover more",
      items: [
        {
          label: "Transmitters",
          image:
            "https://images.unsplash.com/photo-1517816428104-797678c7cf0c?w=300&q=80",
        },
        {
          label: "Receivers",
          image:
            "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=300&q=80",
        },
        {
          label: "Servos",
          image:
            "https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?w=300&q=80",
        },
        {
          label: "ESCs",
          image:
            "https://images.unsplash.com/photo-1518987048-93e29699e79a?w=300&q=80",
        },
      ],
    },
    {
      id: "c4",
      title: "Top rated by racers",
      cta: "View top rated",
      items: [
        {
          label: "Monster trucks",
          image:
            "https://images.unsplash.com/photo-1621361365424-06f0e1eb0e70?w=300&q=80",
        },
        {
          label: "On-road cars",
          image:
            "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=300&q=80",
        },
        {
          label: "Charging stations",
          image:
            "https://images.unsplash.com/photo-1620765497443-310c418a6ca9?w=300&q=80",
        },
        {
          label: "Carry cases",
          image:
            "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&q=80",
        },
      ],
    },
  ],
  deals: [
    {
      id: "d1",
      name: "TT-7 Nitro Buggy 1/8",
      price: 189.99,
      originalPrice: 269.99,
      rating: 4.6,
      reviews: 812,
      image:
        "https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=500&q=80",
    },
    {
      id: "d2",
      name: "RapidCharge 4S LiPo 5200mAh",
      price: 39.99,
      originalPrice: 59.99,
      rating: 4.8,
      reviews: 1204,
      image:
        "https://images.unsplash.com/photo-1620825141326-8d1e0b0e0f6a?w=500&q=80",
    },
    {
      id: "d3",
      name: "Drift Master GT 1/10",
      price: 129.0,
      originalPrice: 179.0,
      rating: 4.4,
      reviews: 356,
      image:
        "https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=500&q=80",
    },
    {
      id: "d4",
      name: "2.4GHz Pro Transmitter",
      price: 74.5,
      originalPrice: 99.0,
      rating: 4.7,
      reviews: 640,
      image:
        "https://images.unsplash.com/photo-1517816428104-797678c7cf0c?w=500&q=80",
    },
    {
      id: "d5",
      name: "All-Terrain Tire Set (4pk)",
      price: 19.99,
      originalPrice: 29.99,
      rating: 4.5,
      reviews: 288,
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&q=80",
    },
    {
      id: "d6",
      name: "Aluminum Chassis Upgrade Kit",
      price: 64.99,
      originalPrice: 89.99,
      rating: 4.6,
      reviews: 98,
      image:
        "https://images.unsplash.com/photo-1587613864411-4b78ffc7b7fd?w=500&q=80",
    },
  ],
  topPicks: [
    {
      id: "t1",
      name: "Storm Chaser 4x4 Crawler",
      price: 219.99,
      rating: 4.9,
      reviews: 512,
      image:
        "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=500&q=80",
      badge: "Best seller",
    },
    {
      id: "t2",
      name: "Micro Racer 1/24 Set of 2",
      price: 49.99,
      rating: 4.3,
      reviews: 190,
      image:
        "https://images.unsplash.com/photo-1558980664-10e7170b5df9?w=500&q=80",
    },
    {
      id: "t3",
      name: "Brushless Motor 3660 3300KV",
      price: 54.0,
      rating: 4.7,
      reviews: 421,
      image:
        "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=500&q=80",
    },
    {
      id: "t4",
      name: "Track-Ready Carry Case",
      price: 34.99,
      rating: 4.5,
      reviews: 133,
      image:
        "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&q=80",
    },
    {
      id: "t5",
      name: "Pro Pit Toolkit, 21pc",
      price: 44.99,
      rating: 4.8,
      reviews: 267,
      image:
        "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&q=80",
      badge: "New",
    },
    {
      id: "t6",
      name: "Waterproof ESC 60A",
      price: 29.99,
      rating: 4.4,
      reviews: 209,
      image:
        "https://images.unsplash.com/photo-1518987048-93e29699e79a?w=500&q=80",
    },
  ],
};

const NAV_LINKS = [
  "Today's deals",
  "RC cars",
  "Monster trucks",
  "Drift kits",
  "Batteries & chargers",
  "Radio gear",
  "New arrivals",
  "Customer service",
];

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={
            i <= Math.round(rating)
              ? "torque-red fill-current"
              : "text-muted-foreground/30"
          }
        />
      ))}
    </div>
  );
}

function ProductCard({ product, discount }) {
  return (
    <Card className="group relative w-[190px] shrink-0 gap-0 py-3 sm:w-[210px]">
      <CardContent className="flex flex-col px-3">
        {discount ? (
          <Badge className="torque-red-bg absolute left-3 top-3 z-10 text-white">
            {discount}% off
          </Badge>
        ) : (
          product.badge && (
            <Badge variant="secondary" className="absolute left-3 top-3 z-10">
              {product.badge}
            </Badge>
          )
        )}
        <Button
          size="icon"
          variant="ghost"
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 z-10 h-7 w-7 rounded-full bg-background/80"
        >
          <Heart size={14} />
        </Button>

        <div className="mb-3 aspect-square w-full overflow-hidden rounded-md bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {product.name}
        </p>

        <div className="mt-1.5 flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-xs text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <Button className="torque-button mt-3 h-8 gap-1.5 text-xs font-semibold">
          <ShoppingCart size={13} />
          Add to cart
        </Button>
      </CardContent>
    </Card>
  );
}

function ProductRow({ title, products, discount, viewAllHref = "#" }) {
  return (
    <section className="mb-8">
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <a
            href={viewAllHref}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            See more
          </a>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} discount={discount} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>
    </section>
  );
}

function CategoryCard({ card }) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-base font-semibold leading-snug">
        {card.title}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {card.items.map((item) => (
          <button key={item.label} className="group text-left">
            <div className="mb-1.5 aspect-square w-full overflow-hidden rounded-md bg-muted">
              <img
                src={item.image}
                alt={item.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </button>
        ))}
      </div>
      <a
        href="#"
        className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
      >
        {card.cta}
      </a>
    </Card>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="h-64 w-full animate-pulse rounded-xl bg-muted sm:h-80" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-64 w-[200px] shrink-0 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    </div>
  );
}

function SiteHeader({ cartCount = 3 }) {
  const { user } = useAuth();
  return (
    <div className="sticky top-0 z-30">
      {/* Top bar */}
      <div className="torque-black-bg text-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-2 sm:px-4">
          <Sheet>
            <SheetTrigger className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10">
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Browse Torque Toyzz</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col px-4">
                {NAV_LINKS.map((link) => (
                  <a key={link} href="#" className="border-b py-3 text-sm">
                    {link}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <a href="#" className="flex items-center gap-2 shrink-0">
            <span className="h-7 w-7 rounded-full torque-red-bg" />
            <span className="hidden sm:block text-lg font-bold tracking-tight">
              TORQUE TOYZZ
            </span>
          </a>

          <button className="hidden lg:flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-white/10">
            <MapPin size={16} />
            <span className="flex flex-col items-start leading-tight">
              <span className="text-white/60">Deliver to</span>
              <span className="font-semibold">Bengaluru 560001</span>
            </span>
          </button>

          <div className="flex flex-1 items-stretch">
            <Select defaultValue="all">
              <SelectTrigger className="hidden sm:flex w-28 rounded-r-none border-r-0 bg-muted text-foreground">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="cars">RC cars</SelectItem>
                <SelectItem value="trucks">Trucks</SelectItem>
                <SelectItem value="parts">Parts</SelectItem>
                <SelectItem value="radio">Radio gear</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Search Torque Toyzz"
              className="rounded-none sm:rounded-l-none bg-background text-foreground h-9"
            />
            <Button className="torque-red-bg h-9 rounded-l-none px-3 hover:bg-[#b92d35]">
              <Search size={18} className="text-white" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="hidden sm:flex flex-col items-start rounded-md py-1 px-2 text-white hover:bg-white/10">
              <span className="text-xs text-white/60">
                Hello, {user?.name?.split(" ")[0] || "sign in"}
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold">
                Account & lists
                <ChevronDown size={13} />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Your account</DropdownMenuItem>
              <DropdownMenuItem>Your orders</DropdownMenuItem>
              <DropdownMenuItem>Your wishlist</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden text-white hover:bg-white/10"
          >
            <User size={20} />
          </Button>

          <Button
            variant="ghost"
            className="relative h-auto gap-1.5 px-2 py-1 text-white hover:bg-white/10"
          >
            <ShoppingCart size={22} />
            <Badge className="torque-red-bg absolute -top-1 left-4 h-4 min-w-4 justify-center rounded-full p-0 text-[10px]">
              {cartCount}
            </Badge>
            <span className="hidden sm:inline text-sm font-semibold">Cart</span>
          </Button>
        </div>
      </div>

      {/* Secondary bar */}
      <div className="torque-charcoal-bg text-white">
        <ScrollArea className="mx-auto max-w-[1500px] whitespace-nowrap">
          <div className="flex items-center gap-4 px-4 py-2 text-sm">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="shrink-0 text-white/80 hover:text-white"
              >
                {link}
              </a>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="torque-black-bg mt-10 text-white">
      
      <Separator className="bg-white/10" />
      <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
        <div>
          <p className="mb-3 text-sm font-semibold">Get to know us</p>
          <ul className="space-y-2 text-xs text-white/60">
            <li>About Torque Toyzz</li>
            <li>Careers</li>
            <li>Press releases</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Connect with us</p>
          <ul className="space-y-2 text-xs text-white/60">
            <li>Instagram</li>
            <li>YouTube</li>
            <li>Discord</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Make money with us</p>
          <ul className="space-y-2 text-xs text-white/60">
            <li>Sell on Torque Toyzz</li>
            <li>Become an affiliate</li>
            <li>Advertise your products</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Let us help you</p>
          <ul className="space-y-2 text-xs text-white/60">
            <li>Track your order</li>
            <li>Returns & replacements</li>
            <li>Help center</li>
          </ul>
        </div>
      </div>
      <Separator className="bg-white/10" />
      <p className="px-6 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Torque Toyzz. All rights reserved.
      </p>
    </footer>
  );
}

export default function Home() {
  // Mirrors the Dashboard's data-fetching pattern with dummy data for now.
  // Swap this block for:
  //   const { home } = useApi();
  //   const { loadHomeData, state: data, loading, error } = home;
  //   useEffect(() => { loadHomeData(); }, []);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      if (!cancelled) {
        setData(DUMMY_HOME_DATA);
        setLoading(false);
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 text-red-500">
        Error loading store: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* <SiteHeader /> */}

      {loading ? (
        <HomeSkeleton />
      ) : (
        <main className="mx-auto max-w-[1500px] px-3 pb-16 pt-4 sm:px-4">
          {/* Hero carousel */}
          <Carousel className="mb-6">
            <CarouselContent>
              {data.banners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div className="h-56 w-full overflow-hidden rounded-xl sm:h-80">
                    <img
                      src={banner.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-3" />
            <CarouselNext className="right-3" />
          </Carousel>

          {/* Category cards, overlapping the hero like amazon.in */}
          <section className="-mt-16 mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.categoryCards.map((card) => (
              <CategoryCard key={card.id} card={card} />
            ))}
          </section>

          {/* Deals of the day */}
          <section className="mb-8">
            <Card className="p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="torque-red" />
                  <h2 className="text-lg font-semibold tracking-tight">
                    Deals of the day
                  </h2>
                </div>
                <a
                  href="#"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  See all deals
                </a>
              </div>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-3">
                  {data.deals.map((p) => {
                    const discount = Math.round(
                      ((p.originalPrice - p.price) / p.originalPrice) * 100,
                    );
                    return (
                      <ProductCard key={p.id} product={p} discount={discount} />
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </Card>
          </section>

          <ProductRow title="Top picks for you" products={data.topPicks} />

          {/* Trust strip */}
          <Card className="mb-8 p-0 overflow-hidden">
            <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Free RC shipping</p>
                  <p className="text-xs text-muted-foreground">
                    On orders over $75
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Secure checkout</p>
                  <p className="text-xs text-muted-foreground">
                    Payments fully encrypted
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">30-day returns</p>
                  <p className="text-xs text-muted-foreground">
                    On unused parts and kits
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </main>
      )}

      <SiteFooter />

      
    </div>
  );
}
