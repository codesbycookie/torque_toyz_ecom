"use client";

import { useEffect, useMemo } from "react";
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
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Renders a thumbnail for either an already-stored image (string/base64 url)
// or a freshly-picked File — creating and cleaning up an object URL for Files.
function ImagePreview({ image, onRemove }) {
  const src = useMemo(() => {
    if (typeof image === "string") return image;
    if (image instanceof File) return URL.createObjectURL(image);
    return null;
  }, [image]);

  useEffect(() => {
    return () => {
      if (image instanceof File && src) URL.revokeObjectURL(src);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (!src) return null;

  return (
    <div className="relative size-20 rounded-md border overflow-hidden group">
      <img src={src} alt="Product" className="size-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove image"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

export default function ProductForm({ form, categories = [] }) {
  return (
    <>
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
              <Textarea placeholder="Enter description (optional)" {...field} />
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
              <FormLabel>Images (up to 5)</FormLabel>

              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
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
                </div>
              )}

              {images.length < 5 && (
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
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
                      event.target.value = ""; // allow re-selecting the same file later
                    }}
                  />
                </FormControl>
              )}

              <p className="text-sm text-muted-foreground">
                {images.length} of 5 images selected
              </p>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <div className="grid grid-cols-3 gap-4">
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
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
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

      <FormField
        control={form.control}
        name="active"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-3">
            <FormLabel>Active</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}