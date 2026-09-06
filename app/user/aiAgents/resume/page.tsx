import { Suspense } from "react";

import LoadingSpinner from "@/app/components/AsyncButtonWrapper/LoadingSpinner/LoadingSpinner";

import ResumePage from "./ResumePage";

export default function ResumePageWrapper() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ResumePage />
        </Suspense>
    );
}
