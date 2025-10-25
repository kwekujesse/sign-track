
'use client';
import { MainNav } from "@/components/main-nav";
import { CustomerSearch } from "@/components/customer-search";
import { useFirebase } from "@/firebase";
import { Loader2 } from "lucide-react";

export default function Home() {
    const { isUserLoading } = useFirebase();
  return (
    <div className="flex min-h-screen w-full flex-col">
      <MainNav />
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {isUserLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        ) : (
            <CustomerSearch />
        )}
      </main>
    </div>
  );
}
