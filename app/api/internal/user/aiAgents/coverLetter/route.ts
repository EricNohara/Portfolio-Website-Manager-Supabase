import { randomUUID } from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { ICachedCoverLetter } from "@/app/interfaces/ICachedCoverLetter";
import { IUserInfoInternal } from "@/app/interfaces/IUserInfoInternal";
import { getAuthenticatedUser } from "@/utils/auth/getAuthenticatedUser";
import { requireTier } from "@/utils/auth/requireTier";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

const AGENT_BASE = process.env.COVER_LETTER_AGENT_BASE_URL;

function getNowFormatted() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * GET:
 * - ?mode=list  -> list all cached cover letters (metadata only)
 * - ?sessionId=... -> fetch all drafts for that session (full rows)
 * - Cached cover letters should only be available to premium users - one shot generations should not be saved
 */
export async function GET(req: NextRequest) {
  const { user, response } = await getAuthenticatedUser();
  if (!user) return response;

  const gate = await requireTier(user.id, "premium");
  if (!gate.ok) return gate.response;

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get("mode");
    const sessionId = searchParams.get("sessionId");

    // Case 1: list view (latest draft per conversation)
    if (mode === "list") {
      const { data, error } = await supabase.rpc(
        "get_latest_cached_cover_letters",
      );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Ensure newest-first globally (RPC returns grouped order; this makes UI nice)
      const items = (data ?? []).sort(
        // eslint-disable-next-line
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      return NextResponse.json({ items }, { status: 200 });
    }

    // Case 2: fetch all drafts for a conversation (full rows)
    if (sessionId) {
      const { data, error } = await supabase.rpc(
        "get_cached_cover_letters_by_session",
        { p_session_id: sessionId },
      );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ items: data ?? [] }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Invalid query params." },
      { status: 400 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Types for cover letter agent
type CoverLetterUserInfo = {
  email: string;
  name?: string;
  bio?: string;
  phone_number?: string;
  current_address?: string;
  current_position?: string;
  current_company?: string;

  skills?: string[];

  experiences?: {
    company: string;
    job_title: string;
    job_description: string;
  }[];

  projects?: {
    name: string;
    tech?: string[];
    description: string;
  }[];

  education?: {
    degree: string;
    fields_of_study?: string[];
    institution: string;
    courses?: string[];
  }[];
};

type CoverLetterGenerateRequest = {
  jobTitle: string;
  companyName: string;
  jobDescriptionDump: string;
  writingSample?: string;
};

type CoverLetterAgentPayload = CoverLetterGenerateRequest & {
  userId: string;
  userInfo: CoverLetterUserInfo;
};

type JobInfo = {
  job_title: string;
  work_mode?: "remote" | "hybrid" | "onsite";
  locations?: string[];
  qualifications?: string[];
  responsibilities?: string[];
  technologies?: string[];
  company: {
    name: string;
    industry?: string;
    company_summary?: string;
  };
  hiring_team?: {
    name?: string;
  }[];
};

type WritingAnalysis = {
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
  fleschKincaidGrade: number;
  punctuationComplexity: number;
  textStandard: number;
  tone: {
    formality: "formal" | "casual" | "professional" | "conversational";
    confidence: "tentative" | "assertive" | "persuasive";
    sentiment: "positive" | "neutral" | "negative";
  };
  sentencePatterns: {
    structure: "simple" | "compound" | "complex" | "mixed";
    variedPacing: "low" | "medium" | "high";
  };
  cohesion: {
    paragraphLength: "short" | "medium" | "long";
    connectors: string[];
  };
};

type CoverLetterAgentRevisionPayload = {
  userInfo: CoverLetterUserInfo;
  session: {
    jobData: JobInfo;
    writingAnalysis: WritingAnalysis | null;
    writingSample: string | null;
    currentDraft: string;
  };
  feedback: string;
};

// Helper function
function mapUserInfoForCoverLetter(
  userInfo: IUserInfoInternal,
): CoverLetterUserInfo {
  return {
    email: userInfo.email,
    ...(userInfo.name ? { name: userInfo.name } : {}),
    ...(userInfo.bio ? { bio: userInfo.bio } : {}),
    ...(userInfo.phone_number ? { phone_number: userInfo.phone_number } : {}),
    ...(userInfo.current_address
      ? { current_address: userInfo.current_address }
      : {}),
    ...(userInfo.current_position
      ? { current_position: userInfo.current_position }
      : {}),
    ...(userInfo.current_company
      ? { current_company: userInfo.current_company }
      : {}),

    skills: userInfo.skills.map((skill) => skill.name),

    experiences: userInfo.experiences.map((experience) => ({
      company: experience.company,
      job_title: experience.job_title,
      job_description: experience.job_description ?? "",
    })),

    projects: userInfo.projects.map((project) => ({
      name: project.name,
      description: project.description,
      tech: [
        ...(project.languages_used ?? []),
        ...(project.frameworks_used ?? []),
        ...(project.technologies_used ?? []),
      ],
    })),

    education: userInfo.education.map((education) => ({
      degree: education.degree,
      institution: education.institution,
      fields_of_study: [
        ...(education.majors ?? []),
        ...(education.minors ?? []),
      ],
      courses: education.courses.map((course) => course.name),
    })),
  };
}

// Cover letter generations
export async function POST(req: NextRequest) {
  const { user, supabase, response } = await getAuthenticatedUser();
  if (!user) return response;

  // gate this feature
  const gate = await requireTier(user.id, "premium");
  if (!gate.ok) return gate.response;

  try {
    if (!AGENT_BASE) {
      return NextResponse.json(
        { error: "Server misconfigured: missing COVER_LETTER_AGENT_BASE_URL" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as CoverLetterGenerateRequest;

    if (
      !body.jobTitle?.trim() ||
      !body.companyName?.trim() ||
      !body.jobDescriptionDump?.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required inputs." },
        { status: 400 },
      );
    }

    // build request with cleaned user info
    const { data: internalUserInfo, error: userInfoError } = await supabase.rpc(
      "get_user_info_internal",
      {
        p_user_id: user.id,
      },
    );

    if (userInfoError) {
      console.error("User info RPC failed:", userInfoError);

      return NextResponse.json(
        { error: "Unable to retrieve user information." },
        { status: 500 },
      );
    }

    if (!internalUserInfo) {
      return NextResponse.json(
        { error: "User information was not found." },
        { status: 404 },
      );
    }

    const userInfo = mapUserInfoForCoverLetter(
      internalUserInfo as IUserInfoInternal,
    );

    const agentPayload: CoverLetterAgentPayload = {
      userId: user.id,
      userInfo,
      jobTitle: body.jobTitle.trim(),
      companyName: body.companyName.trim(),
      jobDescriptionDump: body.jobDescriptionDump.trim(),
      ...(body.writingSample?.trim()
        ? { writingSample: body.writingSample.trim() }
        : {}),
    };

    const agentRes = await fetch(`${AGENT_BASE}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agentPayload),
    });

    const data = await agentRes.json().catch(() => null);

    if (!agentRes.ok) {
      return NextResponse.json(
        { error: data?.error ?? "Cover letter generation failed" },
        { status: 502 },
      );
    }

    // insert into cached_cover_letters table
    const draft: string = data?.currentDraft ?? "";
    const jobData = data?.jobData ?? null;
    const writingAnalysis = data?.writingAnalysis ?? null;
    const writingSample = data?.writingSample ?? null;
    const skillsMatchScore = data?.skillsMatchScore ?? null;

    let sessionId: string | null = null;

    // store the generation as a session
    if (draft && jobData) {
      sessionId = randomUUID();
      const sessionPayload = {
        id: sessionId,
        user_id: user.id,
        job_data: jobData,
        current_draft: draft,
        writing_analysis: writingAnalysis,
        writing_sample: writingSample?.trim() ? writingSample : null,
      };

      const { error } = await supabase
        .from("cover_letter_sessions")
        .insert(sessionPayload);

      if (error) throw new Error(`Session insert failed: ${error.message}`);
    }

    // cache the cover letter generation only if a session insert occurred
    if (sessionId && skillsMatchScore) {
      const cachedCoverLetterPayload: ICachedCoverLetter = {
        user_id: user.id,
        job_title: agentPayload.jobTitle,
        company_name: agentPayload.companyName,
        session_id: sessionId,
        draft_name: `First Draft: ${getNowFormatted()}`,
        education_score: skillsMatchScore.education,
        experience_score: skillsMatchScore.experience,
        skills_score: skillsMatchScore.skills,
        projects_score: skillsMatchScore.projects,
        location_score: skillsMatchScore.location,
        overall_score: skillsMatchScore.overall,
        education_score_exp: skillsMatchScore.explanations.education,
        experience_score_exp: skillsMatchScore.explanations.experience,
        skills_score_exp: skillsMatchScore.explanations.skills,
        projects_score_exp: skillsMatchScore.explanations.projects,
        location_score_exp: skillsMatchScore.explanations.location,
        draft,
      };

      const { error } = await supabase
        .from("cached_cover_letters")
        .insert(cachedCoverLetterPayload);

      if (error) throw new Error(`DB insert failed: ${error.message}`);
    }

    // return the session id and all the cover letter data
    return NextResponse.json({ ...data, sessionId }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Cover letter revisions
export async function PUT(req: NextRequest) {
  const { user, supabase, response } = await getAuthenticatedUser();
  if (!user) return response;

  // gate this feature
  const gate = await requireTier(user.id, "premium");
  if (!gate.ok) return gate.response;

  try {
    if (!AGENT_BASE) {
      return NextResponse.json(
        { error: "Server misconfigured: missing COVER_LETTER_AGENT_BASE_URL" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as {
      sessionId?: string;
      feedback?: string;
    };

    const sessionId: string = body?.sessionId ?? "";
    if (!sessionId.trim()) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }
    const feedback: string = body?.feedback ?? "";
    if (!feedback.trim()) {
      return NextResponse.json({ error: "Missing feedback" }, { status: 400 });
    }

    const { data: internalUserInfo, error: userInfoError } = await supabase.rpc(
      "get_user_info_internal",
      {
        p_user_id: user.id,
      },
    );

    if (userInfoError) {
      console.error("User info RPC failed:", userInfoError);
      return NextResponse.json(
        { error: "Unable to retrieve user information." },
        { status: 500 },
      );
    }

    if (!internalUserInfo) {
      return NextResponse.json(
        { error: "User information was not found." },
        { status: 404 },
      );
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from("cover_letter_sessions")
      .select("job_data, writing_analysis, writing_sample, current_draft")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (sessionError) {
      console.error("Cover letter session lookup failed:", sessionError);
      return NextResponse.json(
        { error: "Unable to retrieve the cover letter session." },
        { status: 500 },
      );
    }

    if (!sessionData) {
      return NextResponse.json(
        { error: "Cover letter session was not found." },
        { status: 404 },
      );
    }

    const agentPayload: CoverLetterAgentRevisionPayload = {
      userInfo: mapUserInfoForCoverLetter(
        internalUserInfo as IUserInfoInternal,
      ),
      session: {
        jobData: sessionData.job_data as JobInfo,
        writingAnalysis:
          (sessionData.writing_analysis as WritingAnalysis | null) ?? null,
        writingSample: sessionData.writing_sample ?? null,
        currentDraft: sessionData.current_draft,
      },
      feedback: feedback.trim(),
    };

    const agentRes = await fetch(`${AGENT_BASE}/revise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agentPayload),
    });

    const data = await agentRes.json().catch(() => null);

    if (!agentRes.ok) {
      return NextResponse.json(
        { error: data?.error ?? "Cover letter revision failed" },
        { status: 502 },
      );
    }

    const revisedDraft: string = data?.revisedDraft ?? "";
    const draftName: string = data?.draftName ?? "";

    if (!revisedDraft.trim() || !draftName.trim()) {
      return NextResponse.json(
        { error: "An error occurred while revising the draft" },
        { status: 500 },
      );
    }

    // insert into cached_cover_letters table
    const { data: savedRow, error: rpcError } = await supabase.rpc(
      "save_cover_letter_revision",
      {
        p_session_id: sessionId,
        p_draft_name: `${draftName}: ${getNowFormatted()}`,
        p_revised_draft: revisedDraft,
      },
    );

    if (rpcError) {
      throw new Error(`Revision save failed: ${rpcError.message}`);
    }

    return NextResponse.json(
      {
        revisedDraft,
        draftName,
        sessionId,
        cachedCoverLetter: savedRow,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
