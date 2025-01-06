export interface ISkillsInput {
  name: string;
  proficiency: number | null;
  years_of_experience: number | null;
}

export interface ISkills extends ISkillsInput {
  user_id: string;
}
