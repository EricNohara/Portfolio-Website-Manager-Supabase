import { Typography, Link, Container } from "@mui/material";
import EditExperienceForm from "./edit-experience-form";

export default function EditExperiencePage() {
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
        Edit Work Experience
      </Typography>
      <EditExperienceForm />
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
