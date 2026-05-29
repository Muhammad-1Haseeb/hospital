"use client";

import {
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { client, DATABASE_ID, APPOINTMENT_COLLECTION_ID } from "@/lib/appwrite.client";
import { decryptKey } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  doctors?: any[];
}



export function DataTable<TData, TValue>({
  columns,
  data,
  doctors,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const adminPasskey = process.env.NEXT_PUBLIC_ADMIN_PASSKEY;
  const encryptedKey =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessKey")
      : null;

  // Real-time Sync with Handshake Guard
  useEffect(() => {
    let unsubscribe: () => void;
    let isMounted = true;

    const initSubscription = async () => {
      try {
        // Handshake delay to ensure WebSocket enters OPEN state
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (!isMounted) return;

        unsubscribe = client.subscribe(
          `databases.${DATABASE_ID}.collections.${APPOINTMENT_COLLECTION_ID}.documents`,
          (response) => {
            console.log("Real-time update received:", response);
            router.refresh();
          }
        );
      } catch (error) {
        console.error("Real-time handshake failed:", error);
      }
    };

    initSubscription();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const accessKey = encryptedKey && decryptKey(encryptedKey);
    // Allow access for Doctors via their own portal too by checking window.location
    const isDoctorPortal = typeof window !== "undefined" && window.location.pathname.startsWith("/doctors");

    if (!isDoctorPortal && (!adminPasskey || accessKey !== adminPasskey)) {
      router.replace("/");
    }
  }, [adminPasskey, encryptedKey, router]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      doctors,
    },
  });

  return (
    <div className="data-table">
      <Table className="shad-table">
        <TableHeader className=" bg-dark-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="shad-table-row-header">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="shad-table-row"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="table-actions">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="shad-gray-btn"
        >
          <Image
            src="/assets/icons/arrow.svg"
            width={24}
            height={24}
            alt="arrow"
          />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="shad-gray-btn"
        >
          <Image
            src="/assets/icons/arrow.svg"
            width={24}
            height={24}
            alt="arrow "
            className="rotate-180"
          />
        </Button>
      </div>
    </div>
  );
}
