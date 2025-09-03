import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Key, 
  Cloud, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Save,
  RotateCcw,
  FileText,
  AlertTriangle,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/lib/settings-context";
import { AppSettings } from "@/lib/settings";

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ isOpen, onOpenChange }: SettingsDialogProps) {
  const { settings: contextSettings, settingsManager } = useSettings();
  const [settings, setSettings] = useState<AppSettings>(contextSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSettings(contextSettings);
  }, [contextSettings]);

  useEffect(() => {
    const unsubscribe = settingsManager.subscribe(setSettings);
    return unsubscribe;
  }, [settingsManager]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      settingsManager.updateSettings(settings);
      
      // Update cloud storage provider
      if (settings.cloudStorage.enabled) {
        cloudStorageService.setProvider(settings.cloudStorage);
      }

      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.cloudStorage.enabled || !settings.cloudStorage.provider) {
      toast({
        title: "Configuration Required",
        description: "Please configure cloud storage first.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      cloudStorageService.setProvider(settings.cloudStorage);
      const success = await cloudStorageService.testConnection();
      
      setConnectionStatus(success ? 'success' : 'error');
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? "Successfully connected to cloud storage." 
          : "Failed to connect. Please check your credentials.",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection Error",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleReset = () => {
    setSettings(settingsManager.getSettings());
    setConnectionStatus('idle');
  };

  const handleExportSettings = () => {
    const exportData = settingsManager.exportSettings();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gallery-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings Exported",
      description: "Settings have been exported to a JSON file.",
    });
  };

  const selectedProvider = CLOUD_PROVIDERS.find(p => p.id === settings.cloudStorage.provider);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your API keys, cloud storage, and application preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Cloud Storage
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Gemini AI API Key
                </CardTitle>
                <CardDescription>
                  Required for AI-powered features like image analysis, categorization, and editing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gemini-api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="gemini-api-key"
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter your Gemini API key"
                      value={settings.geminiApiKey}
                      onChange={(e) => setSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Get your free API key from{" "}
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Google AI Studio
                    </a>
                  </AlertDescription>
                </Alert>

                {settings.geminiApiKey && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">API key configured</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cloud" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Cloud Storage Configuration
                </CardTitle>
                <CardDescription>
                  Sync your images with cloud storage providers for backup and cross-device access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cloud-enabled"
                    checked={settings.cloudStorage.enabled}
                    onCheckedChange={(enabled: boolean) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        cloudStorage: { ...prev.cloudStorage, enabled } 
                      }))
                    }
                  />
                  <Label htmlFor="cloud-enabled">Enable cloud storage</Label>
                </div>

                {settings.cloudStorage.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Cloud Provider</Label>
                      <Select
                        value={settings.cloudStorage.provider}
                        onValueChange={(provider: string) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            cloudStorage: { 
                              ...prev.cloudStorage, 
                              provider,
                              credentials: {} // Reset credentials when changing provider
                            } 
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a cloud provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLOUD_PROVIDERS.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              <div className="flex items-center gap-2">
                                <span>{provider.icon}</span>
                                <span>{provider.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedProvider && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium">{selectedProvider.name} Configuration</h4>
                        {selectedProvider.configFields.map((field) => (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            <Input
                              id={field.key}
                              type={field.type}
                              placeholder={field.placeholder}
                              value={settings.cloudStorage.credentials[field.key] || ''}
                              onChange={(e) => 
                                setSettings(prev => ({ 
                                  ...prev, 
                                  cloudStorage: { 
                                    ...prev.cloudStorage, 
                                    credentials: {
                                      ...prev.cloudStorage.credentials,
                                      [field.key]: e.target.value
                                    }
                                  } 
                                }))
                              }
                            />
                          </div>
                        ))}
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTestConnection}
                            disabled={isTestingConnection}
                          >
                            {isTestingConnection ? "Testing..." : "Test Connection"}
                          </Button>
                          
                          {connectionStatus === 'success' && (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                          
                          {connectionStatus === 'error' && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync Preferences</CardTitle>
                <CardDescription>
                  Configure automatic syncing and backup options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-sync"
                    checked={settings.autoSync}
                    onCheckedChange={(autoSync: boolean) => 
                      setSettings(prev => ({ ...prev, autoSync }))
                    }
                  />
                  <Label htmlFor="auto-sync">Enable automatic sync</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Sync interval (minutes)</Label>
                  <Input
                    id="sync-interval"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.syncInterval}
                    onChange={(e) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        syncInterval: parseInt(e.target.value) || 30 
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import/Export</CardTitle>
                <CardDescription>
                  Backup or restore your settings configuration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportSettings}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                  <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </Button>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          if (settingsManager.importSettings(content)) {
                            setSettings(settingsManager.getSettings());
                            toast({
                              title: "Settings Imported",
                              description: "Settings have been imported successfully.",
                            });
                          } else {
                            toast({
                              title: "Import Failed",
                              description: "Invalid settings file format.",
                              variant: "destructive",
                            });
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>
                  Manage your account settings and session.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Session</Label>
                  <p className="text-sm text-muted-foreground">
                    You are currently signed in. Click the button below to sign out of your account.
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      import('next-auth/react').then(({ signOut }) => {
                        signOut({ callbackUrl: '/auth/signin' });
                      });
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
