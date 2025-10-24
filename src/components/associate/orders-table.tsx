
"use client";

import Image from "next/image";
import { type Order } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, isValid } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditOrderDialog } from "./edit-order-dialog";
import { DeleteOrderDialog } from "./delete-order-dialog";
import { Timestamp } from "firebase/firestore";

export function OrdersTable({ orders, isLoading }: { orders: Order[], isLoading?: boolean }) {
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  
  const formatDate = (dateInput?: string | Date | Timestamp) => {
    if (!dateInput) return "N/A";
    const date = dateInput instanceof Timestamp ? dateInput.toDate() : new Date(dateInput);
    if (!isValid(date)) return "Invalid Date";
    return format(date, "MMM d, yyyy 'at' h:mm a");
  }

  const formatShortDate = (dateInput?: string | Date | Timestamp) => {
    if (!dateInput) return "N/A";
    const date = dateInput instanceof Timestamp ? dateInput.toDate() : new Date(dateInput);
    if (!isValid(date)) return "Invalid Date";
    return format(date, "MMM d, yyyy");
  }

  const TableSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-10 w-24 ml-auto" /></TableCell>
        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      {editingOrder && (
        <EditOrderDialog
          order={editingOrder}
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
        />
      )}
      {deletingOrder && (
        <DeleteOrderDialog
          order={deletingOrder}
          isOpen={!!deletingOrder}
          onClose={() => setDeletingOrder(null)}
        />
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Bin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Signature</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableSkeleton /> : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.binNumber}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'Picked Up' ? 'default' : 'secondary'} className={order.status === 'Picked Up' ? 'bg-accent' : ''}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <span className="cursor-default">{formatShortDate(order.createdAt as any)}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{formatDate(order.createdAt as any)}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    {order.signature ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex justify-start">
                                <Image
                                    src={order.signature}
                                    alt={`Signature for ${order.customerName}`}
                                    width={100}
                                    height={50}
                                    className="bg-white p-1 border rounded-md"
                                />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Picked up on {formatDate(order.pickedUpAt as any)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.status === 'Awaiting Pickup' && (
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => setEditingOrder(order)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingOrder(order)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
