import { Typography, Link, Container } from "@mui/material";
import EditExperienceForm from "./edit-experience-form";
import { Suspense } from "react";

export default function EditExperiencePage() {
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
        Edit Work Experience
      </Typography>
      <Suspense fallback={<div>Loading...</div>}>
        <EditExperienceForm />
      </Suspense>
      <Link
        underline="hover"
        align="center"
        marginTop="1rem"
        href="/user/experience"
      >
        Return
      </Link>
    </Container>
  );
}
