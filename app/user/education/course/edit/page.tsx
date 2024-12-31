"use client";

import { Typography, Link, Container } from "@mui/material";
import EditCoursePage from "./edit-course-page";
import { useSearchParams } from "next/navigation";

export default function AddExperiencePage() {
  const searchParams = useSearchParams();
  const educationID = searchParams.get("educationID") as string;

  return (
    <Container
      maxWidth="sm"
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        className="text-center"
      >
        Edit Course
      </Typography>
      <EditCoursePage />
      <Link
        underline="hover"
        align="center"
        marginTop="1rem"
        href={`/user/education/course?educationID=${encodeURIComponent(
          educationID
        )}`}
      >
        Return
      </Link>
    </Container>
  );
}
