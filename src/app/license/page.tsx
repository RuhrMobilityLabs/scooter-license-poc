import type { Metadata } from "next";
import { LicenseView } from "@/components/license-view";

export const metadata: Metadata = {
  title: "My license | Scooter License (PoC)",
};

export default function LicensePage() {
  return <LicenseView />;
}
