import Image from "next/image";
import Link from "next/link";
import { getDoctorAppointments } from "@/lib/actions/appointment.actions";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { DataTable } from "@/components/table/DataTable";
import { columns } from "@/components/table/columns";
import { StatCard } from "@/components/StatCard";

const DoctorPortal = async ({ params: { doctorId } }: { params: { doctorId: string } }) => {
  const appointments = await getDoctorAppointments(doctorId);
  const doctors = await getDoctors();
  const currentDoctor = doctors.find((doc: any) => doc.$id === doctorId);

  if (!currentDoctor) return <div className="text-dark-700">Doctor not found.</div>;

  const scheduledCount = appointments?.filter((app: any) => app.status === "scheduled").length || 0;
  const pendingCount = appointments?.filter((app: any) => app.status === "pending").length || 0;
  const cancelledCount = appointments?.filter((app: any) => app.status === "cancelled").length || 0;

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-4">
           <Link href="/admin" className="text-16-semibold text-dark-700 hover:text-dark-700 mr-4">Admin Dashboard</Link>
           <Image 
             src={currentDoctor.imageUrl || "/assets/images/dr-green.png"} 
             alt="doctor" 
             width={32} 
             height={32} 
             className="rounded-full border border-dark-500"
           />
           <p className="text-16-semibold">Dr. {currentDoctor.name}</p>
        </div>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Welcome Back 👋</h1>
          <p className="text-dark-700">Manage your appointments for today</p>
        </section>

        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={scheduledCount}
            label="Your Scheduled"
            icon={"/assets/icons/appointments.svg"}
          />
          <StatCard
            type="pending"
            count={pendingCount}
            label="Your Pending"
            icon={"/assets/icons/pending.svg"}
          />
          <StatCard
            type="cancelled"
            count={cancelledCount}
            label="Your Cancelled"
            icon={"/assets/icons/cancelled.svg"}
          />
        </section>

        <DataTable columns={columns} data={appointments} doctors={doctors} />
      </main>
    </div>
  );
};

export default DoctorPortal;
