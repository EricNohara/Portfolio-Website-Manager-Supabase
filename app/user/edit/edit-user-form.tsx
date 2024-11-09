"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import { Button, TextField, Link } from "@mui/material";
import { useRouter } from "next/navigation";

export default function EditUserForm({ user }: { user: User | null }) {
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

  const getProfile = useCallback(async () => {
    try {
      const { data, error, status } = await supabase
        .from("users")
        .select()
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        const parsedData = {
          email: data.email,
          name: data.name,
          phone_number: data.phone_number,
          location: data.location,
          github_url: data.github_url,
          linkedin_url: data.linkedin_url,
          portrait_url: data.portrait_url,
          resume_url: data.resume_url,
          transcript_url: data.transcript_url,
        };
        setUserData(parsedData);
      }
    } catch (error) {
      alert("Error loading user data!");
      console.error(error);
    }
  }, [user, supabase]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

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
      const { error } = await supabase
        .from("users")
        .update(userData)
        .eq("id", user?.id);

      if (error) throw error;

      alert("Profile updated!");
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
        value={userData.email}
      />
      <TextField
        label="Full Name"
        name="name"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.name}
      />
      <TextField
        label="Phone number"
        name="phone_number"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.phone_number}
      />
      <TextField
        label="Address"
        name="location"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.location}
      />
      <TextField
        label="GitHub URL"
        name="github_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="small"
        value={userData.github_url}
      />
      <TextField
        label="LinkedIn URL"
        name="linkedin_url"
        onChange={handleChange}
        fullWidth
        margin="dense"
        className="mb-10"
        size="small"
        value={userData.linkedin_url}
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
