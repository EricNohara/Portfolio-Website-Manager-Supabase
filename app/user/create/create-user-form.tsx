"use client";
import { Button, TextField, Link } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

import IUser from "@/app/interfaces/IUser";

export default function CreateUserForm() {
  const router = useRouter();
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
    facebook_url: null,
    instagram_url: null,
    bio: null,
    current_position: null,
  });
  const [password, setPassword] = useState("");

  const minPasswordLen: number = parseInt(process.env.MIN_PASSWORD_LEN || "6");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < minPasswordLen) {
      alert("Password must be at least 6 characters long!");
      return;
    }
    try {
      const res = await fetch("/api/internal/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      const resUpdate = await fetch("/api/internal/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const dataUpdate = await resUpdate.json();

      if (!resUpdate.ok) {
        throw new Error(dataUpdate.message);
      }

      alert("Successfully Created User!");
      router.push("/user");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <TextField
        label="Email"
        name="email"
        onChange={handleChange}
        required
        fullWidth
        margin="dense"
        size="small"
      />
      <TextField
        label="Password"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        margin="dense"
        type="password"
        size="small"
      />
      <TextField
        label="Full Name"
        name="name"
        onChange={handleChange}
        required
        fullWidth
        margin="dense"
        size="small"
      />
      <TextField
        label="Phone number"
        name="phone_number"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
      />
      <TextField
        label="Address"
        name="location"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
      />
      <TextField
        label="GitHub URL"
        name="github_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
      />
      <TextField
        label="LinkedIn URL"
        name="linkedin_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
      />
      <TextField
        label="Facebook URL"
        name="facebook_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
      />
      <TextField
        label="Instagram URL"
        name="instagram_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
      />
      <TextField
        label="Bio"
        name="bio"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
      />
      <TextField
        label="Current Position"
        name="current_position"
        onChange={handleChange}
        fullWidth
        margin="dense"
        className="mb-10"
        size="small"
      />
      <Button type="submit" variant="contained" color="primary">
        Create
      </Button>
      <Link
        underline="hover"
        align="center"
        marginTop="1rem"
        href="/user/login"
      >
        Sign In
      </Link>
    </form>
  );
}
