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
import { format } from 'date-fns';

export function OrdersTable({ orders }: { orders: Order[] }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  }

  return (
    <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Bin</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date Added</TableHead>
          <TableHead className="text-right">Signature</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length > 0 ? (
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
                            <span className="cursor-default">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{formatDate(order.createdAt)}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-right">
                {order.signature ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-end">
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
                        <p>Picked up on {formatDate(order.pickedUpAt)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  "N/A"
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No orders found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );
}
