
"use client";

import { useRef, useState } from "react";
import { SignaturePad, type SignaturePadRef } from "./signature-pad";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function SignatureCapture({ orderId }: { orderId: string }) {
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleClear = () => {
    signaturePadRef.current?.clear();
  };

  const handleSubmit = async () => {
    if (!firestore) {
      toast({
        title: "Error",
        description: "Database not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    if (signaturePadRef.current?.isEmpty()) {
      toast({
        title: "Signature Required",
        description: "Please provide a signature before confirming.",
        variant: "destructive",
      });
      return;
    }

    const signatureDataUrl = signaturePadRef.current?.toDataURL();

    if (signatureDataUrl) {
      setIsPending(true);
      const orderRef = doc(firestore, "orders", orderId);
      const updateData = {
        status: "Picked Up",
        signature: signatureDataUrl,
        pickedUpAt: Timestamp.now(),
      };

      updateDoc(orderRef, updateData)
        .then(() => {
          toast({
            title: "Pickup Confirmed!",
            description: "Your order has been marked as picked up.",
            className: "bg-accent text-accent-foreground",
          });
          router.push('/');
        })
        .catch((serverError) => {
          const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'update',
            requestResourceData: updateData,
          });
          errorEmitter.emit('permission-error', permissionError);
          
          // Also show a toast for immediate user feedback
          toast({
            title: "Submission Failed",
            description: "Could not save signature due to a permission issue.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsPending(false);
        });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Signature</label>
        <SignaturePad ref={signaturePadRef} />
        <p className="text-xs text-muted-foreground mt-1">
          Draw your signature in the box above.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Confirm Signature
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
