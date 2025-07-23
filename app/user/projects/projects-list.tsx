"use client";

import { useState, useEffect } from "react";
import { IProject } from "@/app/interfaces/IProject";
import { Box, Button, Typography, Link, Collapse, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import formatDate from "@/utils/general/formatDate";

export default function ProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
        <Paper
          key={i}
          sx={{
            marginBottom: "1rem",
            border: 1,
            padding: "1% 5%",
            borderRadius: "0.25rem",
            borderColor: "#a1a1a1",
            cursor: "pointer",
            transition: "box-shadow 0.2s",
            boxShadow: expandedIndex === i ? 3 : 1,
          }}
          onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
        >
          <Box padding="1rem">
            <Typography
              variant="h5"
              component="h5"
              sx={{ fontWeight: "bold", textAlign: "center" }}
            >
              {`${project.name}`}
            </Typography>
            <Collapse in={expandedIndex === i}>
              <Box
                mt={2}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <Typography component="i" sx={{ textAlign: "center" }}>
                  {`${formatDate(project.date_start)} - ${formatDate(
                    project.date_end
                  )}`}
                </Typography>
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
                    <b>Technologies Used:</b>{" "}
                    {project.technologies_used.join(", ")}
                  </p>
                )}
                {(project.github_url || project.demo_url) && (
                  <Box
                    display="flex"
                    width="100%"
                    justifyContent="center"
                    gap="5%"
                  >
                    {project.github_url && (
                      <Link
                        underline="hover"
                        align="center"
                        href={project.github_url}
                        target="_blank"
                        aria-label={`View ${project.name} on GitHub`}
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
                        aria-label={`View ${project.name} Project Demo`}
                      >
                        Demo URL
                      </Link>
                    )}
                  </Box>
                )}
                {project.thumbnail_url && (
                  <img
                    alt="Project Thumbnail"
                    src={project.thumbnail_url}
                    style={{
                      maxHeight: "250px",
                      maxWidth: "100%",
                      height: "auto",
                      width: "auto",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                )}
                <p>
                  <b>Description: </b>
                  {project.description}
                </p>
                <Box display="flex" gap="25%">
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    aria-label={`Edit project ${project.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/user/projects/edit?prevProjectID=${encodeURIComponent(
                          project.id
                        )}`
                      );
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="error"
                    fullWidth
                    aria-label={`Delete project ${project.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
