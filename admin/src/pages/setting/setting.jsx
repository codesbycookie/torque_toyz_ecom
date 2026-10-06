import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";
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
import { useAuth } from "@/core/contexts/auth.context";
import { useAsync } from "@/core/hooks/useAsync";
import { useClearError } from "@/core/hooks/useClearError";
import { useSubmit } from "@/core/hooks/useSubmit";
import { settingSchema } from "@/modules/setting/setting.schema";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { apiurls } from "@/core/api/api.urls";
import { putRequest } from "@/core/api/api.service";

export default function Setting() {
  const { settings } = useApi();
  const { downloadDump } = settings;
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuth();

  const form = useForm({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      site_name: "",
      support_email: "",
      low_stock_threshold: 0,
      gst_percentage: 18,
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

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    if (user && user._id) {
      try {
        const res = await putRequest(apiurls.users.edit.url(user._id), { theme: newTheme });
        setUser({ ...user, theme: newTheme });
        toast.success("Theme preference saved");
      } catch (error) {
        toast.error("Failed to save theme preference");
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage general site configuration and your preferences
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 px-6 py-6 max-w-3xl w-full space-y-0">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 items-start">
            <div className="md:col-span-1">
              <h3 className="text-base font-medium">Appearance</h3>
              <p className="text-[0.8rem] text-muted-foreground">
                Customize your UI theme preference.
              </p>
            </div>
            <div className="md:col-span-2 flex gap-4">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                onClick={() => handleThemeChange('light')}
              >
                Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                onClick={() => handleThemeChange('dark')}
              >
                Dark
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'outline'} 
                onClick={() => handleThemeChange('system')}
              >
                System
              </Button>
            </div>
          </div>

          <Separator />

          <Form {...form}>
            <form id="settings-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                name="gst_percentage"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 items-start">
                    <div className="md:col-span-1">
                      <FormLabel className="text-base">GST Percentage (%)</FormLabel>
                      <FormDescription>
                        Tax rate applied to customer orders at checkout.
                      </FormDescription>
                    </div>
                    <div className="md:col-span-2">
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="18" {...field} />
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

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 items-start">
                <div className="md:col-span-1">
                  <h3 className="text-base font-medium">Database Backup</h3>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Download a full dump of the current database.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Button type="button" variant="outline" onClick={downloadDump}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Backup
                  </Button>
                </div>
              </div>

              {ErrorAlert}
            </form>
          </Form>
        </div>

        <div className="border-t px-6 py-4 flex justify-end sticky bottom-0 bg-background">
          <Button type="submit" form="settings-form" loading={loading} loadingText="Saving..">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}