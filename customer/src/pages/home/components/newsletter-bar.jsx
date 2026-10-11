import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewsletterBar({ onNewsletterSubmit }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onNewsletterSubmit?.(email);
    setEmail("");
  };

  return (
    <section className="bg-[#1b1718] text-white py-10 md:py-14 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left copy */}
          <div className="space-y-2 text-center lg:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              PADDOCK BULLETIN
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Get 10% off your first race order
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Telemetry insights, spare factory drops, and championship event
              announcements direct to your inbox.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto min-w-[320px] max-w-md"
          >
            <Input
              type="email"
              placeholder="Enter your phone or email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/15 text-white placeholder:text-neutral-400 focus-visible:ring-primary h-11 text-xs sm:text-sm"
              required
            />
            <Button
              type="submit"
              className="bg-primary hover:bg-secondary text-white font-bold uppercase tracking-wider text-xs px-6 h-11 shrink-0 rounded-md shadow-md shadow-primary/20"
            >
              <span>SUBSCRIBE</span>
              <Send className="size-3.5 ml-1.5" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

