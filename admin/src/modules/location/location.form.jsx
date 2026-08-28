"use client";

import { useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export default function LocationForm({ form }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "slabs" });

  return (
    <>
      <FormField
        control={form.control}
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>State</FormLabel>
            <FormControl>
              <Input placeholder="Enter state name" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code</FormLabel>
            <FormControl>
              <Input placeholder="Enter location code (e.g. TN)" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <FormLabel>Tariff Slabs</FormLabel>
           <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => append({ min: 0, max: 0, rate: 0 })}
        >
          <Plus className="size-4" /> Add Slab
        </Button>
        </div>

        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
              <FormField
                control={form.control}
                name={`slabs.${index}.min`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Min (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`slabs.${index}.max`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Max (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`slabs.${index}.rate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Rate</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

       
      </div>
    </>
  );
}