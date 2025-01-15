"use client";

import { useState, useEffect } from "react";
import { IProject } from "@/app/interfaces/IProject";
import { Box, Button, Typography, Link } from "@mui/material";
import { useRouter } from "next/navigation";
import formatDate from "@/utils/general/formatDate";

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
        res = await fetch(
          `/api/storage?publicURL=${encodeURIComponent(project.thumbnail_url)}`,
          { method: "DELETE" }
        );
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
          <Typography
            variant="h5"
            component="h5"
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            {`${project.name}`}
          </Typography>
          <Typography component="i" sx={{ textAlign: "center" }}>
            {`${formatDate(project.date_start)} - ${formatDate(
              project.date_end
            )}`}
          </Typography>
          {(project.github_url || project.demo_url) && (
            <Box display="flex" justifyContent="center" gap="5%">
              {project.github_url && (
                <Link
                  underline="hover"
                  align="center"
                  href={project.github_url}
                  target="_blank"
                >
                  GitHub URL
                </Link>
              )}{" "}
              {project.demo_url && (
                <Link
                  underline="hover"
                  align="center"
                  target="_blank"
                  href={project.demo_url}
                >
                  Demo URL
                </Link>
              )}
            </Box>
          )}
          <p>
            <b>Description: </b>
            {project.description}
          </p>
          {project.languages_used && (
            <p>
              <b>Languages Used:</b> {project.languages_used.join(", ")}
            </p>
          )}
          {project.frameworks_used && (
            <p>
              <b>Frameworks Used:</b> {project.frameworks_used.join(", ")}
            </p>
          )}
          {project.technologies_used && (
            <p>
              <b>Technologies Used:</b> {project.technologies_used.join(", ")}
            </p>
          )}
          {project.thumbnail_url && <img src={project.thumbnail_url} />}
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
