"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import { createDoctor, updateDoctor } from "@/lib/actions/doctor.actions";
import { DoctorFormValidation } from "@/lib/validation";

import "react-phone-number-input/style.css";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import { FileUploader } from "../FileUploader";
import SubmitButton from "../SubmitButton";

export const DoctorForm = ({ doctor, type = "create" }: { doctor?: any; type?: "create" | "update" }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof DoctorFormValidation>>({
    resolver: zodResolver(DoctorFormValidation),
    defaultValues: {
      name: doctor?.name || "",
      specialization: doctor?.specialization || "",
      email: doctor?.email || "",
      phone: doctor?.phone || "",
      experienceYears: doctor?.experienceYears || 0,
      about: doctor?.about || "",
      isActive: doctor?.isActive ?? true,
      image: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof DoctorFormValidation>) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("specialization", values.specialization);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("experienceYears", String(values.experienceYears));
      formData.append("about", values.about);
      formData.append("isActive", String(values.isActive));

      if (values.image && values.image.length > 0) {
        formData.append("image", values.image[0]);
      }

      let result;
      if (type === "create") {
         result = await createDoctor(formData);
      } else {
         result = await updateDoctor(doctor.$id, formData);
      }

      if (result.success) {
        form.reset();
        router.push("/admin/staff");
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        <section className="mb-12 space-y-4">
          <h1 className="header">{type === "create" ? "Hire New Doctor" : "Update Doctor Profile"}</h1>
          <p className="text-dark-700">Fill in the professional details below</p>
        </section>

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="Full Name"
          placeholder="Dr. John Doe"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="email"
            label="Email Address"
            placeholder="johndoe@healthcare.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
          />

          <CustomFormField
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="phone"
            label="Phone Number"
            placeholder="(555) 123-4567"
          />
        </div>

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="specialization"
          label="Specialization"
          placeholder="Cardiology, Pediatrics, etc."
        />

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="experienceYears"
            label="Years of Experience"
            placeholder="5"
          />

          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="about"
            label="About / Bio"
            placeholder="Experienced cardiologist specialized in..."
          />
        </div>

        <CustomFormField
          fieldType={FormFieldType.SKELETON}
          control={form.control}
          name="image"
          label="Physician Photo"
          renderSkeleton={(field) => (
            <FileUploader files={field.value} onChange={field.onChange} />
          )}
        />

        <SubmitButton isLoading={isLoading}>
           {type === "create" ? "Add Doctor to Staff" : "Update Profile"}
        </SubmitButton>
      </form>
    </Form>
  );
};
