"use client";

import { useSearchParams, useRouter } from "next/navigation";
import CardEditor from "@/components/cardEditor";
import { Suspense } from "react";

function CreatePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cardId = searchParams.get("id") || undefined;

  return <CardEditor cardId={cardId} onClose={() => router.push("/dashboard")} />;
}

export default function CreatePage() {
  return (
    <Suspense fallback={null}>
      <CreatePageContent />
    </Suspense>
  );
}