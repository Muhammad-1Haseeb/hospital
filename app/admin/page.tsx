import Image from "next/image";
import Link from "next/link";

import { Pagination } from "@/components/CustomPagination";
import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { Search } from "@/components/Search";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { SearchParamProps } from "@/types/actions.types";
import { StatusFilter } from "@/components/StatusFilter";
import { ClearAllAppointmentsButton } from "@/components/ClearAllButton";
import { ResetSystemButton } from "@/components/ResetSystemButton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const AdminPage = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page || "1");
  const search = (searchParams?.search as string) || "";
  const status = (searchParams?.status as string) || "";
  const limit = 10;
  const offset = (page - 1) * limit;

  const [appointments, doctors] = await Promise.all([
    getRecentAppointmentList({ limit, offset, search, status }),
    getDoctors(),
  ]);

  if (!appointments)
    return <div className="text-dark-700">Failed to load appointments.</div>;

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header glassmorphism">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-auto"
          />
        </Link>

        <p className="text-16-semibold">Admin Dashboard</p>

        <Link
          href="/admin/bin"
          className="flex items-center gap-2 text-dark-700 hover:text-red-500 transition-colors"
        >
          <Image
            src="/assets/icons/cancelled.svg" // Using cancelled icon as a placeholder for "Bin" or just text
            height={20}
            width={20}
            alt="bin"
          />
          <span className="text-14-medium">Open Bin</span>
        </Link>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-4">
              <h1 className="header">Welcome 👋</h1>
              <p className="text-dark-700">
                Start the day with managing new appointments
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/admin/staff">
                <Button className="bg-green-500 text-dark-700 hover:bg-green-600 transition-all flex items-center">
                  <Plus className="mr-2" size={18} />
                  Manage Staff
                </Button>
              </Link>
            </div>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md border border-yellow-500/20 bg-dark-400 p-4">
              <p className="text-xs text-yellow-500">
                <strong>Developer Note:</strong> Resend is in test mode.
                Notifications are only sent to the verified sender email.
              </p>
            </div>
          )}
        </section>

        <div className="flex w-full flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="w-full xl:max-w-[400px]">
            <Search placeholder="Search appointments..." />
          </div>
        </div>

        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Scheduled appointments"
            icon={"/assets/icons/appointments.svg"}
          />
          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="Pending appointments"
            icon={"/assets/icons/pending.svg"}
          />
          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="Cancelled appointments"
            icon={"/assets/icons/cancelled.svg"}
          />
        </section>

        <div className="flex w-full items-center justify-between gap-4 mt-10">
          <StatusFilter />
          {process.env.NODE_ENV === "development" && (
            <div className="flex items-center gap-2">
              <ClearAllAppointmentsButton />
              <ResetSystemButton />
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={appointments.documents}
          doctors={doctors}
        />

        <Pagination
          page={page}
          totalPages={Math.ceil(appointments.totalCount / limit)}
        />
      </main>
    </div>
  );
};

export default AdminPage;
