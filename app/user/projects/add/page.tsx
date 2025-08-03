import { Typography, Link, Container } from "@mui/material";

import AddProjectForm from "./add-project-form";

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
        Add Project
      </Typography>
      <AddProjectForm />
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
