
"use client";

import { useState, useEffect } from "react";
import { type Order } from "@/lib/types";
import { OrdersTable } from "./orders-table";
import { ReportDialog } from "./report-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus2, FileText, Package, CheckCircle } from "lucide-react";
import { OrderEntryForm } from "./order-entry-form";
import { useCollection, useFirebase, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, getFirestore, where } from "firebase/firestore";

export function DashboardClient({ orders: initialOrders }: { orders: Order[] }) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "orders"), orderBy("createdAt", "desc"));
  }, [firestore]);
  
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const [awaitingPickupOrders, setAwaitingPickupOrders] = useState<Order[]>([]);
  const [pickedUpOrders, setPickedUpOrders] = useState<Order[]>([]);
  const [pickedUpToday, setPickedUpToday] = useState<Order[]>([]);

  useEffect(() => {
    const allOrders = orders; // We will now only rely on the real-time data
    if (allOrders) {
      const awaiting = allOrders.filter(
        (order) => order.status === "Awaiting Pickup"
      );
      const pickedUp = allOrders.filter(
        (order) => order.status === "Picked Up"
      );
      
      const today = new Date().toISOString().split('T')[0];
      const todayPickups = pickedUp.filter(order => {
        if (!order.pickedUpAt) return false;
        // Ensure pickedUpAt is a valid date before creating a Date object
        const pickedUpAtDate = new Date(order.pickedUpAt);
        if (isNaN(pickedUpAtDate.getTime())) {
          return false; // Invalid date
        }
        return pickedUpAtDate.toISOString().split('T')[0] === today;
      });
      
      setAwaitingPickupOrders(awaiting);
      setPickedUpOrders(pickedUp);
      setPickedUpToday(todayPickups);
    } else {
        // Handle case where orders is null (e.g. on initial load or error)
        const awaiting = initialOrders.filter((order) => order.status === "Awaiting Pickup");
        const pickedUp = initialOrders.filter((order) => order.status === "Picked Up");
        const today = new Date().toISOString().split('T')[0];
        const todayPickups = pickedUp.filter(order => {
            if (!order.pickedUpAt) return false;
            const pickedUpAtDate = new Date(order.pickedUpAt);
            if (isNaN(pickedUpAtDate.getTime())) {
                return false; // Invalid date
            }
            return pickedUpAtDate.toISOString().split('T')[0] === today;
        });
        
        setAwaitingPickupOrders(awaiting);
        setPickedUpOrders(pickedUp);
        setPickedUpToday(todayPickups);
    }
  }, [orders, initialOrders]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Associate Dashboard</h1>
          <p className="text-muted-foreground">Manage and track all customer orders.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FilePlus2 className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Order</DialogTitle>
                <DialogDescription>
                  Scan the barcode and enter customer details to bin the order.
                </DialogDescription>
              </DialogHeader>
              <OrderEntryForm setDialogOpen={setIsNewOrderDialogOpen} />
            </DialogContent>
          </Dialog>
          <ReportDialog orders={pickedUpToday}>
             <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Print EOD Report
              </Button>
          </ReportDialog>
        </div>
      </div>

      <Tabs defaultValue="awaiting">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="awaiting">
            <Package className="mr-2 h-4 w-4"/>
            Awaiting Pickup ({awaitingPickupOrders.length})
          </TabsTrigger>
          <TabsTrigger value="picked-up">
            <CheckCircle className="mr-2 h-4 w-4"/>
            Completed ({pickedUpOrders.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="awaiting">
          <Card>
            <CardHeader>
              <CardTitle>Orders Awaiting Pickup</CardTitle>
              <CardDescription>These orders have been binned and are ready for customer pickup.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersTable orders={awaitingPickupOrders} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="picked-up">
           <Card>
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
              <CardDescription>These orders have been signed for and picked up by customers.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersTable orders={pickedUpOrders} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
