import * as Sentry from "@sentry/nextjs";
import Image from "next/image";


import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { siteConfig } from "@/lib/siteConfig";
import { SearchParamProps } from "@/types/actions.types";

const NewAppointment = async ({ params: { userId }, searchParams }: SearchParamProps) => {
  const name = searchParams?.name as string;
  const patient = await getPatient(userId, name);
  const doctors = await getDoctors();

  Sentry.metrics.count("user-view_new-appointment", 1, { attributes: { user: patient?.name } });

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="mb-12 h-10 w-auto"
          />

          <AppointmentForm
            patientId={patient?.$id}
            userId={userId}
            type="create"
            doctors={doctors}
          />

          <p className="copyright mt-10 py-12">{siteConfig.copyright}</p>
        </div>
      </section>

      <Image
        src="/assets/images/appointment-img.png"
        height={1000}
        width={1000}
        alt="appointment"
        className="side-img max-w-[390px] bg-bottom"
        priority
      />
    </div>
  );
};

export default NewAppointment;
