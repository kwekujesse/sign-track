"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Barcode, User, Archive } from "lucide-react";
import { createOrder } from "@/lib/actions";
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
import { SubmitButton } from "../submit-button";

const orderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  binNumber: z.string().min(1, "Bin number is required"),
});

const initialState = {
  message: "",
  errors: {},
};

export function OrderEntryForm({
  setDialogOpen,
}: {
  setDialogOpen: (isOpen: boolean) => void;
}) {
  const [state, formAction] = useFormState(createOrder, initialState);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderNumber: "",
      customerName: "",
      binNumber: "",
    },
  });

  useEffect(() => {
    if (state.message === "Order created successfully.") {
      toast({
        title: "Success!",
        description: state.message,
        className: "bg-accent text-accent-foreground",
      });
      setDialogOpen(false);
      form.reset();
    } else if (state.message && state.message !== "Validation Error.") {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, setDialogOpen, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="grid gap-4 py-4">
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
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="John Doe" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <SubmitButton>Save Order</SubmitButton>
      </form>
    </Form>
  );
}
