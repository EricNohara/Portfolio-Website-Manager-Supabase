"use client";

import { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { IEducation } from "@/app/interfaces/IEducation";

export default function ExperienceList() {
  const router = useRouter();
  const [userEducation, setUserEducation] = useState<IEducation[]>([]);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("/api/user/education", { method: "GET" });
        const data = await res.json();

        if (!res.ok) throw new Error("Failed to retrieve experience data");

        setUserEducation(data);
      } catch (err) {
        alert(err);
      }
    };

    fetcher();
  }, []);

  const handleDelete = async (exp: IEducation) => {
    try {
      const res = await fetch(`/api/user/education?id=${exp.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const removedEducation: IEducation[] = userEducation.filter(
        (e) => e.id !== exp.id
      );
      setUserEducation(removedEducation);
      alert(data.message);
    } catch (err) {
      const error = err as Error;
      console.error(err);
      alert(error);
    }
  };

  return (
    <Box display="flex" flexDirection="column-reverse">
      {userEducation.map((edu: IEducation, i: number) => (
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
            <strong>Institution: </strong>
            {edu.institution}
          </Typography>
          <Typography variant="body1" component="p" gutterBottom>
            <strong>Degree: </strong>
            {edu.degree}
          </Typography>
          {edu.majors.length > 0 && (
            <Typography variant="body1" component="p" gutterBottom>
              <strong>Majors: </strong>
              {edu.majors.join(", ")}
            </Typography>
          )}
          {edu.minors.length > 0 && (
            <Typography variant="body1" component="p" gutterBottom>
              <strong>Minors: </strong>
              {edu.minors.join(", ")}
            </Typography>
          )}
          {edu.gpa && (
            <Typography variant="body1" component="p" gutterBottom>
              <strong>GPA: </strong>
              {edu.gpa}
            </Typography>
          )}
          {edu.year_start && (
            <Typography variant="body1" component="p" gutterBottom>
              <strong>Year Start: </strong>
              {edu.year_start}
            </Typography>
          )}
          {edu.year_end && (
            <Typography variant="body1" component="p" gutterBottom>
              <strong>Year End: </strong>
              {edu.year_end}
            </Typography>
          )}
          {edu.awards.length > 0 && (
            <Typography variant="body1" component="p" gutterBottom>
              <strong>Awards: </strong>
              {edu.awards.join(",")}
            </Typography>
          )}
          <Box display="flex" gap="25%">
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              //   onClick={() =>
              //     router.push(
              //       `/user/education/edit?company=${encodeURIComponent(
              //         exp.company
              //       )}&job_title=${encodeURIComponent(
              //         exp.job_title
              //       )}&date_start=${encodeURIComponent(
              //         exp.date_start || ""
              //       )}&date_end=${encodeURIComponent(
              //         exp.date_end || ""
              //       )}&job_description=${encodeURIComponent(
              //         exp.job_description || ""
              //       )}`
              //     )
              //   }
            >
              Edit
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              fullWidth
              onClick={() => {
                handleDelete(edu);
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
