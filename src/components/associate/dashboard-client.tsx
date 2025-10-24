"use client";

import { useState } from "react";
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

export function DashboardClient({ orders }: { orders: Order[] }) {
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);

  const awaitingPickupOrders = orders.filter(
    (order) => order.status === "Awaiting Pickup"
  );
  const pickedUpOrders = orders.filter(
    (order) => order.status === "Picked Up"
  );
  
  const today = new Date().toISOString().split('T')[0];
  const pickedUpToday = pickedUpOrders.filter(order => order.pickedUpAt?.startsWith(today));


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
              <OrdersTable orders={awaitingPickupOrders} />
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
              <OrdersTable orders={pickedUpOrders} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
