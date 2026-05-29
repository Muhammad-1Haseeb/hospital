import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex-center size-full h-screen gap-3 text-dark-700">
      <Image
        src="/assets/icons/loader.svg"
        alt="loader"
        width={40}
        height={3240}
        className="animate-spin"
      />
      Loading...
    </div>
  );
}
