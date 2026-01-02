import { Suspense } from "react";
import StatsComponent from "./components/stats";
import TablesComponent from "./components/tables";
import { Divider } from "@heroui/react";
import Title from "@components/title";

export default async function ProtectedPage() {
  return (
    <div className="flex flex-col gap-4">
      <Title className="">Today</Title>
      <Suspense fallback={<div>Loading stats...</div>}>
        <StatsComponent />
      </Suspense>
      <Divider />
      <Title className="">Tables</Title>
      <Suspense fallback={<div>Loading tables...</div>}>
        <TablesComponent />
      </Suspense>
    </div>
  );
}
