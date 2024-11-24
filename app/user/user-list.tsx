"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import { Typography, Link, Button, Box } from "@mui/material";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "next/navigation";

export default function UserList({ user }: { user: User | null }) {
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  useEffect(() => {
    if (user) setIsLoggedIn(true); // Only set the state inside useEffect
  }, [setIsLoggedIn, user]); // Make sure to list setIsLoggedIn as a dependency

  const supabase = createClient();
  const [userData, setUserData] = useState({
    email: "",
    name: "",
    phone_number: "",
    location: "",
    github_url: "",
    linkedin_url: "",
    portrait_url: "",
    resume_url: "",
    transcript_url: "",
  });

  const getProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/user?id=${user?.id}`, { method: "GET" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setUserData(data.userData);
    } catch (error) {
      alert("Error loading user data!");
      console.error(error);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) getProfile();
  }, [user, getProfile]);

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push("/user/edit");
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/deleteUser", { method: "POST" });

      if (!res.ok) {
        alert("Failed to delete user");
      } else {
        setIsLoggedIn(false);
        router.push("/user/login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDocuments = () => {
    router.push("/user/documents");
  };

  return (
    <>
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        className="text-center"
      >
        {userData?.name}
      </Typography>
      <Typography
        variant="body1"
        component="p"
        gutterBottom
        className="text-center"
      >
        {userData?.email}
      </Typography>
      <Typography
        variant="body1"
        component="p"
        gutterBottom
        className="text-center"
      >
        {userData?.phone_number}
      </Typography>
      <Typography
        variant="body1"
        component="p"
        gutterBottom
        className="text-center"
      >
        {userData?.location}
      </Typography>
      {/* Display the URLs as clickable links with a label */}
      {userData?.github_url && (
        <Typography
          variant="body1"
          component="p"
          gutterBottom
          className="text-center"
        >
          <strong>GitHub URL:</strong>{" "}
          <Link
            underline="hover"
            href={userData.github_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {userData.github_url}
          </Link>
        </Typography>
      )}

      {userData?.linkedin_url && (
        <Typography
          variant="body1"
          component="p"
          gutterBottom
          className="text-center"
        >
          <strong>LinkedIn URL:</strong>{" "}
          <Link
            underline="hover"
            href={userData.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {userData.linkedin_url}
          </Link>
        </Typography>
      )}

      {userData?.resume_url && (
        <Typography
          variant="body1"
          component="p"
          gutterBottom
          className="text-center"
        >
          <strong>Resume URL:</strong>{" "}
          <Link
            underline="hover"
            href={userData.resume_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {userData.resume_url}
          </Link>
        </Typography>
      )}

      {userData?.transcript_url && (
        <Typography
          variant="body1"
          component="p"
          gutterBottom
          className="text-center"
        >
          <strong>Transcript URL:</strong>{" "}
          <Link
            underline="hover"
            href={userData.transcript_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {userData.transcript_url}
          </Link>
        </Typography>
      )}

      {userData?.portrait_url && (
        <Typography
          variant="body1"
          component="p"
          gutterBottom
          className="text-center"
        >
          <strong>Portrait URL:</strong>{" "}
          <Link
            underline="hover"
            href={userData.portrait_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {userData.portrait_url}
          </Link>
        </Typography>
      )}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="1rem"
        marginTop="1rem"
      >
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleEdit}
        >
          Edit
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          onClick={handleAddDocuments}
        >
          Documents
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="error"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Box>
    </>
  );
}
