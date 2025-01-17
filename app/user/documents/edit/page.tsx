import React from "react";
import { Container, Box, Typography } from "@mui/material";
import EditDocumentsForm from "./edit-documents-form";

export default function LoginUserPage() {
  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column">
        <Typography
          variant="h3"
          component="h2"
          className="text-center"
          fontWeight="bold"
          marginBottom="5%"
        >
          Edit Documents
        </Typography>
        <EditDocumentsForm />
      </Box>
    </Container>
  );
}
