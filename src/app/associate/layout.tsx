import { MainNav } from "@/components/main-nav";

export default function AssociateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <MainNav />
      <main className="flex-1 bg-muted/20">{children}</main>
    </div>
  );
}
