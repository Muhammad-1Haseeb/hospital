"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "use-debounce";

import { Input } from "./ui/input";

export const Search = ({ placeholder }: { placeholder: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [text, setText] = useState(searchParams.get("search") || "");
  const [query] = useDebounce(text, 500);

  useEffect(() => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset to page 1 on search
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [query, router, pathname, searchParams]);

  return (
    <div className="flex w-full items-center gap-2 rounded-md border border-dark-500 bg-dark-400 px-4">
      <Image
        src="/assets/icons/user.svg"
        height={24}
        width={24}
        alt="search"
        className="opacity-50"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="shad-input border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {isPending ? (
        <div className="flex h-6 w-6 items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        </div>
      ) : text && (
        <Image
          src="/assets/icons/close.svg"
          height={24}
          width={24}
          alt="clear"
          className="cursor-pointer opacity-50 hover:opacity-100"
          onClick={() => setText("")}
        />
      )}
    </div>
  );
};
