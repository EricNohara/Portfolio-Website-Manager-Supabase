"use client";

import { useCallback, useEffect, useState } from "react";
import { type User } from "@supabase/supabase-js";
import IUser from "../interfaces/IUser";
import {
  Typography,
  Link,
  Button,
  Box,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
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
    bio: null,
  });

  const [userMetadata, setUserMetadata] = useState({
    num_experience: 0,
    num_education: 0,
    num_skills: 0,
    num_projects: 0,
  });

  const getProfile = useCallback(async () => {
    try {
      let res, data;
      res = await fetch("/api/user");
      data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setUserData(data.userData);

      const metadata = {
        num_experience: 0,
        num_education: 0,
        num_skills: 0,
        num_projects: 0,
      };

      res = await fetch("/api/user/education?count=true");
      data = await res.json();
      metadata.num_education = data.count;

      res = await fetch("/api/user/experience?count=true");
      data = await res.json();
      metadata.num_experience = data.count;

      res = await fetch("/api/user/skills?count=true");
      data = await res.json();
      metadata.num_skills = data.count;

      res = await fetch("/api/user/projects?count=true");
      data = await res.json();
      metadata.num_projects = data.count;

      setUserMetadata(metadata);
    } catch (error) {
      alert("Error loading user data!");
      console.error(error);
    }
  }, []);

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

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setIsLoggedIn(false);

      alert(data.message);

      router.push("/user/login");
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography
        variant="h3"
        component="h2"
        className="text-center"
        fontWeight="bold"
        marginBottom="5%"
      >
        {userData?.name}
      </Typography>
      {userData.portrait_url ? (
        <Link
          href={userData.portrait_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Avatar
            alt="avatar"
            src={userData.portrait_url}
            sx={{ width: 150, height: 150 }}
          />
        </Link>
      ) : (
        <Avatar sx={{ width: 150, height: 150 }}>
          {userData.name && userData.name[0]}
        </Avatar>
      )}
      <Box
        display="flex"
        flexDirection="column"
        margin="1rem"
        fontStyle="italic"
        alignItems="center"
      >
        <Typography>{userData?.location}</Typography>
        <Typography>{userData?.email}</Typography>
        <Typography>{userData?.phone_number}</Typography>
        {userData?.bio && (
          <Card sx={{ minWidth: 275, maxWidth: 400, mt: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Bio
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-line" }}
              >
                {userData.bio}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
      {userData?.resume_url && (
        <Box display="flex" gap="0.5rem">
          <b>Resume:</b>
          <Link
            underline="hover"
            href={userData.resume_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Click to View
          </Link>
        </Box>
      )}
      {userData?.transcript_url && (
        <Box display="flex" gap="0.5rem">
          <b>Transcript:</b>
          <Link
            underline="hover"
            href={userData.transcript_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Click to View
          </Link>
        </Box>
      )}
      <Box display="flex" gap="0.5rem">
        <b>{userMetadata.num_education} Educations: </b>
        <Link href="/user/education" underline="hover">
          {userMetadata.num_education > 0 ? "Click to View" : "Click to Add"}
        </Link>
      </Box>
      <Box display="flex" gap="0.5rem">
        <b>{userMetadata.num_experience} Experiences: </b>
        <Link href="/user/experiences" underline="hover">
          {userMetadata.num_experience > 0 ? "Click to View" : "Click to Add"}
        </Link>
      </Box>
      <Box display="flex" gap="0.5rem">
        <b>{userMetadata.num_projects} Projects: </b>
        <Link href="/user/projects" underline="hover">
          {userMetadata.num_projects > 0 ? "Click to View" : "Click to Add"}
        </Link>
      </Box>
      <Box display="flex" gap="0.5rem">
        <b>{userMetadata.num_skills} Skills: </b>
        <Link href="/user/skills" underline="hover">
          {userMetadata.num_skills > 0 ? "Click to View" : "Click to Add"}
        </Link>
      </Box>
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
    </Box>
  );
}
