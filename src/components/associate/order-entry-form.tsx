
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Barcode, User, Archive, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFirebase } from "@/firebase";
import { collection, addDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Order } from "@/lib/types";
import { BarcodeScannerDialog } from "./barcode-scanner-dialog";

const orderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  binNumber: z.string().min(1, "Bin number is required"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export function OrderEntryForm({
  setDialogOpen,
  orderToEdit,
}: {
  setDialogOpen: (isOpen: boolean) => void;
  orderToEdit?: Order;
}) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: orderToEdit ? {
        orderNumber: orderToEdit.orderNumber,
        firstName: orderToEdit.firstName,
        lastName: orderToEdit.lastName,
        binNumber: orderToEdit.binNumber,
    } : {
      orderNumber: "",
      firstName: "",
      lastName: "",
      binNumber: "",
    },
  });
  
  useEffect(() => {
    if (orderToEdit) {
      form.reset(orderToEdit);
    }
  }, [orderToEdit, form]);

  const handleScanSuccess = (result: string) => {
    form.setValue("orderNumber", result, { shouldValidate: true });
    toast({
      title: "Scan Successful",
      description: `Order number set to ${result}`,
      className: "bg-accent text-accent-foreground",
    });
  };

  const onSubmit = async (data: OrderFormValues) => {
    if (!firestore) {
      toast({
        title: "Error",
        description: "Database not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    if (orderToEdit) {
        // Update existing order
        const orderRef = doc(firestore, "orders", orderToEdit.id);
        const updatedData = {
          ...data,
          customerName: `${data.firstName} ${data.lastName}`,
          firstName_lowercase: data.firstName.toLowerCase(),
          lastName_lowercase: data.lastName.toLowerCase(),
          customerName_lowercase: `${data.firstName} ${data.lastName}`.toLowerCase(),
        };

        updateDoc(orderRef, updatedData)
        .then(() => {
            toast({
              title: "Success!",
              description: "Order updated successfully.",
              className: "bg-accent text-accent-foreground",
            });
            setDialogOpen(false);
          })
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: orderRef.path,
              operation: 'update',
              requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
              title: "Error",
              description: "Failed to update order due to a permission issue.",
              variant: "destructive",
            });
          })
          .finally(() => {
            setIsSubmitting(false);
          });

    } else {
        // Create new order
        const newOrderData = {
          ...data,
          customerName: `${data.firstName} ${data.lastName}`,
          firstName_lowercase: data.firstName.toLowerCase(),
          lastName_lowercase: data.lastName.toLowerCase(),
          customerName_lowercase: `${data.firstName} ${data.lastName}`.toLowerCase(),
          status: "Awaiting Pickup",
          createdAt: Timestamp.now(),
        };
        
        const ordersCollection = collection(firestore, "orders");

        addDoc(ordersCollection, newOrderData)
          .then(() => {
            toast({
              title: "Success!",
              description: "Order created successfully.",
              className: "bg-accent text-accent-foreground",
            });
            setDialogOpen(false);
            form.reset();
          })
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: ordersCollection.path,
              operation: 'create',
              requestResourceData: newOrderData,
            });
            errorEmitter.emit('permission-error', permissionError);

            toast({
              title: "Error",
              description: "Failed to create order due to a permission issue.",
              variant: "destructive",
            });
          })
          .finally(() => {
            setIsSubmitting(false);
          });
    }
  };

  return (
    <>
      <BarcodeScannerDialog
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSuccess}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="orderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Barcode className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Scan or type barcode..." className="pl-9 pr-9" {...field} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setIsScannerOpen(true)}
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Scan Barcode</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="John" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="binNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bin Number</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Archive className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="A12" className="pl-9" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : orderToEdit ? 'Save Changes' : 'Save Order'}
          </Button>
        </form>
      </Form>
    </>
  );
}
