
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Barcode, User, Archive } from "lucide-react";
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
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const orderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  binNumber: z.string().min(1, "Bin number is required"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export function OrderEntryForm({
  setDialogOpen,
}: {
  setDialogOpen: (isOpen: boolean) => void;
}) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderNumber: "",
      firstName: "",
      lastName: "",
      binNumber: "",
    },
  });

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
    const newOrderData = {
      ...data,
      customerName: `${data.firstName} ${data.lastName}`, // Combined for easy search/display
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
  };

  return (
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
                  <Input placeholder="Scan barcode..." className="pl-9" {...field} />
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
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Order'}
        </Button>
      </form>
    </Form>
  );
}
