import { Typography, Link, Container } from "@mui/material";
import EditEducationForm from "./edit-education-form";

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
