import { AssociateNav } from "@/components/associate-nav";
import { AccessGate } from "@/components/associate/access-gate";

export default function AssociateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AssociateNav />
      <main className="flex-1 bg-muted/20">
        <AccessGate>{children}</AccessGate>
      </main>
    </div>
  );
}
