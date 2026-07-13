"use client";

import { useSearchParams, useRouter } from "next/navigation";
import CardEditor from "@/components/cardEditor";

export default function CreatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cardId = searchParams.get("id") || undefined;

  return <CardEditor cardId={cardId} onClose={() => router.push("/dashboard")} />;
}