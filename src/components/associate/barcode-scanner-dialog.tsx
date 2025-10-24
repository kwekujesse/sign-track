
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarcodeScanner } from "react-zxing";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface BarcodeScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function BarcodeScannerDialog({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerDialogProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleScan = (result: any) => {
    if (result) {
      onScan(result.getText());
      onClose();
    }
  };

  const handleError = (error: any) => {
    console.error("Barcode scanner error:", error);
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setHasCameraPermission(false);
    } else {
        toast({
            variant: "destructive",
            title: "Scanner Error",
            description: "An unexpected error occurred with the barcode scanner.",
        });
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      // Reset permission state each time the dialog opens
      setHasCameraPermission(null); 
      // Check for permissions when dialog opens
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => setHasCameraPermission(true))
        .catch(() => setHasCameraPermission(false));
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>
            Point your camera at the order barcode.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md overflow-hidden">
          {hasCameraPermission === null ? (
            <div className="h-48 flex items-center justify-center bg-muted">
                <p>Requesting camera permission...</p>
            </div>
          ) : hasCameraPermission === true ? (
             <BarcodeScanner
                onResult={handleScan}
                onError={handleError}
             />
          ) : (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Camera Access Denied</AlertTitle>
                <AlertDescription>
                    Please enable camera permissions in your browser settings to use the barcode scanner.
                </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
