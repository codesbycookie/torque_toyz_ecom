import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApi } from "@/core/contexts/api.context";
import { useAsync } from "@/core/hooks/useAsync";
import { useClearError } from "@/core/hooks/useClearError";
import { useSubmit } from "@/core/hooks/useSubmit";
import { settingSchema } from "@/modules/setting/setting.schema";
import { useEffect } from "react";

export default function Setting() {
  const { settings } = useApi();

  const form = useForm({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      site_name: "",
      support_email: "",
      low_stock_threshold: 0,
      maintenance_mode: false,
    },
  });

  // Settings no longer auto-seed — fetch once on mount.
  useEffect(() => {
    settings.fetch();
  }, []);

  // Only reset once real data has actually arrived.
  useEffect(() => {
    if (settings.values) {
      form.reset(settings.values);
    }
  }, [settings.values]);

  const { run, loading, ErrorAlert, clearError } = useAsync(settings.save);
  useClearError(form, clearError);
  const onSubmit = useSubmit({ run, form });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage general site configuration
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-y-auto"
        >
          <div className="flex-1 px-6 py-6 max-w-3xl w-full space-y-0">
            <FormField
              control={form.control}
              name="site_name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 items-start">
                  <div className="md:col-span-1">
                    <FormLabel className="text-base">Site Name</FormLabel>
                    <FormDescription>
                      The name shown across the storefront and emails.
                    </FormDescription>
                  </div>
                  <div className="md:col-span-2">
                    <FormControl>
                      <Input placeholder="Enter site name" {...field} />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="support_email"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 items-start">
                  <div className="md:col-span-1">
                    <FormLabel className="text-base">Support Email</FormLabel>
                    <FormDescription>
                      Customers see this address for help requests.
                    </FormDescription>
                  </div>
                  <div className="md:col-span-2">
                    <FormControl>
                      <Input type="email" placeholder="support@example.com" {...field} />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="low_stock_threshold"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 items-start">
                  <div className="md:col-span-1">
                    <FormLabel className="text-base">Low Stock Threshold</FormLabel>
                    <FormDescription>
                      Products at or below this stock count are flagged as low stock.
                    </FormDescription>
                  </div>
                  <div className="md:col-span-2">
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="maintenance_mode"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 items-start">
                  <div className="md:col-span-1">
                    <FormLabel className="text-base">Maintenance Mode</FormLabel>
                    <FormDescription>
                      Temporarily disable the storefront for customers.
                    </FormDescription>
                  </div>
                  <div className="md:col-span-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            {ErrorAlert}
          </div>

          <div className="border-t px-6 py-4 flex justify-end sticky bottom-0 bg-background">
            <Button type="submit" loading={loading} loadingText="Saving..">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}