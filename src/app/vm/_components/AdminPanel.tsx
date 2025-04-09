"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, Pill, Activity } from "lucide-react";
import MedicineManager from "./MedicineManager";

export default function AdminPanel() {
  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-6">MediVend Admin Panel</h1>

      <Tabs defaultValue="medicines" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="medicines" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Medicines
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Diagnostics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="medicines">
          <MedicineManager />
        </TabsContent>

        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostics Settings</CardTitle>
              <CardDescription>
                Configure diagnostic parameters and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Diagnostic settings will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                System settings will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
