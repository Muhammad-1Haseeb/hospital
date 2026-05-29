import Image from "next/image";
import Link from "next/link";
import { DoctorForm } from "@/components/forms/DoctorForm";

const NewDoctor = () => {
  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-col py-10">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="patient"
            className="mb-12 h-10 w-fit"
          />

          <DoctorForm type="create" />

          <p className="copyright py-12">© 2026 CarePulse</p>
        </div>
      </section>

      <Image
        src="/assets/images/admin.png" // Using admin image for hiring page
        height={1000}
        width={1000}
        alt="admin"
        className="side-img max-w-[390px]"
      />
    </div>
  );
};

export default NewDoctor;
