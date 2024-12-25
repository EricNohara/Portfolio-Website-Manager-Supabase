"use client";

import { Typography, Button, Container, Link } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import CourseList from "./course-list";

export default function WorkExperiencePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const educationID = searchParams.get("educationID");

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
        Courses
      </Typography>
      <CourseList />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={() =>
          router.push(`/user/education/course/add?educationID=${educationID}`)
        }
        fullWidth
      >
        Add Course
      </Button>
      <Link underline="hover" href="/user/education" marginTop="1rem">
        Return
      </Link>
    </Container>
  );
}
