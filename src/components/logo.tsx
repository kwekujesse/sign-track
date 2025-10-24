import { type SVGProps } from "react";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
        <Package className="h-6 w-6 text-primary" />
        <span className="font-bold sm:inline-block">
            HOLIDAY CARD PICKUP
        </span>
    </div>
  );
}
