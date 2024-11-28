import { Typography, Link, Container } from "@mui/material";
import EditEducationForm from "./edit-education-form";

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
        Edit Education
      </Typography>
      <EditEducationForm />
      <Link
        underline="hover"
        align="center"
        marginTop="1rem"
        href="/user/education"
      >
        Return
      </Link>
    </Container>
  );
}
