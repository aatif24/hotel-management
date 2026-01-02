import { Suspense } from "react";
import StatsComponent from "./components/stats";
import TablesComponent from "./components/tables";

export default async function ProtectedPage() {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<div>Loading stats...</div>}>
        <StatsComponent />
      </Suspense>
      <Suspense fallback={<div>Loading tables...</div>}>
        <TablesComponent />
      </Suspense>
    </div>
  );
}
