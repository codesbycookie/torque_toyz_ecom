import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/core/contexts/auth.context";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { user, setUser, changePassword } = useAuth();
  const api = useApi();
  const { loadOnly, loading: isSavingProfile } = useLoader();
  const { loadOnly: loadOnlyPassword, loading: isUpdatingPassword } = useLoader();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({ ...prev, [id]: value }));
  };

  const saveProfile = async () => {
    if (!user?._id) return;
    try {
      const updated = await loadOnly(() => api.users.update ? api.users.update(user._id, {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
      }, { __options: { toast: true, success: "Profile updated successfully" } }) : api.users.edit(user._id, {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
      }, { __options: { toast: true, success: "Profile updated successfully" } }));
      
      setUser({ ...user, ...updated });
    } catch (err) {
      console.error(err);
    }
  };

  const updatePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    
    try {
      await loadOnlyPassword(() => changePassword(passwordData.current, passwordData.new));
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-in fade-in zoom-in duration-500">
      <h1 className="text-3xl font-bold mb-6 tracking-tight">Account Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={profileData.name} onChange={handleProfileChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profileData.email} onChange={handleProfileChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={profileData.phone} onChange={handleProfileChange} />
              </div>
              <Button className="mt-4" onClick={saveProfile} disabled={isSavingProfile}>
                {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" value={passwordData.current} onChange={handlePasswordChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <Input id="new" type="password" value={passwordData.new} onChange={handlePasswordChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input id="confirm" type="password" value={passwordData.confirm} onChange={handlePasswordChange} />
              </div>
              <Button className="mt-4" onClick={updatePassword} disabled={isUpdatingPassword}>
                {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Order Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about your order status.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Promotional Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about new products and offers.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive text messages for delivery updates.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
