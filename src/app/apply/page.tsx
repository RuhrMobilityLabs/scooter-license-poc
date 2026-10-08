import type { Metadata } from "next";
import { ApplyWizard } from "@/components/apply-wizard";

export const metadata: Metadata = {
  title: "Apply | Scooter License (PoC)",
};

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <ApplyWizard />
    </div>
  );
}
