import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14 p-10">
      <header className="flex items-center justify-between rounded-2xl bg-dark-200 px-[5%] py-5 shadow-lg xl:px-12 opacity-50">
         <Skeleton className="h-8 w-40" />
         <Skeleton className="h-4 w-32" />
         <Skeleton className="h-6 w-24" />
      </header>

      <main className="flex flex-col items-center space-y-6 px-[5%] pb-12 xl:space-y-12 xl:px-12">
        <section className="w-full space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        </section>

        <section className="flex w-full flex-col justify-between gap-5 sm:flex-row xl:gap-10">
           <Skeleton className="h-32 flex-1 rounded-2xl" />
           <Skeleton className="h-32 flex-1 rounded-2xl" />
           <Skeleton className="h-32 flex-1 rounded-2xl" />
        </section>

        <div className="w-full space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
