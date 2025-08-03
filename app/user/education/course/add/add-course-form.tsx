"use client";

import { Button, TextField } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ICourseInput } from "@/app/interfaces/ICourse";

export default function AddCourseForm() {
  const searchParams = useSearchParams();
  const educationID = searchParams.get("educationID") as string;
  const [course, setCourse] = useState<ICourseInput>({
    name: "",
    grade: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setCourse((prevData) => {
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!course.name.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    const payload = {
      course: course,
      educationID: educationID,
    };

    try {
      const res = await fetch("/api/user/education/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setCourse({ name: "", grade: "", description: "" });

      alert(data.message);
    } catch (err) {
      console.error(err);
      const error = err as Error;
      alert(error.message);
    }
  };

  return (
    <form>
      <TextField
        label="Course Name"
        name="name"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="medium"
        value={course.name}
        required
      ></TextField>
      <TextField
        label="Grade Earned"
        name="grade"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="medium"
        value={course.grade}
      ></TextField>
      <TextField
        multiline
        label="Course Description"
        name="description"
        onChange={handleChange}
        value={course.description}
        fullWidth
        sx={{ marginTop: "0.75rem" }}
      ></TextField>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleSubmit}
        fullWidth
      >
        Add Course
      </Button>
    </form>
  );
}
