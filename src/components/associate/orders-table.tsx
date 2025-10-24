
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


export function OrdersTable({ orders, isLoading }: { orders: Order[], isLoading?: boolean }) {
  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "N/A";
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (!isValid(date)) return "Invalid Date";
    try {
        return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
        return "Invalid Date";
    }
  }

  const formatShortDate = (dateInput?: string | Date) => {
      if (!dateInput) return "N/A";
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (!isValid(date)) return "Invalid Date";
      try {
          return format(date, "MMM d, yyyy");
      } catch (error) {
          return "Invalid Date";
      }
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
      </TableRow>
    ))
  );

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
                            <span className="cursor-default">{formatShortDate(order.createdAt)}</span>
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
