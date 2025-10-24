import React from 'react';
import { type Order } from "@/lib/types";
import { Package } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export const ReportView = React.forwardRef<HTMLDivElement, { orders: Order[] }>(({ orders }, ref) => {
    
    const formatDate = (dateInput?: string | Date | Timestamp) => {
        if (!dateInput) return "N/A";
        const date = dateInput instanceof Timestamp ? dateInput.toDate() : new Date(dateInput);
        if (!date || isNaN(date.getTime())) return "Invalid Date";
        return format(date, "MMM d, yyyy h:mm a");
    }
  
    return (
        <div ref={ref} className="p-8 font-sans bg-white text-black">
            <style type="text/css" media="print">
            {`
                @page { size: auto; margin: 20mm; }
                body { -webkit-print-color-adjust: exact; }
            `}
            </style>
            <header className="flex justify-between items-center pb-4 border-b border-gray-300">
                <div>
                    <div className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-black" />
                        <span className="font-bold text-xl">
                        HOLIDAY CARD PICKUP
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold mt-2">End of Day Pickup Report</h1>
                </div>
                <div className="text-right">
                    <p className="font-semibold">Date: {new Date().toLocaleDateString()}</p>
                    <p>Total Pickups: {orders.length}</p>
                </div>
            </header>
            
            <main className="mt-8">
                {orders.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="border-b-2 p-2">Order #</th>
                                <th className="border-b-2 p-2">Customer Name</th>
                                <th className="border-b-2 p-2">Bin</th>
                                <th className="border-b-2 p-2">Pickup Time</th>
                                <th className="border-b-2 p-2 text-center">Signature</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="border-b p-2">{order.orderNumber}</td>
                                    <td className="border-b p-2">{order.customerName}</td>
                                    <td className="border-b p-2">{order.binNumber}</td>
                                    <td className="border-b p-2">{formatDate(order.pickedUpAt)}</td>
                                    <td className="border-b p-2">
                                        {order.signature && (
                                            <div className="flex justify-center">
                                                <Image src={order.signature} alt="signature" width={80} height={40} className="bg-gray-100 p-1 border"/>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No orders were picked up today.</p>
                    </div>
                )}
            </main>

            <footer className="mt-12 text-center text-xs text-gray-400 pt-4 border-t">
                <p>SignTrack EOD Report</p>
            </footer>
        </div>
    );
});

ReportView.displayName = 'ReportView';
