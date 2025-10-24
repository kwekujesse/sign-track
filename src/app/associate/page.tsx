import { getOrders } from "@/lib/data";
import { DashboardClient } from "@/components/associate/dashboard-client";

export default async function AssociateDashboardPage() {
  const orders = await getOrders();

  return (
    <div className="container mx-auto py-8">
      <DashboardClient orders={orders} />
    </div>
  );
}
