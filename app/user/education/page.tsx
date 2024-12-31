"use client";

import { Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import EducationList from "./education-list";

export default function WorkExperiencePage() {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        className="text-center"
      >
        Education
      </Typography>
      <EducationList />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => router.push("/user/education/add")}
        fullWidth
      >
        Add Education
      </Button>
    </Container>
  );
}
