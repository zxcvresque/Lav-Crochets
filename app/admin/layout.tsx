import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Studio — Lav Crochets", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser(await headers());
  if (!user) redirect("/auth/login?redirect=/admin");
  if (!isAdmin(user)) redirect("/account");

  return <AdminShell userName={user.name || user.email}>{children}</AdminShell>;
}
