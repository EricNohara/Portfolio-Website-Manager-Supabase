import type IUser from "@/app/interfaces/IUser";

const defaultUser: IUser = {
  email: "",
  name: "",
  phone_number: null,
  current_address: null,
  current_company: null,
  x_url: null,
  github_url: null,
  linkedin_url: null,
  portrait_url: null,
  resume_url: null,
  transcript_url: null,
  instagram_url: null,
  facebook_url: null,
  bio: null,
  current_position: null,
};

export default defaultUser;
