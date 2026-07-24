import { Suspense } from "react";

import LoadingSpinner from "@/app/components/AsyncButtonWrapper/LoadingSpinner/LoadingSpinner";

import HeadshotPage from "./HeadshotPage";

export default function HeadshotPageWrapper() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeadshotPage />
    </Suspense>
  );
}
