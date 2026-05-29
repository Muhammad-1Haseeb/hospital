import * as Sentry from "@sentry/nextjs"; 
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getAppointment } from "@/lib/actions/appointment.actions";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { getUser } from "@/lib/actions/patient.actions";
import { siteConfig } from "@/lib/siteConfig";
import { formatDateTime } from "@/lib/utils";
import { SearchParamProps } from "@/types/actions.types";
import { Doctor } from "@/types/appwrite.types";

const RequestSuccess = async ({
  searchParams,
  params: { userId },
}: SearchParamProps) => {
  const appointmentId = (searchParams?.appointmentId as string) || "";
  const appointment = await getAppointment(appointmentId);

  if (!appointment) redirect("/");

  const doctors = await getDoctors();
  const doctor = (doctors as Doctor[]).find(
    (doctor) => doctor.name === appointment.primaryPhysician
  );
  const user = await getUser(userId);

  Sentry.metrics.count("user-view_appointment-success", 1, { attributes: { user: user?.name } });

  return (
    <div className=" flex h-screen max-h-screen px-[5%]">
      <div className="success-img">
        <Link href="/">
          <Image 
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-10 w-auto"
            unoptimized
          />
        </Link>

        <section className="flex flex-col items-center">
          <Image
            src="/assets/gifs/success.gif"
            height={300}
            width={280}
            alt="success"
            unoptimized
            priority
          />
          <h2 className="header mb-6 max-w-[600px] text-center">
            Your <span className="text-green-500">appointment request</span> has
            been successfully submitted!
          </h2>
          <p>We&apos;ll be in touch shortly to confirm. You will get a confirmation message on this email: <span className="text-green-500">{user?.email}</span></p>
        </section>

        <section className="request-details">
          <p>Requested appointment details: </p>
          <div className="flex items-center gap-3">
            <Image
              src={doctor?.imageUrl || "/assets/images/dr-green.png"}
              alt="doctor"
              width={24}
              height={24}
              className="size-6 rounded-full"
            />
            <p className="whitespace-nowrap">
                {(doctor?.name || appointment.primaryPhysician).startsWith("Dr.") 
                    ? (doctor?.name || appointment.primaryPhysician) 
                    : `Dr. ${doctor?.name || appointment.primaryPhysician}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Image
              src="/assets/icons/calendar.svg"
              height={24}
              width={24}
              alt="calendar"
              className="size-6"
            />
            <p> {formatDateTime(appointment.schedule).dateTime}</p>
          </div>
        </section>

        <div className="flex gap-4">
          <Button variant="outline" className="shad-primary-btn" asChild>
            <Link href={`/patients/${userId}/new-appointment`}>
              New Appointment
            </Link>
          </Button>

          <Button variant="outline" className="shad-secondary-btn" asChild>
            <Link href={`/patients/${userId}/appointments?name=${encodeURIComponent(appointment.patient.name)}`}>
              View My Appointments
            </Link>
          </Button>

          <Button variant="outline" className="shad-gray-btn" asChild>
            <Link href={`/patients/${userId}/profile?name=${encodeURIComponent(appointment.patient.name)}`}>
              My Profile
            </Link>
          </Button>
        </div>

        <p className="copyright">{siteConfig.copyright}</p>
      </div>
    </div>
  );
};

export default RequestSuccess;
