import Image from "next/image";
import Link from "next/link";
import { getMyAppointments } from "@/lib/actions/appointment.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { siteConfig } from "@/lib/siteConfig";
import { DataTable } from "@/components/table/DataTable";
import { patientColumns } from "@/components/table/PatientColumns";

import { SearchParamProps } from "@/types/actions.types";

const MyAppointments = async ({ params: { userId }, searchParams }: SearchParamProps) => {
  const name = searchParams?.name as string;
  const patient = await getPatient(userId, name);
  const appointments = await getMyAppointments(userId);
  const doctors = await getDoctors();

  if (!patient) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-300">
        <div className="text-center">
          <h1 className="header text-dark-700">Patient not found</h1>
          <Link href="/" className="text-green-500 underline">Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14 bg-dark-300 min-h-screen p-8">
      <header className="flex items-center justify-between">
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
            <p className="text-16-semibold text-dark-700">My Appointments</p>
            <Link href={`/patients/${userId}/profile`} className="text-blue-500 hover:underline">
                My Profile
            </Link>
            <Link href={`/patients/${userId}/new-appointment`} className="text-green-500 hover:underline">
                + New Appointment
            </Link>
        </div>
      </header>

      <main className="flex-1 space-y-8">
        <section className="w-full space-y-4">
          <h1 className="header text-dark-700">Welcome, {patient.name} 👋</h1>
          <p className="text-dark-700">
            View and manage your healthcare appointments below.
          </p>
        </section>

        <section className="rounded-xl border border-dark-400 bg-dark-200 p-6">
          {appointments && appointments.length > 0 ? (
            <DataTable columns={patientColumns} data={appointments} doctors={doctors} />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-20">
              <Image 
                src="/assets/icons/appointments.svg"
                height={100}
                width={100}
                alt="empty"
                className="opacity-20"
              />
              <p className="text-dark-700">You don't have any appointments yet.</p>
              <Link href={`/patients/${userId}/new-appointment`} className="btn-primary p-2 px-4 rounded-md">
                Book your first appointment
              </Link>
            </div>
          )}
        </section>
      </main>
      
      <footer className="py-8 text-center text-dark-700">
          <p>{siteConfig.copyright}</p>
      </footer>
    </div>
  );
};

export default MyAppointments;
