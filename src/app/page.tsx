import { MainNav } from "@/components/main-nav";
import { CustomerSearch } from "@/components/customer-search";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <MainNav />
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <CustomerSearch />
      </main>
    </div>
  );
}
