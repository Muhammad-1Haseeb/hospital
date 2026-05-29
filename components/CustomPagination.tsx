"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export const Pagination = ({ page, totalPages }: { page: number; totalPages: number }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigation = (type: "prev" | "next") => {
    const params = new URLSearchParams(searchParams.toString());
    const nextPage = type === "prev" ? page - 1 : page + 1;

    params.set("page", nextPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mt-10 flex w-full items-center justify-between">
      <Button
        variant="outline"
        className="shad-gray-btn"
        onClick={() => handleNavigation("prev")}
        disabled={page <= 1}
      >
        <Image
          src="/assets/icons/arrow.svg"
          width={24}
          height={24}
          alt="arrow"
        />
        Previous
      </Button>
      <p className="text-14-medium text-dark-700">
        Page {page} of {totalPages}
      </p>
      <Button
        variant="outline"
        className="shad-gray-btn"
        onClick={() => handleNavigation("next")}
        disabled={page >= totalPages}
      >
        Next
        <Image
          src="/assets/icons/arrow.svg"
          width={24}
          height={24}
          alt="arrow"
          className="rotate-180"
        />
      </Button>
    </div>
  );
};
