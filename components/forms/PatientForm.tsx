"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import { createUser } from "@/lib/actions/patient.actions";
import { UserFormValidation } from "@/lib/validation";

import "react-phone-number-input/style.css";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { ProgressBar } from "../ProgressBar";

export const PatientForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof UserFormValidation>) => {
    setIsLoading(true);
    console.log("🚀 Form Submission Started", values);

    try {
      const user = {
        name: values.name,
        email: values.email,
        phone: values.phone,
      };

      const result = await createUser(user);

      if (result.success && result.data?.$id) {
        console.log("✅ User created successfully:", result.data.$id);
        router.push(`/patients/${result.data.$id}/register?name=${values.name}`);
      } else if (!result.success) {
        console.error("❌ User creation failed:", result.error);
        alert(result.error || "Something went wrong during account setup.");
      }
    } catch (error) {
      console.error("💥 Critical error in onSubmit:", error);
    }

    setIsLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("📝 handleFormSubmit triggered");
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <Form {...form}>
      <ProgressBar isLoading={isLoading} />
      <form onSubmit={handleFormSubmit} className="flex-1 space-y-6" action="#">
        <section className="mb-12 space-y-4">
          <h1 className="header">Hi there 👋</h1>
          <p className="text-dark-700">Get started with appointments.</p>
        </section>

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="Full name"
          placeholder="John Doe"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="Email"
          placeholder="johndoe@gmail.com"
          iconSrc="/assets/icons/email.svg"
          iconAlt="email"
        />

        <CustomFormField
          fieldType={FormFieldType.PHONE_INPUT}
          control={form.control}
          name="phone"
          label="Phone number"
          placeholder="(555) 123-4567"
        />

        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};
