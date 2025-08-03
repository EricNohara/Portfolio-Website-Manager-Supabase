"use client";

import { Button, TextField } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { ICourseInput } from "@/app/interfaces/ICourse";

export default function EditCoursePage() {
  const searchParams = useSearchParams();
  const educationID = searchParams.get("educationID") as string;
  const courseName = searchParams.get("courseName") as string;

  const router = useRouter();

  const [course, setCourse] = useState<ICourseInput>({
    name: "",
    grade: "",
    description: "",
  });

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch(
          `/api/user/education/course?educationID=${encodeURIComponent(
            educationID
          )}&courseName=${encodeURIComponent(courseName)}`
        );
        const data = await res.json();

        if (!res.ok || data.length === 0) throw new Error(data.message);

        const oldCourse = data[0];

        setCourse({
          name: oldCourse.name,
          grade: oldCourse.grade,
          description: oldCourse.description,
        });
      } catch (err) {
        console.error(err);
        const error = err as Error;
        alert(error.message);
      }
    };

    fetcher();
  }, [educationID, courseName, router]);

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
      courseName: courseName,
    };

    try {
      const res = await fetch("/api/user/education/course", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      router.push(`/user/education/course?educationID=${educationID}`);

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
        Update Course
      </Button>
    </form>
  );
}
