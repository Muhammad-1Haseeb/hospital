import Image from "next/image";
import Link from "next/link";
import { getPatient } from "@/lib/actions/patient.actions";
import { getDoctors } from "@/lib/actions/doctor.actions";
import RegisterForm from "@/components/forms/RegisterForm";
import { siteConfig } from "@/lib/siteConfig";

import { SearchParamProps } from "@/types/actions.types";

const PatientProfile = async ({ params: { userId }, searchParams }: SearchParamProps) => {
  const name = searchParams?.name as string;
  const patient = await getPatient(userId, name);
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
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="mb-12 h-10 w-auto"
          />

          <RegisterForm user={{ $id: userId }} patient={patient} doctors={doctors} />

          <p className="copyright py-12">{siteConfig.copyright}</p>
        </div>
      </section>

      <Image
        src="/assets/images/register-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[390px]"
      />
    </div>
  );
};

export default PatientProfile;
