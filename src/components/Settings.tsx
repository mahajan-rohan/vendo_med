"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">Enable Notifications</Label>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="darkMode">Dark Mode</Label>
          <Switch
            id="darkMode"
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
        </div>
      </div>
      <Button>Save Changes</Button>
    </div>
  );
}
