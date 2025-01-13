"use client";

import { Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import ProjectsList from "./projects-list";

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
        Projects
      </Typography>
      <ProjectsList />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => router.push("/user/projects/add")}
        fullWidth
      >
        Add Projects
      </Button>
    </Container>
  );
}
