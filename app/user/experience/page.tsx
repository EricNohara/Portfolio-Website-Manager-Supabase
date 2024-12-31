"use client";

import { Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import ExperienceList from "./experience-list";

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
        Work Experience
      </Typography>
      <ExperienceList />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => router.push("/user/experience/add")}
        fullWidth
      >
        Add Work Experience
      </Button>
    </Container>
  );
}
