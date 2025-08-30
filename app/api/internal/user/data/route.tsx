import { NextRequest, NextResponse } from "next/server";

import { IUserEducation, IUserInfo } from "@/app/interfaces/IUserInfo";
import { getAuthenticatedUser } from "@/utils/auth/getAuthenticatedUser";

export async function GET(_req: NextRequest): Promise<NextResponse> {
    try {
        const { user, supabase, response } = await getAuthenticatedUser();
        if (!user) return response;

        // get and clean information to add to the userInfo super object that is returned to the user
        const { data: userData, error: userDataError } = await supabase
            .from("users")
            .select()
            .eq("id", user.id);

        if (userDataError) throw userDataError;

        const cleanedUserData = userData.map(({ _id, ...rest }) => rest)[0];

        // skills
        const { data: userSkills, error: userSkillsError } = await supabase
            .from("skills")
            .select()
            .eq("user_id", user.id);

        if (userSkillsError) throw userSkillsError;

        const cleanedUserSkills = userSkills.map(({ _user_id, ...rest }) => rest);

        // experiences
        const { data: userExperience, error: userExperienceError } = await supabase
            .from("work_experiences")
            .select()
            .eq("user_id", user.id);

        if (userExperienceError) throw userExperienceError;

        const cleanedUserExperience = userExperience.map(
            ({ _user_id, ...rest }) => rest
        );

        // projects
        const { data: userProject, error: userProjectError } = await supabase
            .from("projects")
            .select()
            .eq("user_id", user.id);

        if (userProjectError) throw userProjectError;

        const cleanedUserProjects = userProject.map(
            ({ _id, _user_id, ...rest }) => rest
        );

        // education + courses
        const { data: userEducation, error: userEducationError } = await supabase
            .from("education")
            .select()
            .eq("user_id", user.id);

        if (userEducationError) throw userEducationError;

        const userEducationWithCourses: IUserEducation[] = [];

        for (const education of userEducation) {
            const { data: educationCourses, error: educationCoursesError } =
                await supabase
                    .from("course")
                    .select()
                    .eq("user_id", user.id)
                    .eq("education_id", education.id);

            if (educationCoursesError) throw educationCoursesError;

            const cleanedEducationCourses = educationCourses.map(
                ({ _education_id, _user_id, ...rest }) => rest
            );

            const cleanedEducation = {
                degree: education.degree,
                majors: education.majors,
                minors: education.minors,
                gpa: education.gpa,
                institution: education.institution,
                awards: education.awards,
                year_start: education.year_start,
                year_end: education.year_end,
            };

            const educationWithCourses = {
                ...cleanedEducation,
                courses: cleanedEducationCourses,
            };

            userEducationWithCourses.push(educationWithCourses);
        }

        // construct the super object
        const userInfo: IUserInfo = {
            ...cleanedUserData,
            skills: cleanedUserSkills,
            experiences: cleanedUserExperience,
            projects: cleanedUserProjects,
            education: userEducationWithCourses,
        };

        return NextResponse.json({ userInfo }, { status: 200 });
    } catch (err) {
        const error = err as Error;
        console.error(error.message);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
