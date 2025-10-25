
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderEntryForm } from "./order-entry-form";
import { type Order } from "@/lib/types";

export function EditOrderDialog({
  order,
  isOpen,
  onClose,
}: {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>
            Update the details for this order.
          </DialogDescription>
        </DialogHeader>
        <OrderEntryForm setDialogOpen={onClose} orderToEdit={order} />
      </DialogContent>
    </Dialog>
  );
}
