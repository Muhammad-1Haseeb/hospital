import Image from "next/image";
import Link from "next/link";

import { PatientForm } from "@/components/forms/PatientForm";
import { PasskeyModal } from "@/components/PasskeyModal";
import { siteConfig } from "@/lib/siteConfig";

const Home = ({ searchParams }: SearchParamProps) => {
  const isAdmin = searchParams?.admin === "true";

  return (
    <div className="flex h-screen max-h-screen items-center justify-center bg-dark-300 relative overflow-hidden">
      {isAdmin && <PasskeyModal />}

      {/* Dynamic Glow Backgrounds */}
      <div className="absolute -top-[10%] -left-[5%] size-[600px] rounded-full bg-green-500/5 blur-[120px]" />
      <div className="absolute -bottom-[10%] -right-[5%] size-[600px] rounded-full bg-green-600/10 blur-[120px]" />

      <div className="remove-scrollbar relative z-10 flex h-full w-full max-w-[1300px] flex-col items-center justify-center gap-10 px-6 lg:flex-row lg:px-10 xl:gap-12">
        
        {/* Form Section: Balanced Center-Left */}
        <div className="w-full max-w-[500px]">
            <div className="sub-container flex flex-col rounded-[48px] bg-white/40 p-10 shadow-[0_48px_96px_-24px_rgba(45,29,23,0.12)] backdrop-blur-3xl border border-white/50 lg:p-12 hover:shadow-[0_64px_128px_-32px_rgba(45,29,23,0.18)] transition-all duration-500">
              <Image
                src="/assets/icons/logo-full.svg"
                height={32}
                width={162}
                alt="logo"
                className="mb-10 h-10 w-auto opacity-90"
                priority
              />

              <PatientForm />

              <div className="text-14-regular mt-12 flex items-center justify-between border-t border-dark-500/20 pt-8 text-dark-600">
                <p>{siteConfig.copyright}</p>
                <Link 
                  href="/?admin=true" 
                  className="text-green-500 font-bold hover:text-green-600 transition-colors underline-offset-4 hover:underline"
                >
                  Admin Portal
                </Link>
              </div>
            </div>
        </div>

        {/* Floating Image Section: Balanced Center-Right */}
        <div className="hidden lg:flex items-center justify-center">
            <div className="relative p-5 bg-white/80 rounded-[56px] shadow-[0_60px_120px_-20px_rgba(45,29,23,0.3)] border border-white -rotate-1 hover:rotate-0 hover:scale-[1.03] transition-all duration-700 ease-out">
                <Image
                    src="/assets/images/onboarding-img.png"
                    height={600}
                    width={600}
                    alt="patient"
                    className="h-[480px] xl:h-[550px] w-auto rounded-[40px] object-cover shadow-inner"
                    priority
                />
                
                {/* Premium Badge System */}
                <div className="absolute -top-6 -left-6 rounded-3xl bg-green-500 px-6 py-4 text-dark-700 shadow-2xl ring-8 ring-dark-300 font-bold tracking-wider">
                    HEALTH PRO
                </div>
                
                <div className="absolute -bottom-10 -right-10 flex size-32 items-center justify-center rounded-full bg-white p-3 shadow-2xl ring-[12px] ring-dark-300">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-green-600 text-dark-700">
                        <span className="text-32-bold tracking-tight">CARE</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
