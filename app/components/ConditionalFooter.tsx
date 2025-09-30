"use client";
import { usePathname } from "next/navigation";
import Footer from "@/app/components/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // List of public routes where footer should show
  const publicRoutes = [
    "/",
    "/pricing",
    "/legal",
    "/legal-hub",
    "/privacy",
    "/terms"
  ];

  const showFooter = publicRoutes.includes(pathname);

  return showFooter ? <Footer /> : null;
}