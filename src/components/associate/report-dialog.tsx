
"use client";

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { type Order } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import { ReportView } from "./report-view";

interface ReportDialogProps {
  orders: Order[];
}

export function ReportDialog({ orders }: ReportDialogProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `EOD-Pickup-Report-${new Date().toLocaleDateString()}`,
  });

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Print EOD Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>End of Day Pickup Report</DialogTitle>
          <DialogDescription>
            This is a summary of all orders picked up today.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto p-1">
          <ReportView ref={componentRef} orders={orders} />
        </div>

        <DialogFooter>
          <Button onClick={handlePrint} disabled={orders.length === 0}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
