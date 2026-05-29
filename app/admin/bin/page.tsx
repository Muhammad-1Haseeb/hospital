import Image from "next/image";
import Link from "next/link";
import { MoveLeft } from "lucide-react";

import { getDeletedPatients } from "@/lib/actions/patient.actions";
import { formatDateTime } from "@/lib/utils";
import { Button } from "../../../components/ui/button";
import { RestoreButton } from "../../../components/RestoreButton";
import { StatusBadge } from "../../../components/StatusBadge";

const BinPage = async () => {
  const deletedPatients = await getDeletedPatients();

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
          <MoveLeft size={20} className="text-green-500" />
          <p className="text-16-semibold">Back to Dashboard</p>
        </Link>

        <p className="text-16-semibold text-red-500">Recycle Bin</p>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header text-red-500">Deleted Patients 🗑️</h1>
          <p className="text-dark-700">
            View and restore recently deleted patient records.
          </p>
        </section>

        <section className="mt-10 overflow-hidden rounded-lg border border-dark-400 bg-dark-200">
          <table className="w-full text-left">
            <thead className="bg-dark-300 text-14-semibold uppercase text-dark-700">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Last Status</th>
                <th className="px-6 py-4">Deleted At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-400">
              {deletedPatients && deletedPatients.length > 0 ? (
                deletedPatients.map((patient: any) => (
                  <tr key={patient.$id} className="text-14-medium text-dark-700 transition-colors hover:bg-dark-300">
                    <td className="px-6 py-4">{patient.name}</td>
                    <td className="px-6 py-4">
                      <div className="min-w-[115px]">
                        <StatusBadge status={patient.lastStatus} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {patient.deletedAt 
                        ? formatDateTime(new Date(patient.deletedAt)).dateTime 
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <RestoreButton patientId={patient.$id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-dark-700">
                    No deleted patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default BinPage;
