"use client";

import { useState, useEffect } from "react";
import { IExperience } from "@/app/interfaces/IExperience";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ExperienceList() {
  const router = useRouter();
  const [userExperiences, setUserExperiences] = useState<IExperience[]>([]);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("/api/user/experience", { method: "GET" });
        const data = await res.json();

        if (!res.ok) throw new Error("Failed to retrieve experience data");

        setUserExperiences(data);
      } catch (err) {
        alert(err);
      }
    };

    fetcher();
  }, []);

  const handleDelete = async (exp: IExperience) => {
    try {
      const res = await fetch(
        `/api/user/experience?company=${exp.company}&job_title=${exp.job_title}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(data.message);

      const removedExperiences: IExperience[] = userExperiences.filter(
        (e) => e.company !== exp.company || e.job_title != exp.job_title
      );
      setUserExperiences(removedExperiences);
    } catch (err) {
      const error = err as Error;
      console.error(err);
      alert(error);
    }
  };

  return (
    <Box display="flex" flexDirection="column-reverse">
      {userExperiences.map((exp: IExperience, i: number) => (
        <Box
          display="flex"
          flexDirection="column"
          gap="0.5rem"
          padding="1rem"
          marginBottom="1rem"
          sx={{ border: 1, borderRadius: "0.25rem", borderColor: "#a1a1a1" }}
          key={i}
        >
          <Typography variant="body1" component="p" gutterBottom>
            <strong>Company: </strong>
            {exp.company}
          </Typography>
          <Typography variant="body1" component="p" gutterBottom>
            <strong>Job Title: </strong>
            {exp.job_title}
          </Typography>
          {exp.date_start && (
            <Typography variant="body1" component="p" gutterBottom>
              <strong>Start Date: </strong>
              {exp.date_start}
            </Typography>
          )}
          {exp.date_end && (
            <Typography variant="body1" component="p" gutterBottom>
              <strong>End Date: </strong>
              {exp.date_end}
            </Typography>
          )}
          {exp.job_description && (
            <Typography variant="body1" component="p" gutterBottom>
              <strong>Job Description: </strong>
              {exp.job_description}
            </Typography>
          )}
          <Box display="flex" gap="25%">
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
            >
              Edit
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              fullWidth
              onClick={() => {
                handleDelete(exp);
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
