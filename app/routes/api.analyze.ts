import { createClient } from "@supabase/supabase-js";
import { PDFParse } from "pdf-parse";
import type { Route } from "./+types/api.analyze";

type TipType = "good" | "improve";

type AtsTip = { type: TipType; tip: string };
type DetailedTip = { type: TipType; tip: string; explanation: string };

type Feedback = {
  overallScore: number;
  rubric: {
    roleMatch: number;
    keywordCoverage: number;
    experienceMatch: number;
    impactEvidence: number;
    formattingAndParseability: number;
    writingQuality: number;
  };
  coverage: {
    matchedKeywords: string[];
    missingKeywords: string[];
    matchedRequirements: string[];
    missingRequirements: string[];
  };
  ATS: { score: number; tips: AtsTip[] };
  toneAndStyle: { score: number; tips: DetailedTip[] };
  content: { score: number; tips: DetailedTip[] };
  structure: { score: number; tips: DetailedTip[] };
  skills: { score: number; tips: DetailedTip[] };
};

type RawFeedback = {
  rubric: {
    roleMatch: number;
    keywordCoverage: number;
    experienceMatch: number;
    impactEvidence: number;
    formattingAndParseability: number;
    writingQuality: number;
  };
  coverage: {
    matchedKeywords: string[];
    missingKeywords: string[];
    matchedRequirements: string[];
    missingRequirements: string[];
  };
  ATS: { tips: AtsTip[] };
  toneAndStyle: { tips: DetailedTip[] };
  content: { tips: DetailedTip[] };
  structure: { tips: DetailedTip[] };
  skills: { tips: DetailedTip[] };
};

type AnalyzeRequestBody = {
  path?: unknown;
  message?: unknown;
  jobTitle?: unknown;
  jobDescription?: unknown;
};

const FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    rubric: {
      type: "object",
      additionalProperties: false,
      properties: {
        roleMatch: { type: "number" },
        keywordCoverage: { type: "number" },
        experienceMatch: { type: "number" },
        impactEvidence: { type: "number" },
        formattingAndParseability: { type: "number" },
        writingQuality: { type: "number" },
      },
      required: [
        "roleMatch",
        "keywordCoverage",
        "experienceMatch",
        "impactEvidence",
        "formattingAndParseability",
        "writingQuality",
      ],
    },
    coverage: {
      type: "object",
      additionalProperties: false,
      properties: {
        matchedKeywords: { type: "array", items: { type: "string" } },
        missingKeywords: { type: "array", items: { type: "string" } },
        matchedRequirements: { type: "array", items: { type: "string" } },
        missingRequirements: { type: "array", items: { type: "string" } },
      },
      required: [
        "matchedKeywords",
        "missingKeywords",
        "matchedRequirements",
        "missingRequirements",
      ],
    },
    ATS: {
      type: "object",
      additionalProperties: false,
      properties: {
        tips: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["good", "improve"] },
              tip: { type: "string" },
            },
            required: ["type", "tip"],
          },
        },
      },
      required: ["tips"],
    },
    toneAndStyle: {
      type: "object",
      additionalProperties: false,
      properties: {
        tips: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["good", "improve"] },
              tip: { type: "string" },
              explanation: { type: "string" },
            },
            required: ["type", "tip", "explanation"],
          },
        },
      },
      required: ["tips"],
    },
    content: {
      type: "object",
      additionalProperties: false,
      properties: {
        tips: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["good", "improve"] },
              tip: { type: "string" },
              explanation: { type: "string" },
            },
            required: ["type", "tip", "explanation"],
          },
        },
      },
      required: ["tips"],
    },
    structure: {
      type: "object",
      additionalProperties: false,
      properties: {
        tips: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["good", "improve"] },
              tip: { type: "string" },
              explanation: { type: "string" },
            },
            required: ["type", "tip", "explanation"],
          },
        },
      },
      required: ["tips"],
    },
    skills: {
      type: "object",
      additionalProperties: false,
      properties: {
        tips: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["good", "improve"] },
              tip: { type: "string" },
              explanation: { type: "string" },
            },
            required: ["type", "tip", "explanation"],
          },
        },
      },
      required: ["tips"],
    },
  },
  required: ["rubric", "coverage", "ATS", "toneAndStyle", "content", "structure", "skills"],
} as const;

const FEEDBACK_TEMPLATE = `{
  "rubric": {
    "roleMatch": 0,
    "keywordCoverage": 0,
    "experienceMatch": 0,
    "impactEvidence": 0,
    "formattingAndParseability": 0,
    "writingQuality": 0
  },
  "coverage": {
    "matchedKeywords": ["..."],
    "missingKeywords": ["..."],
    "matchedRequirements": ["..."],
    "missingRequirements": ["..."]
  },
  "ATS": {
    "tips": [
      { "type": "good", "tip": "..." },
      { "type": "improve", "tip": "..." }
    ]
  },
  "toneAndStyle": {
    "tips": [
      { "type": "good", "tip": "...", "explanation": "..." },
      { "type": "improve", "tip": "...", "explanation": "..." }
    ]
  },
  "content": {
    "tips": [
      { "type": "good", "tip": "...", "explanation": "..." },
      { "type": "improve", "tip": "...", "explanation": "..." }
    ]
  },
  "structure": {
    "tips": [
      { "type": "good", "tip": "...", "explanation": "..." },
      { "type": "improve", "tip": "...", "explanation": "..." }
    ]
  },
  "skills": {
    "tips": [
      { "type": "good", "tip": "...", "explanation": "..." },
      { "type": "improve", "tip": "...", "explanation": "..." }
    ]
  }
}`;

const parseRequestedRole = (message: string): { jobTitle: string; jobDescription: string } => {
  const titleMatch = message.match(/The job title is:\s*(.*)/i) || message.match(/Job Title:\s*(.*)/i);
  const descriptionMatch =
    message.match(
      /The job description is:\s*([\s\S]*?)(?:\s*Provide the feedback|\s*Return the analysis|\s*Return one valid JSON object|$)/i,
    ) || message.match(/Job Description:\s*([\s\S]*)/i);

  return {
    jobTitle: titleMatch?.[1]?.trim() || "",
    jobDescription: descriptionMatch?.[1]?.trim() || "",
  };
};

const normalizeInputText = (value: unknown, maxLength: number): string => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

const isSafeStoragePath = (path: string): boolean => {
  if (!path || path.length > 255) return false;
  if (path.startsWith("/") || path.includes("..") || path.includes("\\")) return false;
  return /^[A-Za-z0-9/_\-.]+$/.test(path);
};

const parseBearerToken = (authorizationHeader: string | null): string | null => {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return null;
  return token.trim() || null;
};

const env = (key: string): string | undefined => {
  const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return process.env[key] || viteEnv?.[key];
};

const cleanModelOutput = (raw: string): string =>
  raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

const hasUnclosedJsonStructure = (text: string): boolean => {
  const start = text.indexOf("{");
  if (start === -1) return false;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === "\"") inString = false;
      continue;
    }
    if (ch === "\"") {
      inString = true;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") depth = Math.max(0, depth - 1);
  }

  return inString || depth > 0;
};

const parseJsonFromModelText = (raw: string): RawFeedback => {
  const cleaned = cleanModelOutput(raw);

  try {
    return JSON.parse(cleaned) as RawFeedback;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as RawFeedback;
      } catch {
        // Continue to deeper recovery.
      }
    }

    if (start !== -1) {
      let depth = 0;
      let inString = false;
      let escaped = false;
      for (let i = start; i < cleaned.length; i += 1) {
        const ch = cleaned[i];
        if (inString) {
          if (escaped) escaped = false;
          else if (ch === "\\") escaped = true;
          else if (ch === "\"") inString = false;
          continue;
        }
        if (ch === "\"") {
          inString = true;
          continue;
        }
        if (ch === "{") depth += 1;
        if (ch === "}") {
          depth -= 1;
          if (depth === 0) return JSON.parse(cleaned.slice(start, i + 1)) as RawFeedback;
        }
      }
    }
    const likelyTruncated = hasUnclosedJsonStructure(cleaned);
    throw new Error(
      likelyTruncated
        ? "Invalid JSON returned by model (likely truncated response)."
        : "Invalid JSON returned by model.",
    );
  }
};

const clampScore = (value: unknown): number => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const sanitizeTextList = (items: unknown): string[] => {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const output: string[] = [];

  for (const item of items) {
    if (typeof item !== "string") continue;
    const clean = item.trim();
    if (!clean) continue;

    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(clean);

    if (output.length >= 12) break;
  }

  return output;
};

const sanitizeAtsTips = (tips: unknown): AtsTip[] => {
  const fallback: AtsTip[] = [
    { type: "good", tip: "Resume includes role-relevant details." },
    { type: "improve", tip: "Add more job-description keywords in context." },
  ];
  if (!Array.isArray(tips)) return fallback;

  const output: AtsTip[] = [];
  for (const item of tips) {
    if (typeof item !== "object" || item === null) continue;
    const type = (item as { type?: unknown }).type;
    const tip = (item as { tip?: unknown }).tip;
    if ((type !== "good" && type !== "improve") || typeof tip !== "string") continue;

    const cleanTip = tip.trim();
    if (!cleanTip) continue;

    output.push({ type, tip: cleanTip });
    if (output.length >= 3) break;
  }

  return output.length > 0 ? output : fallback;
};

const sanitizeDetailedTips = (tips: unknown, fallbackTopic: string): DetailedTip[] => {
  const fallback: DetailedTip[] = [
    {
      type: "good",
      tip: `Baseline ${fallbackTopic}`,
      explanation: "The resume includes usable signals, but there is room to be more targeted.",
    },
    {
      type: "improve",
      tip: `Improve ${fallbackTopic}`,
      explanation: "Use more role-specific evidence and tighter wording for better ATS outcomes.",
    },
  ];
  if (!Array.isArray(tips)) return fallback;

  const output: DetailedTip[] = [];
  for (const item of tips) {
    if (typeof item !== "object" || item === null) continue;
    const type = (item as { type?: unknown }).type;
    const tip = (item as { tip?: unknown }).tip;
    const explanation = (item as { explanation?: unknown }).explanation;

    if ((type !== "good" && type !== "improve") || typeof tip !== "string" || typeof explanation !== "string") {
      continue;
    }

    const cleanTip = tip.trim();
    const cleanExplanation = explanation.trim();
    if (!cleanTip || !cleanExplanation) continue;

    output.push({ type, tip: cleanTip, explanation: cleanExplanation });
    if (output.length >= 3) break;
  }

  return output.length > 0 ? output : fallback;
};

const computeScores = (raw: RawFeedback, options?: { hasJobContext?: boolean }): Feedback => {
  const hasJobContext = options?.hasJobContext ?? true;
  const roleMatch = clampScore(raw?.rubric?.roleMatch);
  const keywordCoverage = clampScore(raw?.rubric?.keywordCoverage);
  const experienceMatch = clampScore(raw?.rubric?.experienceMatch);
  const impactEvidence = clampScore(raw?.rubric?.impactEvidence);
  const formattingAndParseability = clampScore(raw?.rubric?.formattingAndParseability);
  const writingQuality = clampScore(raw?.rubric?.writingQuality);
  const effectiveRoleMatch =
    !hasJobContext && roleMatch <= 5
      ? clampScore(Math.round((keywordCoverage + experienceMatch + writingQuality) / 3))
      : roleMatch;

  const missingKeywords = sanitizeTextList(raw?.coverage?.missingKeywords);
  const missingRequirements = sanitizeTextList(raw?.coverage?.missingRequirements);
  const matchedKeywords = sanitizeTextList(raw?.coverage?.matchedKeywords);
  const matchedRequirements = sanitizeTextList(raw?.coverage?.matchedRequirements);

  const missingRequirementPenalty = hasJobContext ? Math.min(24, missingRequirements.length * 4) : 0;
  const missingKeywordPenalty = hasJobContext ? Math.min(12, Math.floor(missingKeywords.length / 4) * 2) : 0;
  const lowAlignmentPenalty = hasJobContext
    ? effectiveRoleMatch < 40
      ? 10
      : effectiveRoleMatch < 55
        ? 5
        : 0
    : 0;

  let atsScore = hasJobContext
    ? Math.round(
      keywordCoverage * 0.4 + formattingAndParseability * 0.25 + effectiveRoleMatch * 0.2 + experienceMatch * 0.15,
    )
    : Math.round(
      formattingAndParseability * 0.4 + writingQuality * 0.25 + keywordCoverage * 0.2 + impactEvidence * 0.15,
    );
  atsScore = clampScore(atsScore - missingRequirementPenalty - missingKeywordPenalty - lowAlignmentPenalty);

  let skillsScore = hasJobContext
    ? Math.round(keywordCoverage * 0.7 + effectiveRoleMatch * 0.3)
    : Math.round(keywordCoverage * 0.55 + experienceMatch * 0.25 + effectiveRoleMatch * 0.2);
  skillsScore = clampScore(skillsScore - (hasJobContext ? Math.min(16, missingRequirementPenalty) : 0));

  let contentScore = hasJobContext
    ? Math.round(impactEvidence * 0.45 + experienceMatch * 0.35 + effectiveRoleMatch * 0.2)
    : Math.round(impactEvidence * 0.5 + experienceMatch * 0.3 + writingQuality * 0.2);
  contentScore = clampScore(contentScore - (hasJobContext ? Math.min(8, Math.floor(missingRequirementPenalty / 2)) : 0));

  const structureScore = clampScore(Math.round(formattingAndParseability * 0.75 + writingQuality * 0.25));
  const toneAndStyleScore = clampScore(Math.round(writingQuality * 0.7 + impactEvidence * 0.3));

  const overallScore = hasJobContext
    ? clampScore(
      Math.round(
        atsScore * 0.35 +
          toneAndStyleScore * 0.1 +
          contentScore * 0.2 +
          structureScore * 0.15 +
          skillsScore * 0.2,
      ),
    )
    : clampScore(
      Math.round(
        atsScore * 0.3 +
          toneAndStyleScore * 0.2 +
          contentScore * 0.25 +
          structureScore * 0.15 +
          skillsScore * 0.1,
      ),
    );

  let atsTips = sanitizeAtsTips(raw?.ATS?.tips);
  if (hasJobContext && missingRequirements.length > 0) {
    const topMissing = missingRequirements.slice(0, 3).join(", ");
    const autoTip = `Address missing requirements: ${topMissing}.`;
    if (!atsTips.some((entry) => entry.type === "improve")) {
      const injectedTip: AtsTip = { type: "improve", tip: autoTip };
      atsTips = [injectedTip, ...atsTips].slice(0, 3);
    }
  }

  return {
    overallScore,
    rubric: {
      roleMatch,
      keywordCoverage,
      experienceMatch,
      impactEvidence,
      formattingAndParseability,
      writingQuality,
    },
    coverage: {
      matchedKeywords,
      missingKeywords,
      matchedRequirements,
      missingRequirements,
    },
    ATS: {
      score: atsScore,
      tips: atsTips,
    },
    toneAndStyle: {
      score: toneAndStyleScore,
      tips: sanitizeDetailedTips(raw?.toneAndStyle?.tips, "tone and style"),
    },
    content: {
      score: contentScore,
      tips: sanitizeDetailedTips(raw?.content?.tips, "content"),
    },
    structure: {
      score: structureScore,
      tips: sanitizeDetailedTips(raw?.structure?.tips, "structure"),
    },
    skills: {
      score: skillsScore,
      tips: sanitizeDetailedTips(raw?.skills?.tips, "skills"),
    },
  };
};

async function callOllama(
  baseUrl: string,
  model: string,
  prompt: string,
  timeoutMs: number,
  options?: { numPredict?: number; numCtx?: number },
): Promise<string> {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/generate`;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: FEEDBACK_SCHEMA,
        options: {
          temperature: 0,
          num_predict: options?.numPredict ?? 900,
          num_ctx: options?.numCtx ?? 3072,
        },
        keep_alive: "30m",
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Ollama request timed out after ${Math.round(timeoutMs / 1000)}s.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }

  if (!res.ok) {
    const body = await res.text();
    console.error("[SkillSight:api.analyze] Ollama request failed", {
      status: res.status,
      statusText: res.statusText,
      body,
      endpoint,
      model,
    });
    if (res.status === 404) {
      throw new Error(`Ollama model not found: ${model}. Run: ollama pull ${model}`);
    }
    throw new Error(`Ollama API error (${res.status}).`);
  }

  const payload = await res.json();
  const text = (payload?.response || "").trim();
  if (!text) throw new Error("Ollama returned an empty response.");
  return text;
}

const buildPrompt = (args: {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  hasJobContext: boolean;
}): string => {
  const roleMatchRule = args.hasJobContext
    ? "- roleMatch: alignment of title/seniority/domain to target role."
    : "- roleMatch: clarity and consistency of the implied role/seniority within the resume.";
  const roleMatchScale = args.hasJobContext
    ? "  0-20 unrelated, 21-40 weak, 41-60 partial, 61-80 good, 81-100 strong."
    : "  0-20 unclear target role, 21-40 weak clarity, 41-60 partial clarity, 61-80 clear, 81-100 very clear.";
  const noJobContextRules = args.hasJobContext
    ? []
    : [
      "No job title/description was provided.",
      "Evaluate using general ATS best practices, clarity, impact, structure, and writing quality.",
      "If no external target role is provided, keep missingKeywords and missingRequirements conservative.",
    ];

  return [
    "You are an ATS and resume evaluator.",
    "Return one valid minified JSON object only.",
    "No markdown, comments, or extra text.",
    "Do not add keys outside the provided template.",
    "",
    "Scoring rubric rules (all integer 0-100):",
    roleMatchRule,
    roleMatchScale,
    "- keywordCoverage: coverage of skills/tools/keywords from job description.",
    "  0-20 very low, 21-40 low, 41-60 moderate, 61-80 good, 81-100 high.",
    "- experienceMatch: alignment of scope and responsibility to role level.",
    "  0-20 none, 21-40 weak, 41-60 partial, 61-80 good, 81-100 strong.",
    "- impactEvidence: quality of quantified outcomes and achievement statements.",
    "  0-20 none, 21-40 limited, 41-60 some, 61-80 strong, 81-100 excellent.",
    "- formattingAndParseability: ATS readability, sectioning, consistency.",
    "  0-20 poor, 21-40 weak, 41-60 acceptable, 61-80 good, 81-100 excellent.",
    "- writingQuality: clarity, grammar, concision, professional tone.",
    "  0-20 poor, 21-40 weak, 41-60 acceptable, 61-80 good, 81-100 excellent.",
    "",
    "Coverage rules:",
    "- matchedKeywords: important JD keywords present in resume.",
    "- missingKeywords: important JD keywords not present in resume.",
    "- matchedRequirements: explicit JD requirements satisfied in resume.",
    "- missingRequirements: explicit JD requirements not evidenced in resume.",
    "- Keep lists concise, deduplicated, and ordered by importance.",
    ...noJobContextRules,
    "",
    "Tips rules:",
    "- ATS.tips: exactly 2 short actionable tips.",
    "- toneAndStyle/content/structure/skills.tips: exactly 2 each.",
    "- Keep each tip concise and each explanation under 24 words.",
    "",
    "Output must match this JSON template shape exactly:",
    FEEDBACK_TEMPLATE,
    "",
    `Job Context Provided: ${args.hasJobContext ? "Yes" : "No"}`,
    `Job Title: ${args.jobTitle || "Not provided"}`,
    "Job Description:",
    args.jobDescription || "Not provided",
    "",
    "Resume Text:",
    args.resumeText,
  ].join("\n");
};

export async function loader() {
  return Response.json({ ok: true });
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody;
    const path = normalizeInputText(body.path, 255);
    if (!path) return Response.json({ error: "Missing path." }, { status: 400 });
    if (!isSafeStoragePath(path)) return Response.json({ error: "Invalid storage path." }, { status: 400 });

    let jobTitle = normalizeInputText(body.jobTitle, 160);
    let jobDescription = normalizeInputText(body.jobDescription, 8000);
    if (!jobTitle && !jobDescription && typeof body.message === "string") {
      const parsed = parseRequestedRole(body.message);
      jobTitle = normalizeInputText(parsed.jobTitle, 160);
      jobDescription = normalizeInputText(parsed.jobDescription, 8000);
    }
    const hasJobContext = Boolean(jobTitle || jobDescription);

    const supabaseUrl = env("VITE_SUPABASE_URL");
    const supabaseServiceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
    const bucket = env("VITE_SUPABASE_STORAGE_BUCKET") || "resumes";
    const ollamaBaseUrl = env("OLLAMA_BASE_URL") || "http://127.0.0.1:11434";
    const ollamaModel = env("OLLAMA_MODEL") || "qwen2.5:7b-instruct";
    const ollamaTimeoutMs = Number(env("OLLAMA_TIMEOUT_MS") || "60000");
    const ollamaNumPredict = Number(env("OLLAMA_NUM_PREDICT") || "900");
    const ollamaNumCtx = Number(env("OLLAMA_NUM_CTX") || "3072");
    const maxResumeChars = Number(env("OLLAMA_MAX_RESUME_CHARS") || "4500");
    const maxResumePages = Number(env("OLLAMA_MAX_RESUME_PAGES") || "1");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return Response.json({ error: "Missing server env vars." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const accessToken = parseBearerToken(request.headers.get("authorization"));
    if (!accessToken) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userData.user) {
      console.error("[SkillSight:api.analyze] auth validation failed", {
        message: userError?.message,
      });
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const ownerPrefix = `${userData.user.id}/`;
    if (!path.startsWith(ownerPrefix)) {
      return Response.json({ error: "Forbidden path for current user." }, { status: 403 });
    }

    const { data: fileBlob, error: downloadError } = await supabase.storage.from(bucket).download(path);
    if (downloadError || !fileBlob) {
      return Response.json({ error: "Failed to read uploaded resume from cloud storage." }, { status: 400 });
    }

    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    let resumeText = "";
    try {
      const pdf = await parser.getText({ first: maxResumePages });
      resumeText = (pdf.text || "").trim();
    } finally {
      await parser.destroy().catch(() => undefined);
    }
    if (!resumeText) return Response.json({ error: "Could not extract text from resume PDF." }, { status: 400 });

    const trimmedResumeText =
      resumeText.length > maxResumeChars ? `${resumeText.slice(0, maxResumeChars)}\n\n[TRUNCATED]` : resumeText;
    const basePrompt = buildPrompt({ jobTitle, jobDescription, resumeText: trimmedResumeText, hasJobContext });

    let rawFeedback: RawFeedback | null = null;
    let lastParseError: unknown = null;
    const basePredict = Math.max(900, ollamaNumPredict);
    const attempts: Array<{ prompt: string; numPredict: number }> = [
      {
        prompt: `${basePrompt}\n\nReturn compact JSON. Exactly 2 tips per section.`,
        numPredict: basePredict,
      },
      {
        prompt:
          `${basePrompt}\n\nIMPORTANT: Return minified valid JSON only. ` +
          `Exactly 2 tips per section. Keep tip <= 12 words and explanation <= 24 words.`,
        numPredict: Math.max(1300, Math.round(basePredict * 1.5)),
      },
      {
        prompt:
          `${basePrompt}\n\nIMPORTANT: Previous output may be truncated. ` +
          `Return a shorter compact JSON object with exactly 2 tips per section.`,
        numPredict: Math.max(1700, Math.round(basePredict * 2)),
      },
      {
        prompt:
          `${basePrompt}\n\nFINAL ATTEMPT: Output exactly one compact minified JSON object only. ` +
          `No extra text. Exactly 2 tips per section.`,
        numPredict: Math.max(2200, Math.round(basePredict * 2.5)),
      },
    ];

    for (let i = 0; i < attempts.length; i += 1) {
      const attempt = attempts[i];
      const output = await callOllama(ollamaBaseUrl, ollamaModel, attempt.prompt, ollamaTimeoutMs, {
        numPredict: attempt.numPredict,
        numCtx: ollamaNumCtx,
      });
      try {
        rawFeedback = parseJsonFromModelText(output);
        break;
      } catch (error) {
        lastParseError = error;
        const cleanedOutput = cleanModelOutput(output);
        const likelyTruncated = hasUnclosedJsonStructure(cleanedOutput);
        console.error("[SkillSight:api.analyze] parse failed", {
          attempt: i + 1,
          numPredict: attempt.numPredict,
          outputChars: output.length,
          likelyTruncated,
          message: error instanceof Error ? error.message : String(error),
          outputPreview: output.slice(0, 500),
        });
      }
    }

    if (!rawFeedback) {
      throw new Error(
        `Model returned invalid JSON after retries. ${
          lastParseError instanceof Error ? lastParseError.message : "Unknown parse error"
        }`,
      );
    }

    const feedback = computeScores(rawFeedback, { hasJobContext });
    return Response.json({ feedback });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze resume.";
    console.error("[SkillSight:api.analyze] unhandled error", {
      message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return Response.json({ error: message }, { status: 500 });
  }
}
