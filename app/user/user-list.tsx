"use client";

import { useCallback, useEffect, useState } from "react";
import { type User } from "@supabase/supabase-js";
import IUser from "../interfaces/IUser";
import { Typography, Link, Button, Box, Avatar } from "@mui/material";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "next/navigation";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import EmailIcon from "@mui/icons-material/Email";

export default function UserList({ user }: { user: User | null }) {
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  useEffect(() => {
    if (user) setIsLoggedIn(true); // Only set the state inside useEffect
  }, [setIsLoggedIn, user]); // Make sure to list setIsLoggedIn as a dependency

  const [userData, setUserData] = useState<IUser>({
    email: "",
    name: "",
    phone_number: null,
    location: null,
    github_url: null,
    linkedin_url: null,
    portrait_url: null,
    resume_url: null,
    transcript_url: null,
    instagram_url: null,
    facebook_url: null,
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
      const res = await fetch("/api/user", { method: "DELETE" });

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
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          className="text-center"
        >
          {userData?.name}
        </Typography>
        {userData.portrait_url && (
          <Link
            href={userData.portrait_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Avatar
              alt="avatar"
              src={userData.portrait_url}
              sx={{ width: 150, height: 150, marginBottom: "1rem" }}
            />
          </Link>
        )}
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

        <Box display="flex" gap="1rem" margin="1rem">
          {userData?.github_url && (
            <Link
              href={userData.github_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon fontSize="large" sx={{ fontSize: "3rem" }} />
            </Link>
          )}
          {userData?.linkedin_url && (
            <Link
              href={userData.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon fontSize="large" sx={{ fontSize: "3rem" }} />
            </Link>
          )}
          {userData?.facebook_url && (
            <Link
              href={userData.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon fontSize="large" sx={{ fontSize: "3rem" }} />
            </Link>
          )}
          {userData?.instagram_url && (
            <Link
              href={userData.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon fontSize="large" sx={{ fontSize: "3rem" }} />
            </Link>
          )}
          <Link
            href={`mailto:${userData.email}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <EmailIcon fontSize="large" sx={{ fontSize: "3rem" }} />
          </Link>
        </Box>
        {userData?.resume_url && (
          <Typography
            variant="body1"
            component="p"
            gutterBottom
            className="text-center"
          >
            <strong>Resume:</strong>{" "}
            <Link
              underline="hover"
              href={userData.resume_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Click to View
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
            <strong>Transcript:</strong>{" "}
            <Link
              underline="hover"
              href={userData.transcript_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Click to View
            </Link>
          </Typography>
        )}
      </Box>
      <Box display="flex" alignItems="center" gap="1rem" marginTop="1rem">
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
          color="error"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Box>
    </>
  );
}
