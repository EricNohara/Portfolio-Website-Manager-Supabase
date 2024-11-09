"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button, TextField, Link } from "@mui/material";
import { signup } from "../login/actions";
import { useRouter } from "next/navigation";

export default function CreateUserForm() {
  const supabase = createClient();
  const router = useRouter();
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
      await signup(userData.email, password);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("users")
        .update(userData)
        .eq("id", user?.id);

      if (error) throw error;

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
        size="small"
        type="password"
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
