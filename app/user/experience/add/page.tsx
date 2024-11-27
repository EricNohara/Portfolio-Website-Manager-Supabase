import { Typography, Link, Container } from "@mui/material";
import AddExperienceForm from "./add-experience-form";

export default function EditWorkExperiencePage() {
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
        Add Work Experience
      </Typography>
      <AddExperienceForm />
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
