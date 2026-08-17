import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bell, CheckCircle2, Settings, User } from "lucide-react";

export default function App() {
  const [notifications, setNotifications] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              shadcn/ui components
            </h1>
            <p className="text-sm text-slate-500">
              A quick reference sheet — swap or trim what you don't need.
            </p>
          </div>
          <Avatar>
            <AvatarImage src="" alt="User avatar" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Profile tab */}
          <TabsContent value="profile" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile details</CardTitle>
                <CardDescription>
                  Basic form controls — Input, Label, Select, Textarea.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Vicky"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineer">Engineer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="pm">Product Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="A short bio..." rows={3} />
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <div className="flex gap-2">
                  <Badge variant="secondary">Draft</Badge>
                  {name && <Badge>{name}</Badge>}
                </div>
                <Button>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Toggle controls and secondary actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-slate-500" />
                    <Label htmlFor="notifications">Notifications</Label>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-slate-500" />
                    <Label>Auto-sync</Label>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive">Reset all</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Activity tab */}
          <TabsContent value="activity" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>
                  Progress bar and button variants.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Weekly goal</span>
                    <span>68%</span>
                  </div>
                  <Progress value={68} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Default</Button>
                  <Button size="sm" variant="secondary">
                    Secondary
                  </Button>
                  <Button size="sm" variant="outline">
                    Outline
                  </Button>
                  <Button size="sm" variant="ghost">
                    Ghost
                  </Button>
                  <Button size="sm" variant="link">
                    Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}