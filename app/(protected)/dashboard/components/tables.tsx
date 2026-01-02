"use client";
import { Chip, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Check, Clock05Icon, WaiterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Table } from "@prisma/client";
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TablesComponent() {
  const { data, error, isLoading } = useSWR(`/api/tables`, fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-5 gap-4">
      {data?.data?.map((table: Table) => {
        return (
          <Card
            key={table.id}
            className={`border-${table.status == "occupied" ? "warning" : "success"}-100`}
          >
            <CardHeader
              className={`flex justify-between items-start bg-${table.status == "occupied" ? "warning" : "success"}/10  text-${table.status == "occupied" ? "warning" : "success"}-800 min-h-22`}
            >
              <div className="flex flex-col">
                <p className="text-6xl font-bold">{table.number}</p>
              </div>
              <div>
                <Chip
                  startContent={
                    <HugeiconsIcon
                      icon={table.status == "occupied" ? Clock05Icon : Check}
                      className="size-6"
                    />
                  }
                  variant="flat"
                  color={table.status == "occupied" ? "warning" : "success"}
                >
                  <span className="capitalize">{table.status}</span>
                </Chip>

                <p className="flex gap-1 items-center justify-center">
                  <HugeiconsIcon icon={WaiterIcon} className="size-4" /> Jane
                  Doe
                </p>
              </div>
            </CardHeader>
            <Divider
              className={`bg-${table.status == "occupied" ? "warning" : "success"}/50`}
            />
            <CardBody>
              <p>Status: Occupied</p>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
