"use client";

import { Button, Link } from "@mui/material";
import { useRouter } from "next/navigation";

export default function DocumentsHomePage() {
  const router = useRouter();

  return (
    <>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => router.push("/user/documents/edit")}
      >
        Edit
      </Button>
      <Link underline="hover" href="/user">
        Return
      </Link>
    </>
  );
}
