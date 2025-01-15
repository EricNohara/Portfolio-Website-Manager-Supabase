"use client";

import { useState, useEffect } from "react";
import { IProject } from "@/app/interfaces/IProject";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState<IProject[]>([]);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("/api/user/projects", { method: "GET" });
        const data = await res.json();

        if (!res.ok) throw new Error("Failed to retrieve projects data");

        setProjects(data);
      } catch (err) {
        alert(err);
      }
    };

    fetcher();
  }, []);

  const handleDelete = async (project: IProject) => {
    try {
      let res, data;

      // delete project thumbnail from storage if it exists
      if (project.thumbnail_url) {
        res = await fetch(`/api/storage?publicURL=${encodeURIComponent(project.thumbnail_url)}`, {method: "DELETE"});
        data = await res.json();
        if (!res.ok) throw new Error(data.message);
      }

      res = await fetch(`/api/user/projects?projectID=${project.id}`, {
        method: "DELETE",
      });
      data = await res.json();

      if (!res.ok) throw new Error(data.message);
      alert(data.message);

      const removedProjects: IProject[] = projects.filter(
        (p) => p.id !== project.id
      );

      setProjects(removedProjects);
    } catch (err) {
      const error = err as Error;
      console.error(err);
      alert(error);
    }
  };

  return (
    <Box display="flex" flexDirection="column-reverse">
      {projects.map((project: IProject, i: number) => (
        <Box
          display="flex"
          flexDirection="column"
          gap="0.5rem"
          padding="1rem"
          marginBottom="1rem"
          sx={{ border: 1, borderRadius: "0.25rem", borderColor: "#a1a1a1" }}
          key={i}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body1" component="p" gutterBottom>
              {project.name}
            </Typography>
            {/* {skill.proficiency && (
              <Typography variant="body1" component="p" gutterBottom>
                <b>Proficiency: </b>
                {`${skill.proficiency}/10`}
              </Typography>
            )}
            {skill.years_of_experience && (
              <Typography variant="body1" component="p" gutterBottom>
                <b>Experience: </b>
                {`${skill.years_of_experience} years`}
              </Typography> */}
            )}
          </Box>
          <Box display="flex" gap="25%">
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              onClick={() =>
                router.push(
                  `/user/skills/edit?skillName=${encodeURIComponent(
                    project.name
                  )}`
                )
              }
            >
              Edit
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              fullWidth
              onClick={() => {
                handleDelete(project);
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
