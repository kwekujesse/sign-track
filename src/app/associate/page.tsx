
import { DashboardClient } from "@/components/associate/dashboard-client";

export default function AssociateDashboardPage() {
  // Orders will be fetched on the client side by DashboardClient
  // after the user has authenticated.
  return (
    <div className="container mx-auto p-4 sm:p-6 md:py-8">
      <DashboardClient />
    </div>
  );
}
