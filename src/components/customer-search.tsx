
"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { findOrdersByName } from "@/lib/data";
import { type Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitButton } from "./submit-button";
import { useFirebase } from "@/firebase";
import { Loader2 } from "lucide-react";

const searchSchema = z.object({
  customerName: z.string().min(2, "Please enter at least 2 characters"),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export function CustomerSearch() {
  const { isUserLoading } = useFirebase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      customerName: "",
    },
  });

  const handleSearch = async (data: SearchFormValues) => {
    setIsSearching(true);
    setMessage("");
    setOrders([]);

    try {
      const foundOrders = await findOrdersByName(data.customerName);
      const pendingOrders = foundOrders.filter(order => order.status === "Awaiting Pickup");

      if (pendingOrders.length === 0) {
        setMessage("No pending orders found for this name. Please see an associate for help.");
      } else {
        setOrders(pendingOrders);
      }
    } catch (error) {
      console.error("Search error:", error);
      setMessage("An error occurred while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  if (isUserLoading) {
    return (
        <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

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
            <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
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
              <Button type="submit" disabled={isSearching} className="w-full h-12 text-lg">
                {isSearching ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <Search className="mr-2 h-5 w-5" />
                )}
                Search
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {message && <p className="mt-4 text-center text-muted-foreground">{message}</p>}

      {orders.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-center">Your Pending Orders</h2>
          {orders.map((order) => (
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
