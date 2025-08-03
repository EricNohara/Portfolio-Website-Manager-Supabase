"use client";

import { Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";

import ProjectsList from "./projects-list";

export default function WorkExperiencePage() {
  const router = useRouter();

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        component="h2"
        className="text-center"
        fontWeight="bold"
        marginBottom="5%"
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
