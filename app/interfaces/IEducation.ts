export default interface IEducation {
  id: number;
  degree: string;
  majors: string[] | null;
  minors: string[] | null;
  gpa: number | null;
  institution: string;
  awards: string[] | null;
  year_start: number | null;
  year_end: number | null;
}
