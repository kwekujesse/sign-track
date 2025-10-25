
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Search, XCircle, Clock } from "lucide-react";
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
  const [mode, setMode] = useState<"search" | "results" | "notfound" | "loading">("search");
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef<number | null>(null);
  const inactivityTimerRef = useRef<number | null>(null);
  const INACTIVITY_RESET_MS = 20000; // 20s default; tweak as needed

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      customerName: "",
    },
  });

  const handleNewSearch = () => {
    setOrders([]);
    setMessage("");
    setMode("search");
    try { form.reset({ customerName: "" }); } catch {}
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleSearch = async (data: SearchFormValues) => {
    // Blur any focused input to reduce on-screen keyboard interference
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setMode("loading");
    setIsSearching(true);
    setMessage("");
    setOrders([]);

    try {
      const foundOrders = await findOrdersByName(data.customerName);
      const pendingOrders = foundOrders.filter(order => order.status === "Awaiting Pickup");

      if (pendingOrders.length === 0) {
        setMessage("No pending orders found for this name. Please see an associate for help.");
        setMode("notfound");
      } else {
        setOrders(pendingOrders);
        setMode("results");
      }
    } catch (error) {
      console.error("Search error:", error);
      setMessage("An error occurred while searching. Please try again.");
      setMode("notfound");
    } finally {
      setIsSearching(false);
    }
  };

  // When showing not found, start a 10s countdown and refresh
  useEffect(() => {
    if (mode === "notfound") {
      setCountdown(10);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      const id = window.setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            window.clearInterval(id);
            // Full page refresh to reflect any new orders that may have been added
            window.location.reload();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      timerRef.current = id as unknown as number;
      return () => {
        window.clearInterval(id);
      };
    }
    return;
  }, [mode]);

  // Inactivity: when results are visible, reset back to search after N seconds without interaction
  useEffect(() => {
    const clearInactivity = () => {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
    const resetToSearch = () => {
      // Clear state and show search again
      setOrders([]);
      setMessage("");
      setMode("search");
      try { form.reset({ customerName: "" }); } catch {}
      // Ensure focus is not stuck on anything
      if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    const scheduleInactivity = () => {
      clearInactivity();
      inactivityTimerRef.current = window.setTimeout(() => {
        resetToSearch();
      }, INACTIVITY_RESET_MS) as unknown as number;
    };

    if (mode === "results") {
      scheduleInactivity();
      const activity = () => scheduleInactivity();
      window.addEventListener("pointerdown", activity, { passive: true } as any);
      window.addEventListener("pointermove", activity, { passive: true } as any);
      window.addEventListener("keydown", activity);
      window.addEventListener("scroll", activity, { passive: true } as any);

      return () => {
        clearInactivity();
        window.removeEventListener("pointerdown", activity as any);
        window.removeEventListener("pointermove", activity as any);
        window.removeEventListener("keydown", activity as any);
        window.removeEventListener("scroll", activity as any);
      };
    }

    // Cleanup when not on results
    clearInactivity();
    return;
  }, [mode]);

  if (isUserLoading) {
    return (
        <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <div className="w-full max-w-2xl">
      {mode === "search" && (
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
      )}

      {mode === "loading" && (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {mode === "results" && orders.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-center flex-1">Your Pending Orders</h2>
            <Button variant="outline" onClick={handleNewSearch} className="ml-4">New Search</Button>
          </div>
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">Order #{order.orderNumber} • Bin {order.binNumber}</p>
                </div>
                <Button asChild>
                  <Link href={`/order/${order.id}`}>Sign & Pickup</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {mode === "notfound" && (
        <Card className="mt-6">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <XCircle className="h-10 w-10 text-destructive" />
            <p className="text-base text-muted-foreground">{message || "No results found."}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Refreshing in {countdown}s...</span>
            </div>
            <Button onClick={handleNewSearch} variant="outline" className="mt-2">New Search</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
