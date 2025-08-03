import { Typography, Link, Container } from "@mui/material";
import { Suspense } from "react";

import EditSkillForm from "./edit-skill-form";

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
        Edit Skill
      </Typography>
      <Suspense fallback={<div>Loading...</div>}>
        <EditSkillForm />
      </Suspense>
      <Link
        underline="hover"
        align="center"
        marginTop="1rem"
        href="/user/skills"
      >
        Return
      </Link>
    </Container>
  );
}
