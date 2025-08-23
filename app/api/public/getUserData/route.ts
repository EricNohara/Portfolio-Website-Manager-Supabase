import { NextRequest, NextResponse } from "next/server";

import { IUserEducation, IUserInfo } from "@/app/interfaces/IUserInfo";
import { decrypt } from "@/utils/auth/encrypt";
import { validateKey } from "@/utils/auth/hash";
import { createServiceRoleClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  logRequestDetails(req);
  try {
    const supabase = await createServiceRoleClient();

    // get the api key from the authorization header
    const apiKey = req.headers.get("Authorization")?.split(" ")[1];
    const userEmail = req.headers.get("User-Email");

    if (!apiKey || !userEmail) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // decrypt the api key
    const decryptedKey = decrypt(apiKey);
    if (!decryptedKey || typeof decryptedKey !== "string") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // retrieve the hashed passkey
    const { data, error } = await supabase
      .from("api_keys")
      .select("hashed_key, user_id")
      .eq("encrypted_key", apiKey);

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { message: "User data not found" },
        { status: 404 }
      );
    }

    // validate user's key
    const isValid = await validateKey(decryptedKey, data[0].hashed_key);

    if (!isValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = data[0].user_id;

    if (!userId) {
      return NextResponse.json(
        { message: "User id not found" },
        { status: 404 }
      );
    }

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
    console.error(error.message);

    return NextResponse.json(
      { message: "Internal server error" },
      {
        status: 500,
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

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers":
        "Authorization, User-Email, Content-Type, Accept",
    },
  });
}

function logRequestDetails(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const referer = req.headers.get("referer") || "none";
  const origin = req.headers.get("origin") || "none";
  const url = req.url;
  const method = req.method;
  const timestamp = new Date().toISOString();

  console.log("📥 Incoming Request:", {
    method,
    url,
    ip,
    userAgent,
    referer,
    origin,
    timestamp,
  });
}
