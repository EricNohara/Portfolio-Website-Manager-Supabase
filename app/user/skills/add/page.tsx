import { Typography, Link, Container } from "@mui/material";
import AddSkillsForm from "./add-skills-form";

export default function AddExperiencePage() {
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
        Add Skills
      </Typography>
      <AddSkillsForm />
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
