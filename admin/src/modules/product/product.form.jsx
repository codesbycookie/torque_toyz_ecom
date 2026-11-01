"use client";

import { useEffect, useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImagePlusIcon, X, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

function ImagePreview({ image, onRemove }) {
  const [isLoading, setIsLoading] = useState(true);
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (typeof image === "string") {
      setSrc(image);
      return;
    }
    
    if (image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setSrc(objectUrl);
      
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [image]);

  if (!src) return null;

  return (
    <div className="relative size-20 rounded-md border overflow-hidden bg-muted flex items-center justify-center">
      {isLoading && (
        <Loader2 className="size-4 animate-spin text-muted-foreground absolute" />
      )}
      <img 
        src={src} 
        alt="" 
        onLoad={() => setIsLoading(false)}
        className={`size-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black/85 transition-colors z-10"
        aria-label="Remove image"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

export function BadgesInput({ value = [], onChange }) {
  const [inputVal, setInputVal] = useState("");

  const addBadge = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputVal("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addBadge();
    }
  };

  const removeBadge = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Add badge (e.g. Hot, Sale, Limited)"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBadge}
          disabled={!inputVal.trim()}
        >
          Add
        </Button>
      </div>
      {value && value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {value.map((badge, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="gap-1 pr-1 text-xs font-normal"
            >
              <span>{badge}</span>
              <button
                type="button"
                onClick={() => removeBadge(idx)}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                aria-label={`Remove badge ${badge}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductForm({ form, categories = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column: Core Info & Images */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter description (optional)"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => {
            const images = field.value || [];

            const removeAt = (index) => {
              const next = images.filter((_, i) => i !== index);
              form.clearErrors("images");
              field.onChange(next);
            };

            return (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Images</FormLabel>
                  <span className="text-xs text-muted-foreground">
                    {images.length} of 5 selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {images.map((image, index) => (
                    <ImagePreview
                      key={
                        image instanceof File
                          ? `${image.name}-${image.lastModified}-${index}`
                          : `${image}-${index}`
                      }
                      image={image}
                      onRemove={() => removeAt(index)}
                    />
                  ))}

                  {images.length < 5 && (
                    <label
                      htmlFor="product-image-input"
                      className="flex size-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground cursor-pointer hover:border-muted-foreground/50 hover:text-foreground transition-colors"
                    >
                      <ImagePlusIcon className="size-4" />
                      <span className="text-[10px]">Add</span>
                    </label>
                  )}
                </div>

                <FormControl>
                  <Input
                    id="product-image-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const selectedFiles = Array.from(event.target.files || []);
                      const combined = [...images, ...selectedFiles];

                      if (combined.length > 5) {
                        form.setError("images", {
                          type: "manual",
                          message: "You can upload up to 5 images",
                        });
                        event.target.value = "";
                        return;
                      }

                      form.clearErrors("images");
                      field.onChange(combined);
                      event.target.value = "";
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>

      {/* Right Column: Inventory, Pricing & Merchandising */}
      <div className="space-y-4">
        {/* Stock & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ui.actual_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-6"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.setValue("price", Number(e.target.value) || 0);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ui.slash_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slash Price (MRP)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-6"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Badges */}
        <FormField
          control={form.control}
          name="ui.badges"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Badges</FormLabel>
              <FormControl>
                <BadgesInput
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trending switch */}
        <FormField
          control={form.control}
          name="ui.is_trending"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-sm">Trending Product</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Feature this item in the trending showcase.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Active switch */}
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-sm">Active</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Visible to customers when enabled.
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
