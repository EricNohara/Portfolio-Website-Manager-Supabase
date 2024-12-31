"use client";

import { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { ICourse } from "@/app/interfaces/ICourse";

export default function ExperienceList() {
  const router = useRouter();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const searchParams = useSearchParams();
  const educationID = searchParams.get("educationID") as string;

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch(
          `/api/user/education/course?educationID=${encodeURIComponent(
            educationID
          )}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();

        if (!res.ok) throw new Error("Failed to retrieve course data");

        setCourses(data);
      } catch (err) {
        alert(err);
      }
    };

    fetcher();
  }, []);

  const handleDelete = async (course: ICourse) => {
    try {
      const res = await fetch(
        `/api/user/education/course?educationID=${encodeURIComponent(
          course.education_id
        )}&courseName=${encodeURIComponent(course.name)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const removedCourses: ICourse[] = courses.filter(
        (c) => c.name !== course.name
      );

      setCourses(removedCourses);
      alert(data.message);
    } catch (err) {
      const error = err as Error;
      console.error(err);
      alert(error);
    }
  };

  return (
    <Box display="flex" flexDirection="column-reverse" width="100%">
      {courses.length > 0 &&
        courses.map((course: ICourse, i: number) => (
          <Box
            display="flex"
            gap="0.5rem"
            padding="1rem"
            key={i}
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Typography variant="h5" component="h1" gutterBottom>
              {course.name}
            </Typography>
            {course.grade && (
              <Typography variant="body1" component="p" gutterBottom>
                {course.grade}
              </Typography>
            )}
            {course.description && (
              <Typography variant="body1" component="p" gutterBottom>
                {course.description}
              </Typography>
            )}
            <Box display="flex" gap="25%">
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                onClick={() =>
                  router.push(
                    `/user/education/course/edit?educationID=${encodeURIComponent(
                      course.education_id
                    )}&courseName=${encodeURIComponent(course.name)}`
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
                  handleDelete(course);
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
