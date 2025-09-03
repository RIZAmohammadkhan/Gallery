import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Download, Loader2 } from "lucide-react";

interface BulkExportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  progress: number;
  isComplete: boolean;
  imageCount: number;
}

export function BulkExportDialog({
  isOpen,
  onOpenChange,
  progress,
  isComplete,
  imageCount,
}: BulkExportDialogProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // Auto-close after completion
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={!isComplete ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {isComplete ? 'Export Complete' : 'Exporting Images'}
          </DialogTitle>
          <DialogDescription>
            {isComplete 
              ? `Successfully exported ${imageCount} ${imageCount === 1 ? 'image' : 'images'} to ZIP file.`
              : `Preparing ${imageCount} ${imageCount === 1 ? 'image' : 'images'} for download...`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(displayProgress)}%</span>
            </div>
            <Progress value={displayProgress} className="h-2" />
          </div>
          
          {!isComplete && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating ZIP file...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
