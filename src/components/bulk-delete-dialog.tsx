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

interface BulkDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  imageCount: number;
  isPermanent?: boolean;
}

export function BulkDeleteDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  imageCount,
  isPermanent = false,
}: BulkDeleteDialogProps) {
  const title = isPermanent 
    ? `Permanently Delete ${imageCount} ${imageCount === 1 ? 'Image' : 'Images'}`
    : `Move ${imageCount} ${imageCount === 1 ? 'Image' : 'Images'} to Bin`;
    
  const description = isPermanent
    ? `Are you sure you want to permanently delete ${imageCount === 1 ? 'this image' : 'these images'}? This action cannot be undone.`
    : `Are you sure you want to move ${imageCount === 1 ? 'this image' : 'these images'} to the Bin? You can restore them later from the Bin folder.`;
    
  const actionText = isPermanent ? "Delete Permanently" : "Move to Bin";

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
