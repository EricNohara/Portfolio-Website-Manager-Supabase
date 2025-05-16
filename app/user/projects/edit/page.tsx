import { Typography, Link, Container } from "@mui/material";
import EditProjectsForm from "./edit-projects-form";
import { Suspense } from "react";

export default function AddExperiencePage() {
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
        Edit Project
      </Typography>
      <Suspense fallback={<div>Loading...</div>}>
        <EditProjectsForm />
      </Suspense>
      <Link
        underline="hover"
        align="center"
        marginTop="1rem"
        href="/user/projects"
      >
        Return
      </Link>
    </Container>
  );
}
