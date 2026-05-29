import Image from "next/image";
import { getDoctorById } from "@/lib/actions/doctor.actions";
import { DoctorForm } from "@/components/forms/DoctorForm";

const EditDoctor = async ({ params: { doctorId } }: { params: { doctorId: string } }) => {
  const doctor = await getDoctorById(doctorId);

  if (!doctor) return <div className="text-dark-700">Doctor not found.</div>;

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-col py-10">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="logo"
            className="mb-12 h-10 w-fit"
          />

          <DoctorForm type="update" doctor={doctor} />

          <p className="copyright py-12">© 2026 CarePulse</p>
        </div>
      </section>

      <Image
        src="/assets/images/admin.png"
        height={1000}
        width={1000}
        alt="admin"
        className="side-img max-w-[390px]"
      />
    </div>
  );
};

export default EditDoctor;
