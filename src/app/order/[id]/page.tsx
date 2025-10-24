import { getOrderById } from "@/lib/data";
import { notFound } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { SignatureCapture } from "@/components/signature-capture";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <MainNav />
      <main className="flex-1 bg-muted/40">
        <div className="container mx-auto max-w-3xl py-8 md:py-12">
          {order.status === "Picked Up" ? (
             <Alert variant="default" className="bg-accent text-accent-foreground">
                <AlertCircle className="h-4 w-4 !text-accent-foreground" />
                <AlertTitle>Order Already Picked Up</AlertTitle>
                <AlertDescription>
                    This order has already been marked as picked up.
                </AlertDescription>
             </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold">Complete Your Pickup</CardTitle>
                <CardDescription>
                  Please confirm the order details and provide your signature below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                    <p className="font-semibold">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                    <p className="font-semibold">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bin Number</p>
                    <p className="font-semibold">{order.binNumber}</p>
                  </div>
                </div>
                <SignatureCapture orderId={order.id} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
