import * as Sentry from "@sentry/nextjs"; 
import Image from "next/image";
import { redirect } from "next/navigation";

import RegisterForm from "@/components/forms/RegisterForm";
import { getPatient, getUser } from "@/lib/actions/patient.actions";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { siteConfig } from "@/lib/siteConfig";
import { SearchParamProps } from "@/types/actions.types";

const Register = async ({ params: { userId }, searchParams }: SearchParamProps) => {
  if (userId === "undefined") redirect("/");

  const user = await getUser(userId);
  if (!user) redirect("/");

  const name = searchParams?.name as string;
  
  // Parallel Fetching for speed
  const [patient, doctors] = await Promise.all([
    getPatient(userId, name),
    getDoctors()
  ]);

  Sentry.metrics.count("user-view_registration", 1, { attributes: { user: user?.name } });

  // Only redirect if we found a patient that actually matches the name we're looking for
  if (patient && (!name || patient.name.toLowerCase() === name.toLowerCase())) {
    redirect(`/patients/${userId}/new-appointment?name=${encodeURIComponent(name || patient.name)}`);
  }

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container">
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="mb-12 h-10 w-auto"
          />

          <RegisterForm user={user} doctors={doctors} />

          <p className="copyright py-12">{siteConfig.copyright}</p>
        </div>
      </section>

      <Image
        src="/assets/images/register-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[390px]"
        priority
      />
    </div>
  );
};

export default Register;
