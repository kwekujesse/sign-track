
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { searchOrders } from "@/lib/actions";
import { type Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitButton } from "./submit-button";

const searchSchema = z.object({
  customerName: z.string().min(2, "Please enter at least 2 characters"),
});

export function CustomerSearch() {
  const [state, formAction] = useActionState(searchOrders, { orders: [], message: "" });
  
  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      customerName: "",
    },
  });

  return (
    <div className="w-full max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Find Your Order</CardTitle>
          <CardDescription className="text-center">
            Enter your first or last name to find your order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={formAction} className="space-y-6">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Customer Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Enter your first or last name..."
                          className="pl-10 h-12 text-lg"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SubmitButton className="w-full h-12 text-lg">
                <Search className="mr-2 h-5 w-5" />
                Search
              </SubmitButton>
            </form>
          </Form>
        </CardContent>
      </Card>

      {state?.message && <p className="mt-4 text-center text-muted-foreground">{state.message}</p>}

      {state?.orders && state.orders.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-center">Your Pending Orders</h2>
          {state.orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">Order #{order.orderNumber} &bull; Bin {order.binNumber}</p>
                    </div>
                    <Button asChild>
                        <Link href={`/order/${order.id}`}>Sign & Pickup</Link>
                    </Button>
                </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
