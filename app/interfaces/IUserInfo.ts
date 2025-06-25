import { ISkillsInput } from "./ISkills";
import { IExperience } from "./IExperience";
import { IProjectInput } from "./IProject";
import { ICourseInput } from "./ICourse";

export interface IUserInfo {
  name: string | null;
  phone_number: string | null;
  email: string;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portrait_url: string | null;
  resume_url: string | null;
  transcript_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  bio: string | null;
  skills: ISkillsInput[];
  experiences: IExperience[];
  projects: IProjectInput[];
  education: IUserEducation[];
}

export interface IUserEducation {
  degree: string;
  majors: string[];
  minors: string[];
  gpa: number | null;
  institution: string;
  awards: string[];
  year_start: number | null;
  year_end: number | null;
  courses: ICourseInput[];
}
