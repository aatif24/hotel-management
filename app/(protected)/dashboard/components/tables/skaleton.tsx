import { Card, CardBody, CardHeader, Divider, Skeleton } from "@heroui/react";

export default function TableSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <Card
          key={index}
          className="cursor-pointer transition-transform duration-300 ease-in-out"
        >
          {/* Header */}
          <CardHeader className="flex justify-between items-start min-h-22 bg-default/10">
            <div className="flex flex-col">
              {/* Table number */}
              <Skeleton className="rounded-lg">
                <div className="h-12 w-14 bg-default-300 rounded-lg" />
              </Skeleton>
            </div>

            <div className="flex flex-col items-end gap-2">
              {/* Status chip */}
              <Skeleton className="rounded-full">
                <div className="h-7 w-24 bg-default-300 rounded-full" />
              </Skeleton>

              {/* Waiter name */}
              <Skeleton className="rounded-md">
                <div className="h-4 w-20 bg-default-200 rounded-md" />
              </Skeleton>
            </div>
          </CardHeader>

          {/* Divider */}
          <Divider className="bg-default/50" />

          {/* Body */}
          <CardBody className="flex items-center justify-center">
            <div className="flex justify-between w-full">
              {/* Items */}
              <div className="space-y-1">
                <Skeleton className="rounded-md">
                  <div className="h-3 w-10 bg-default-200 rounded-md" />
                </Skeleton>
                <Skeleton className="rounded-md">
                  <div className="h-6 w-12 bg-default-300 rounded-md" />
                </Skeleton>
              </div>

              {/* Bill */}
              <div className="space-y-1 text-right">
                <Skeleton className="rounded-md ml-auto">
                  <div className="h-3 w-10 bg-default-200 rounded-md" />
                </Skeleton>
                <Skeleton className="rounded-md ml-auto">
                  <div className="h-6 w-16 bg-default-300 rounded-md" />
                </Skeleton>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
