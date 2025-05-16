"use client";

import { useEffect, useState } from "react";
import { Button, TextField, Box, Input, Typography } from "@mui/material";
import { IProjectInput } from "@/app/interfaces/IProject";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import { compressImage } from "@/utils/file-upload/compress";
import { uploadThumbnail } from "@/utils/file-upload/upload";
import { useSearchParams } from "next/navigation";

export default function EditProjectsForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [project, setProject] = useState<IProjectInput>({
    name: "",
    date_start: "",
    date_end: "",
    languages_used: null,
    frameworks_used: null,
    technologies_used: null,
    description: "",
    github_url: null,
    demo_url: null,
    thumbnail_url: null,
  });

  useEffect(() => {
    const fetcher = async () => {
      try {
        const prevProjectID = params.get("prevProjectID");
        if (!prevProjectID) throw new Error("Invalid previous project ID");

        const res = await fetch(
          `/api/user/projects?projectID=${encodeURIComponent(prevProjectID)}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setProject(data[0]);
      } catch (err) {
        const error = err as Error;
        console.error(error.message);
        alert(error.message);
        router.push("/user/projects");
      }
    };

    fetcher();
  }, [params, router]);

  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProject((prevData) => {
      if (
        ["languages_used", "frameworks_used", "technologies_used"].includes(
          name
        )
      ) {
        return {
          ...prevData,
          [name]: value ? value.split(",").map((item) => item) : null,
        };
      }
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const handleDateChange = (field: string, value: Dayjs | null) => {
    setProject((prevData) => ({
      ...prevData,
      [field]: value ? value.format("YYYY-MM-DD") : null, // Convert Dayjs to Date or store null
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile: File | null = e.target.files?.[0] || null;
    setThumbnail(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project.name.trim() || !project.description.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    if (!project.date_start || !project.date_end) {
      alert("Please fill out the date start and date end fields.");
      return;
    }

    const projectData = { ...project };
    let res, data;

    // save the project thumbnail if one is provided
    if (thumbnail) {
      // if there is already a thumbnail, delete it from storage
      if (project.thumbnail_url) {
        res = await fetch(
          `/api/storage?publicURL=${encodeURIComponent(project.thumbnail_url)}`,
          { method: "DELETE" }
        );
        data = await res.json();

        if (!res.ok) throw new Error(data.message);
      }

      let publicURL = null;
      const compressedThumbnail = await compressImage(thumbnail);
      publicURL = (await uploadThumbnail(
        compressedThumbnail,
        "project_thumbnails"
      )) as string;

      if (publicURL === "") {
        alert("Error uploading selected thumbnail file");
      }

      projectData.thumbnail_url = publicURL;
    }

    const payload = {
      prevProjectID: params.get("prevProjectID"),
      updatedProject: projectData,
    };

    try {
      res = await fetch("/api/user/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(data.message);

      router.push("/user/projects");
    } catch (err) {
      console.error(err);
      const error = err as Error;
      alert(error.message);
    }
  };

  return (
    <form>
      <TextField
        label="Project Name"
        name="name"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="medium"
        value={project.name}
        required
      ></TextField>
      <Box display="flex" justifyContent="space-between" marginTop="0.5rem">
        <DatePicker
          label="Start Date"
          name="date_start"
          value={project.date_start ? dayjs(project.date_start) : null}
          onChange={(val) => handleDateChange("date_start", val)}
        ></DatePicker>
        <DatePicker
          label="End Date"
          name="date_end"
          value={project.date_end ? dayjs(project.date_end) : null}
          onChange={(val) => handleDateChange("date_end", val)}
        ></DatePicker>
      </Box>
      <TextField
        label="Description"
        name="description"
        onChange={handleChange}
        fullWidth
        multiline
        required
        margin="dense"
        size="medium"
        value={project.description || ""}
      ></TextField>
      <TextField
        label="Github URL"
        name="github_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="medium"
        value={project.github_url || ""}
      ></TextField>
      <TextField
        label="Demo URL"
        name="demo_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="medium"
        value={project.demo_url || ""}
      ></TextField>
      <TextField
        label="Programming Languages Used (Separated by Comma)"
        name="languages_used"
        onChange={handleChange}
        fullWidth
        multiline
        margin="dense"
        size="medium"
        value={project.languages_used || ""}
      ></TextField>
      <TextField
        label="Frameworks Used (Separated by Comma)"
        name="frameworks_used"
        onChange={handleChange}
        fullWidth
        multiline
        margin="dense"
        size="medium"
        value={project.frameworks_used || ""}
      ></TextField>
      <TextField
        label="Technologies Used (Separated by Comma)"
        name="technologies_used"
        onChange={handleChange}
        fullWidth
        multiline
        margin="dense"
        size="medium"
        value={project.technologies_used || ""}
      ></TextField>
      <Box
        display="flex"
        flexDirection="column"
        gap="0.5rem"
        padding="1rem"
        marginTop="0.5rem"
        sx={{
          border: 1,
          borderRadius: "0.25rem",
          borderColor: "#bdbdbd",
          "&:hover": { borderColor: "black" },
        }}
      >
        <Typography variant="h6" sx={{ fontSize: "1rem", color: "#595959" }}>
          Project Thumbnail Upload (Image Only)
        </Typography>
        <Input
          type="file"
          name="thumbnail"
          inputProps={{ accept: "image/*" }}
          fullWidth
          onChange={handleFileChange}
        />
      </Box>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleSubmit}
        fullWidth
      >
        Update Project
      </Button>
    </form>
  );
}
