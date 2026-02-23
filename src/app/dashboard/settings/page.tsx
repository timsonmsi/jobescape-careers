"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Bell, Mail, User, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "JobEscape",
    supportEmail: "support@jobescape.com",
    notificationsEnabled: true,
    aiScoringEnabled: true,
    defaultJobStatus: "DRAFT",
  });

  const handleSave = () => {
    // In production, save to database
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Company Settings */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Company Settings
            </CardTitle>
            <CardDescription>Basic company information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) =>
                  setSettings({ ...settings, supportEmail: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notifications
            </CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-gray-600">
                  Send email notifications for candidate updates
                </div>
              </div>
              <Select
                value={settings.notificationsEnabled ? "true" : "false"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notificationsEnabled: e.target.value === "true",
                  })
                }
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
              AI Features
            </CardTitle>
            <CardDescription>Configure AI-powered features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">AI Candidate Scoring</div>
                <div className="text-sm text-gray-600">
                  Automatically score candidates based on job descriptions
                </div>
              </div>
              <Select
                value={settings.aiScoringEnabled ? "true" : "false"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    aiScoringEnabled: e.target.value === "true",
                  })
                }
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Badge variant="outline" className="bg-blue-100">
                  API Key
                </Badge>
                <span>
                  {process.env.NEXT_PUBLIC_ANTHROPIC_KEY
                    ? "Anthropic API key configured"
                    : "No API key configured"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Default Settings */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Defaults
            </CardTitle>
            <CardDescription>Default settings for new items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultJobStatus">Default Job Status</Label>
              <Select
                id="defaultJobStatus"
                value={settings.defaultJobStatus}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultJobStatus: e.target.value,
                  })
                }
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
