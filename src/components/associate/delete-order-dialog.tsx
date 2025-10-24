
"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type Order } from "@/lib/types";
import { useFirebase } from "@/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function DeleteOrderDialog({
  order,
  isOpen,
  onClose,
}: {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!firestore) {
      toast({
        title: "Error",
        description: "Database not available.",
        variant: "destructive",
      });
      return;
    }
    setIsDeleting(true);
    const orderRef = doc(firestore, "orders", order.id);

    deleteDoc(orderRef)
      .then(() => {
        toast({
          title: "Order Deleted",
          description: `Order #${order.orderNumber} has been successfully deleted.`,
          className: "bg-accent text-accent-foreground",
        });
        onClose();
      })
      .catch((serverError) => {
         const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          title: "Error",
          description: "Failed to delete order due to a permission issue.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the order
            for <span className="font-semibold">{order.customerName}</span> (Order #{order.orderNumber}).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? <Loader2 className="animate-spin" /> : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
