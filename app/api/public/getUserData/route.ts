import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { decrypt } from "@/utils/auth/encrypt";
import { validateKey } from "@/utils/auth/hash";
import { IUserEducation, IUserInfo } from "@/app/interfaces/IUserInfo";

export async function GET(req: NextRequest) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers":
          "Authorization, User-Email, Content-Type, Accept",
      },
    });
  }

  try {
    const supabase = await createServiceRoleClient();

    // get the api key from the authorization header
    const apiKey = req.headers.get("Authorization")?.split(" ")[1];
    const userEmail = req.headers.get("User-Email");

    if (!apiKey)
      throw new Error("Requested data requires a valid private API key");

    if (!userEmail)
      throw new Error("Requested data requires a valid user email");

    // decrypt the api key
    const decryptedKey = decrypt(apiKey);
    if (!decryptedKey) throw new Error("Invalid private API key");

    // retrieve the hashed passkey
    const { data, error } = await supabase
      .from("api_keys")
      .select("hashed_key, user_id")
      .eq("user_email", userEmail);

    if (error) throw error;

    if (!data) throw new Error("Inputted email has no private API key");

    // validate user's key
    const isValid = await validateKey(decryptedKey, data[0].hashed_key);

    if (!isValid) throw new Error("Invalid private API key");

    const userId = data[0].user_id;

    if (!userId) throw new Error("Error retrieiving user ID");

    // get and clean information to add to the userInfo super object that is returned to the user
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select()
      .eq("id", userId);

    if (userDataError) throw userDataError;

    const cleanedUserData = userData.map(({ _id, ...rest }) => rest)[0];

    const { data: userSkills, error: userSkillsError } = await supabase
      .from("skills")
      .select()
      .eq("user_id", userId);

    if (userSkillsError) throw userSkillsError;

    const cleanedUserSkills = userSkills.map(({ _user_id, ...rest }) => rest);

    const { data: userExperience, error: userExperienceError } = await supabase
      .from("work_experiences")
      .select()
      .eq("user_id", userId);

    if (userExperienceError) throw userExperienceError;

    const cleanedUserExperience = userExperience.map(
      ({ _user_id, ...rest }) => rest
    );

    const { data: userProject, error: userProjectError } = await supabase
      .from("projects")
      .select()
      .eq("user_id", userId);

    if (userProjectError) throw userProjectError;

    const cleanedUserProjects = userProject.map(
      ({ _id, _user_id, ...rest }) => rest
    );

    const { data: userEducation, error: userEducationError } = await supabase
      .from("education")
      .select()
      .eq("user_id", userId);

    if (userEducationError) throw userEducationError;

    const userEducationWithCourses: IUserEducation[] = [];

    for (const education of userEducation) {
      const { data: educationCourses, error: educationCoursesError } =
        await supabase
          .from("course")
          .select()
          .eq("user_id", userId)
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

    return NextResponse.json(
      { userInfo },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers":
            "Authorization, User-Email, Content-Type, Accept",
        },
      }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { message: error.message },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers":
            "Authorization, User-Email, Content-Type, Accept",
        },
      }
    );
  }
}
