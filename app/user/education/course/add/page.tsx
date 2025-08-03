"use client";

import { Typography, Link, Container } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import AddCourseForm from "./add-course-form";

function AddCoursePageWrapper() {
  const searchParams = useSearchParams();
  const educationID = searchParams.get("educationID") as string;

  return (<>
    <AddCourseForm />
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
  </>);
}

export default function AddCoursePage() {
  return (
    <Container
      maxWidth="sm"
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography
        variant="h3"
        component="h2"
        className="text-center"
        fontWeight="bold"
        marginBottom="5%"
      >
        Add Course
      </Typography>
      <Suspense fallback={<div>Loading...</div>}>
        <AddCoursePageWrapper />
      </Suspense>
    </Container>
  );
}
