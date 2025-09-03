import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Cloud, 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { StoredImage } from "@/lib/types";
import { cloudStorageService, SyncResult } from "@/lib/cloud-storage";
import { settingsManager } from "@/lib/settings-manager";
import { useToast } from "@/hooks/use-toast";

interface CloudSyncDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  images: StoredImage[];
}

export function CloudSyncDialog({ isOpen, onOpenChange, images }: CloudSyncDialogProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const { toast } = useToast();

  const settings = settingsManager.getSettings();
  const isCloudConfigured = settingsManager.isCloudStorageConfigured();

  const handleTestConnection = async () => {
    if (!isCloudConfigured) {
      toast({
        title: "Configuration Required",
        description: "Please configure cloud storage in settings first.",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus('checking');
    try {
      cloudStorageService.setProvider(settings.cloudStorage);
      const connected = await cloudStorageService.testConnection();
      setConnectionStatus(connected ? 'connected' : 'error');
      
      if (!connected) {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to cloud storage. Please check your configuration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection Error",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      });
    }
  };

  const handleSync = async () => {
    if (!isCloudConfigured || connectionStatus !== 'connected') {
      await handleTestConnection();
      if (connectionStatus !== 'connected') return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    setSyncResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await cloudStorageService.syncImages(images);
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      setSyncResult(result);

      if (result.errors.length === 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully uploaded ${result.uploaded} images to cloud storage.`,
        });
      } else {
        toast({
          title: "Sync Completed with Errors",
          description: `Uploaded ${result.uploaded} images, ${result.errors.length} failed.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setSyncProgress(0);
      toast({
        title: "Sync Failed",
        description: "Failed to sync images to cloud storage.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClose = () => {
    if (!isSyncing) {
      onOpenChange(false);
      setSyncResult(null);
      setSyncProgress(0);
      setConnectionStatus('idle');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Cloud Storage Sync
          </DialogTitle>
          <DialogDescription>
            Backup your gallery images to cloud storage for safekeeping and cross-device access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isCloudConfigured ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cloud storage is not configured. Please configure it in settings first.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Connection Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {settings.cloudStorage.provider.charAt(0).toUpperCase() + 
                     settings.cloudStorage.provider.slice(1).replace('-', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {connectionStatus === 'checking' && (
                    <Badge variant="secondary">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Checking
                    </Badge>
                  )}
                  {connectionStatus === 'connected' && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                  {connectionStatus === 'error' && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  )}
                  {connectionStatus === 'idle' && (
                    <Button variant="outline" size="sm" onClick={handleTestConnection}>
                      Test Connection
                    </Button>
                  )}
                </div>
              </div>

              {/* Sync Progress */}
              {isSyncing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Syncing images...</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="h-2" />
                </div>
              )}

              {/* Sync Results */}
              {syncResult && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Uploaded: {syncResult.uploaded} images</span>
                  </div>
                  {syncResult.errors.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <XCircle className="h-4 w-4" />
                        <span>Errors: {syncResult.errors.length}</span>
                      </div>
                      <div className="max-h-20 overflow-y-auto text-xs text-muted-foreground">
                        {syncResult.errors.map((error, index) => (
                          <div key={index}>{error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sync Info */}
              <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4" />
                  <span className="font-medium">Ready to sync {images.length} images</span>
                </div>
                <p>Images will be uploaded to your cloud storage provider and organized in a gallery folder.</p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isSyncing}>
            Close
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={!isCloudConfigured || isSyncing || connectionStatus === 'error'}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isSyncing ? "Syncing..." : "Start Sync"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
