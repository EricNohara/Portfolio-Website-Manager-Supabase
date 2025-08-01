"use client";

import { useEffect, useState } from "react";
import { type User } from "@supabase/supabase-js";
import { Button, TextField, Link } from "@mui/material";
import { useRouter } from "next/navigation";
import IUser from "@/app/interfaces/IUser";

export default function EditUserForm({ user }: { user: User | null }) {
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

  useEffect(() => {
    const fetcher = async () => {
      const res = await fetch("/api/user");
      const data = await res.json();

      if (res.ok) {
        setUserData(data.userData);
      }
    };

    fetcher();
  }, [user]);

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
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      alert(data.message);

      router.push("/user");
    } catch (error) {
      console.error(error);
      alert("Error updating the data!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <TextField
        label="Email"
        name="email"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.email || ""}
        required
      />
      <TextField
        label="Full Name"
        name="name"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.name || ""}
        required
      />
      <TextField
        label="Phone number"
        name="phone_number"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.phone_number || ""}
      />
      <TextField
        label="Address"
        name="location"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.location || ""}
      />
      <TextField
        label="GitHub URL"
        name="github_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.github_url || ""}
      />
      <TextField
        label="LinkedIn URL"
        name="linkedin_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.linkedin_url || ""}
      />
      <TextField
        label="Facebook URL"
        name="facebook_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.facebook_url || ""}
      />
      <TextField
        label="Instagram URL"
        name="instagram_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.instagram_url || ""}
      />
      <TextField
        label="Bio"
        name="bio"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.bio || ""}
      />
      <TextField
        label="Current Position"
        name="current_position"
        onChange={handleChange}
        fullWidth
        margin="dense"
        className="mb-10"
        size="small"
        value={userData.current_position || ""}
      />
      <Button type="submit" variant="contained" color="primary">
        Save Changes
      </Button>
      <Link underline="hover" align="center" marginTop="1rem" href="/user">
        Return
      </Link>
    </form>
  );
}
