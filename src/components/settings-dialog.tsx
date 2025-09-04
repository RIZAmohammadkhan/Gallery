"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Save,
  Bot,
  Info,
  Trash2,
  AlertTriangle,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/lib/settings-context";
import { AppSettings } from "@/lib/settings";
import { signOut } from "next-auth/react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ isOpen, onOpenChange }: SettingsDialogProps) {
  const { settings: contextSettings, settingsManager } = useSettings();
  const [settings, setSettings] = useState<AppSettings>(contextSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsManager.updateSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Your settings have been successfully updated.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSettings(contextSettings);
    setDeleteConfirmation("");
    onOpenChange(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });

      // Sign out and redirect to homepage
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeleteConfirmation("");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className={`${
          isMobile ? "max-w-[95vw] w-full h-[90vh] overflow-hidden" : "sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
        }`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Settings
            </DialogTitle>
            <DialogDescription>
              Configure your AI Gallery application preferences.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="api" className="w-full">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
              <TabsTrigger 
                value="api" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-1 gap-2"
              >
                <Bot className="h-4 w-4" />
                {isMobile ? "API" : "API Configuration"}
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-1 gap-2"
              >
                <User className="h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api" className={`space-y-6 mt-4 ${isMobile ? "overflow-y-auto max-h-[65vh]" : ""}`}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Gemini API Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your Google Gemini AI API key for image analysis and processing.
                  </CardDescription>
                </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gemini-api-key">Gemini API Key</Label>
                      <div className="relative">
                        <Input
                          id="gemini-api-key"
                          type={showApiKey ? "text" : "password"}
                          placeholder="Enter your Gemini API key..."
                          value={settings.geminiApiKey}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            geminiApiKey: e.target.value 
                          }))}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>Get your API key from the <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline"
                          >
                            Google AI Studio
                          </a>.</p>
                          <p className="mt-1">This key is used for AI-powered image analysis, categorization, and metadata generation.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className={`space-y-6 mt-4 ${isMobile ? "overflow-y-auto max-h-[65vh]" : ""}`}>
                <Card className="border-destructive/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <Trash2 className="h-5 w-5" />
                      Delete Account
                    </CardTitle>
                    <CardDescription>
                      Permanently delete your account and all associated data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="border-destructive/50 bg-destructive/5">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-sm">
                        <strong>Warning: This action cannot be undone.</strong>
                        <br />
                        Deleting your account will permanently remove:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>All your uploaded images and photos</li>
                          <li>All shared galleries and links</li>
                          <li>All folders and image metadata</li>
                          <li>Your account information and login access</li>
                          <li>All settings and preferences</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="pt-4">
                      <Button
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className={`${isMobile ? "w-full" : ""} gap-2`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete My Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
          </Tabs>

          <Separator />
          
          <div className={`flex gap-3 ${isMobile ? "flex-col" : "justify-end"}`}>
            <Button variant="outline" onClick={handleCancel} className={isMobile ? "w-full" : ""}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className={isMobile ? "w-full" : ""}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Deletion Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className={isMobile ? "max-w-[90vw] w-full" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Forever?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>This will permanently delete your account and cannot be undone.</p>
              
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium text-destructive mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>All {isMobile ? "" : "your uploaded "}images and photos</li>
                  <li>All shared galleries and links</li>
                  <li>All folders and metadata</li>
                  <li>Your login and account access</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                  To confirm, type <span className="font-mono bg-muted px-1 rounded">DELETE</span> below:
                </Label>
                <Input
                  id="delete-confirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="font-mono"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteConfirmation("");
                setIsDeleteDialogOpen(false);
              }}
              className={isMobile ? "w-full" : ""}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "DELETE" || isDeleting}
              className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${
                isMobile ? "w-full" : ""
              }`}
            >
              {isDeleting ? (
                <>Deleting Account...</>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account Forever
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}