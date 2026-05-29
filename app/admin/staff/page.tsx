import Image from "next/image";
import Link from "next/link";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { getRecentAppointmentList, getDoctorStats } from "@/lib/actions/appointment.actions";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const StaffManagement = async () => {
  const doctors = await getDoctors();
  
  // High-performance: Fetch stats for all doctors in parallel
  const doctorsWithStats = await Promise.all(
    doctors.map(async (doctor: any) => {
      const stats = await getDoctorStats(doctor.$id, doctor.name);
      return { ...doctor, stats };
    })
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/admin" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-auto"
          />
        </Link>
        <p className="text-16-semibold">Staff Management</p>
      </header>

      <main className="admin-main">
        <section className="flex w-full items-center justify-between">
          <div className="space-y-2">
            <h1 className="header">Medical Staff Directory</h1>
            <p className="text-dark-700">Manage and monitor your physician team</p>
          </div>
          <Link href="/admin/staff/new">
            <Button className="bg-green-500 text-dark-700 hover:bg-green-600">
              <Plus className="mr-2" size={18} />
              Hire New Doctor
            </Button>
          </Link>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctorsWithStats.map((doctor: any) => {
            const stats = doctor.stats;
            return (
              <div key={doctor.$id} className="rounded-2xl border border-dark-500 bg-dark-400 p-6 space-y-4 hover:border-green-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Image
                    src={doctor.imageUrl || "/assets/images/dr-green.png"}
                    alt={doctor.name}
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-dark-500"
                  />
                  <div>
                    <h3 className="text-18-bold text-dark-700">Dr. {doctor.name}</h3>
                    <p className="text-14-medium text-green-500">{doctor.specialization}</p>
                    <p className="text-12-regular text-dark-600">{doctor.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-500">
                  <div className="space-y-1 text-center">
                    <p className="text-24-bold text-dark-700">{stats.total}</p>
                    <p className="text-12-regular text-dark-600 uppercase">Total</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-24-bold text-green-500">{stats.scheduled}</p>
                    <p className="text-12-regular text-dark-600 uppercase">Scheduled</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-24-bold text-yellow-500">{stats.pending}</p>
                    <p className="text-12-regular text-dark-600 uppercase">Pending</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-24-bold text-red-500">{stats.cancelled}</p>
                    <p className="text-12-regular text-dark-600 uppercase">Cancelled</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                   <Link href={`/admin/staff/${doctor.$id}`} className="flex-1">
                      <Button variant="outline" className="w-full shad-gray-btn">Edit Profile</Button>
                   </Link>
                   <Link href={`/doctors/${doctor.$id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-green-500/50 text-green-500 hover:bg-green-500/10">View Portal</Button>
                   </Link>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default StaffManagement;
