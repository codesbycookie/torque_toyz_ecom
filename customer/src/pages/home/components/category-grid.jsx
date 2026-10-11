import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Car,
  Truck,
  Mountain,
  Trophy,
  Wrench,
  BatteryCharging,
  Gamepad2,
  Plane,
  Package,
} from "lucide-react";

/* Pick an icon from the category name/slug. Falls back to a generic box. */
const ICON_RULES = [
  [/sport|car|drift|racer/, Car],
  [/monster|truck/, Truck],
  [/off.?road|crawler|buggy|terrain/, Mountain],
  [/die.?cast|model|collect/, Trophy],
  [/part|wheel|tyre|tire|upgrade|accessor/, Wrench],
  [/battery|charger/, BatteryCharging],
  [/remote|controller|radio/, Gamepad2],
  [/drone|plane|air|heli/, Plane],
];

const getIcon = (cat) => {
  const key = `${cat.slug || ""} ${cat.name || ""}`.toLowerCase();
  const match = ICON_RULES.find(([re]) => re.test(key));
  return match ? match[1] : Package;
};

const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);

/* Build a unique category list from the products' `category` field.
   Needs the category populated: { _id, name, slug }. A plain name string
   also works. A bare ObjectId has no label, so it is skipped. */
const categoriesFromProducts = (products) => {
  const map = new Map();
  for (const p of products) {
    if (!p || p.deleted === true || p.active === false) continue;
    const c = p.category;
    if (!c) continue;

    if (typeof c === "object" && c.name) {
      map.set(c._id || c.slug || c.name, c);
    } else if (typeof c === "string" && !isObjectId(c)) {
      map.set(c, { _id: c, name: c, slug: c });
    }
  }
  return [...map.values()];
};

export default function CategoryGrid({ products = [], loading = false }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const active = params.get("category") || "";

  const items = useMemo(() => {
    const real = categoriesFromProducts(products).map((c) => ({
      id: c._id || c.slug || c.name,
      label: c.name,
      icon: getIcon(c),
      image: c.image || c.icon_url,
    }));
    return [{ id: "", label: "For You", icon: Sparkles }, ...real];
  }, [products]);

  const goTo = (id) =>
    navigate(id ? `/products?category=${id}` : "/products");

  const showSkeleton = loading && products.length === 0;

  return (
    <nav
      id="categories"
      aria-label="Shop by category"
      className="bg-background border-b border-border/60"
    >
      <div className="container mx-auto px-2 sm:px-4">
        <ul
          className="flex items-start gap-1 sm:gap-3 overflow-x-auto sm:justify-center py-2 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {showSkeleton
            ? Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="shrink-0 w-[76px] sm:w-24">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="size-11 sm:size-12 rounded-xl bg-muted animate-pulse" />
                    <div className="h-3 w-12 rounded bg-muted animate-pulse" />
                  </div>
                </li>
              ))
            : items.map(({ id, label, icon: Icon, image }) => {
                const isActive = active === id;
                return (
                  <li key={id || "for-you"} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => goTo(id)}
                      aria-current={isActive ? "page" : undefined}
                      className="group flex w-[76px] sm:w-24 flex-col items-center gap-1 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <span
                        className={`flex size-11 sm:size-12 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-foreground group-hover:bg-muted"
                        }`}
                      >
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            className="size-7 object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <Icon className="size-6" strokeWidth={1.75} />
                        )}
                      </span>

                      <span
                        title={label}
                        className={`w-full truncate px-0.5 text-center text-xs sm:text-[13px] ${
                          isActive
                            ? "font-bold text-foreground"
                            : "font-medium text-foreground/80"
                        }`}
                      >
                        {label}
                      </span>

                      <span
                        className={`h-[3px] w-full rounded-full transition-colors ${
                          isActive ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
        </ul>
      </div>
    </nav>
  );
}