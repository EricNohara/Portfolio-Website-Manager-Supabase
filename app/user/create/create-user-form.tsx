"use client";
import { useState } from "react";
import { Button, TextField, Link } from "@mui/material";
import { useRouter } from "next/navigation";
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
  });
  const [password, setPassword] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/signup", {
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

      const resUpdate = await fetch("/api/user", {
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
      console.error(error);
      alert("Error creating user!");
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
