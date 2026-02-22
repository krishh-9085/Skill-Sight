import { createClient } from "@supabase/supabase-js";
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
  resumeText?: unknown;
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

type ThinkSetting = boolean | "low" | "medium" | "high";

const resolveThinkSetting = (model: string, rawOverride: string | undefined): ThinkSetting => {
  const override = (rawOverride || "").trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false" || override === "off" || override === "none" || override === "disabled") return false;
  if (override === "low" || override === "medium" || override === "high") return override;

  // GPT-OSS models expect think levels and can spend many tokens on reasoning.
  if (/gpt-oss/i.test(model)) return "low";
  return false;
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

const ATS_STOP_WORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "any",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with",
  "your",
  "you",
  "our",
  "their",
  "this",
  "those",
  "these",
  "will",
  "can",
  "should",
  "must",
  "required",
  "requirement",
  "requirements",
  "preferred",
  "plus",
  "nice",
  "have",
  "has",
  "had",
  "years",
  "year",
  "experience",
  "strong",
  "excellent",
  "ability",
  "abilities",
  "skills",
  "skill",
  "knowledge",
  "role",
  "position",
  "candidate",
  "team",
  "work",
  "working",
  "across",
  "including",
  "etc",
  "other",
  "using",
  "used",
  "use",
  "through",
  "within",
  "across",
  "such",
  "who",
  "what",
  "when",
  "where",
  "why",
  "how",
  "if",
  "while",
  "than",
  "then",
  "also",
  "both",
  "either",
  "each",
  "every",
  "we",
  "they",
  "he",
  "she",
  "them",
  "his",
  "her",
]);

const ATS_GENERIC_KEYWORDS = new Set([
  "communication",
  "collaboration",
  "problem",
  "solving",
  "detail",
  "details",
  "motivated",
  "proactive",
  "dynamic",
  "environment",
  "responsible",
  "responsibilities",
  "support",
  "manage",
  "managing",
  "ability",
  "leadership",
  "stakeholders",
  "business",
  "company",
  "organization",
  "organizational",
  "professional",
  "written",
  "verbal",
]);

type TextMatchContext = {
  normalized: string;
  tokenSet: Set<string>;
};

type AtsHeuristicSignals = {
  keywordScore: number;
  requirementScore: number;
  roleScore: number;
  parseabilityScore: number;
  impactScore: number;
  writingScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedRequirements: string[];
  missingRequirements: string[];
  stats: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    sectionCount: number;
    bulletCount: number;
    quantifiedBulletCount: number;
    dateMentionCount: number;
    wordCount: number;
  };
};

const tokenizeForAts = (text: string): string[] =>
  (text.toLowerCase().match(/[a-z0-9+#.-]{2,}/g) || [])
    .map((token) => token.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((token) => token.length >= 2);

const createTextMatchContext = (text: string): TextMatchContext => {
  const normalized = ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
  const tokenSet = new Set(tokenizeForAts(text).filter((token) => !ATS_STOP_WORDS.has(token)));
  return { normalized, tokenSet };
};

const mergeUniqueLists = (...lists: string[][]): string[] => {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const list of lists) {
    for (const item of list) {
      const clean = item.trim();
      if (!clean) continue;
      const key = clean.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(clean);
    }
  }
  return merged;
};

const formatKeywordLabel = (term: string): string => {
  const clean = term.trim();
  if (!clean) return "";
  if (/^[a-z]{2,4}$/.test(clean)) return clean.toUpperCase();
  return clean;
};

const termAppearsInText = (term: string, context: TextMatchContext): boolean => {
  const termTokens = tokenizeForAts(term).filter((token) => !ATS_STOP_WORDS.has(token));
  if (termTokens.length === 0) return false;
  if (termTokens.length === 1) return context.tokenSet.has(termTokens[0]);

  const phrase = ` ${termTokens.join(" ")} `;
  if (context.normalized.includes(phrase)) return true;

  let hits = 0;
  for (const token of termTokens) {
    if (context.tokenSet.has(token)) hits += 1;
  }
  return hits >= Math.min(2, termTokens.length) && hits / termTokens.length >= 0.6;
};

const detectSeniorityLevel = (text: string): number => {
  const lower = text.toLowerCase();
  if (/\bintern(ship)?\b/.test(lower)) return 1;
  if (/\b(junior|jr\.?)\b/.test(lower)) return 2;
  if (/\b(mid|intermediate)\b/.test(lower)) return 3;
  if (/\b(senior|sr\.?)\b/.test(lower)) return 4;
  if (/\b(lead|manager|head)\b/.test(lower)) return 5;
  if (/\b(staff|principal|director|vp|vice president)\b/.test(lower)) return 6;
  return 0;
};

const pickKeywordCandidates = (jobTitle: string, jobDescription: string): string[] => {
  const titleTokens = tokenizeForAts(jobTitle).filter(
    (token) => !ATS_STOP_WORDS.has(token) && !ATS_GENERIC_KEYWORDS.has(token) && !/^\d+$/.test(token),
  );
  const jdTokens = tokenizeForAts(jobDescription).filter(
    (token) => !ATS_STOP_WORDS.has(token) && !ATS_GENERIC_KEYWORDS.has(token) && !/^\d+$/.test(token),
  );

  const frequency = new Map<string, number>();
  for (const token of jdTokens) {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }
  const sortedByFrequency = [...frequency.entries()]
    .sort((a, b) => (b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0])))
    .map(([token]) => token);

  return mergeUniqueLists(titleTokens, sortedByFrequency).slice(0, 24);
};

const extractRequirementCandidates = (jobDescription: string): string[] => {
  const requirementHints =
    /\b(must|required|requirements?|experience|proficien|knowledge|hands-on|ability|familiar|expertise|certification|degree|strong)\b/i;

  const rawParts = jobDescription
    .split(/\r?\n|;|•/g)
    .map((part) => part.replace(/^[\s\-*•\d.)]+/, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const filtered = rawParts
    .filter((part) => {
      const tokenCount = tokenizeForAts(part).length;
      return tokenCount >= 3 && tokenCount <= 20 && requirementHints.test(part);
    })
    .map((part) => (part.length > 120 ? `${part.slice(0, 117)}...` : part));

  return mergeUniqueLists(filtered).slice(0, 10);
};

const blendScore = (modelScore: number, heuristicScore: number, heuristicWeight: number): number => {
  const weight = Math.max(0, Math.min(1, heuristicWeight));
  return clampScore(Math.round(modelScore * (1 - weight) + heuristicScore * weight));
};

const computeHeuristicSignals = (args: {
  hasJobContext: boolean;
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
}): AtsHeuristicSignals => {
  const resumeContext = createTextMatchContext(args.resumeText);
  const keywordCandidates = pickKeywordCandidates(args.jobTitle, args.jobDescription);

  const matchedKeywords = keywordCandidates
    .filter((term) => termAppearsInText(term, resumeContext))
    .map(formatKeywordLabel);
  const missingKeywords = keywordCandidates
    .filter((term) => !termAppearsInText(term, resumeContext))
    .map(formatKeywordLabel);

  const keywordScore =
    keywordCandidates.length > 0 ? Math.round((matchedKeywords.length / keywordCandidates.length) * 100) : 55;

  const requirementCandidates = extractRequirementCandidates(args.jobDescription);
  const matchedRequirements: string[] = [];
  const missingRequirements: string[] = [];
  for (const req of requirementCandidates) {
    const reqTokens = tokenizeForAts(req).filter(
      (token) => !ATS_STOP_WORDS.has(token) && !ATS_GENERIC_KEYWORDS.has(token),
    );
    if (reqTokens.length === 0) continue;
    let hitCount = 0;
    for (const token of reqTokens) {
      if (resumeContext.tokenSet.has(token)) hitCount += 1;
    }
    const ratio = hitCount / reqTokens.length;
    if (hitCount >= Math.min(2, reqTokens.length) && ratio >= 0.45) matchedRequirements.push(req);
    else missingRequirements.push(req);
  }

  const requirementScore =
    requirementCandidates.length > 0
      ? Math.round((matchedRequirements.length / requirementCandidates.length) * 100)
      : args.hasJobContext
        ? Math.round(keywordScore * 0.75 + 15)
        : 60;

  const titleTokens = tokenizeForAts(args.jobTitle).filter(
    (token) => !ATS_STOP_WORDS.has(token) && !ATS_GENERIC_KEYWORDS.has(token),
  );
  let roleScore = 58;
  if (titleTokens.length > 0) {
    let titleHits = 0;
    for (const token of titleTokens) {
      if (resumeContext.tokenSet.has(token)) titleHits += 1;
    }
    const titleCoverage = titleHits / titleTokens.length;
    const jdSeniority = detectSeniorityLevel(args.jobTitle);
    const resumeSeniority = detectSeniorityLevel(args.resumeText);
    const seniorityPenalty =
      jdSeniority > 0 && resumeSeniority > 0
        ? Math.abs(jdSeniority - resumeSeniority) >= 3
          ? 14
          : Math.abs(jdSeniority - resumeSeniority) >= 2
            ? 8
            : 0
        : 0;
    roleScore = clampScore(Math.round(35 + titleCoverage * 65 - seniorityPenalty));
  }

  const lowerResume = args.resumeText.toLowerCase();
  const lines = args.resumeText.split(/\r?\n/).map((line) => line.trim());
  const bulletLines = lines.filter((line) => /^(?:[-*•]|\d+\.)\s+/.test(line));
  const quantifiedBulletCount = bulletLines.filter((line) =>
    /(?:\$\s?\d[\d,.]*|\d[\d,.]*\s?%|\b\d+\+?\b|\b(?:k|m|b)\b)/i.test(line),
  ).length;
  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(args.resumeText);
  const hasPhone = /(?:\+?\d[\d\s().-]{7,}\d)/.test(args.resumeText);
  const hasLinkedIn = /linkedin\.com\/in\//i.test(args.resumeText);
  const sectionPatterns = [
    /\b(summary|profile)\b/i,
    /\bexperience\b/i,
    /\beducation\b/i,
    /\bskills?\b/i,
    /\bprojects?\b/i,
    /\bcertifications?\b/i,
  ];
  const sectionCount = sectionPatterns.reduce((count, pattern) => count + (pattern.test(lowerResume) ? 1 : 0), 0);
  const dateMentionCount =
    (args.resumeText.match(/\b(?:19|20)\d{2}\b/g) || []).length +
    (args.resumeText.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/gi) || []).length;
  const wordCount = tokenizeForAts(args.resumeText).length;
  const symbolNoiseCount = (args.resumeText.match(/[^\w\s.,;:%$()+\-/#]/g) || []).length;
  const symbolNoiseRatio = symbolNoiseCount / Math.max(1, args.resumeText.length);

  let parseabilityScore = 28;
  if (hasEmail) parseabilityScore += 12;
  if (hasPhone) parseabilityScore += 9;
  if (hasLinkedIn) parseabilityScore += 6;
  parseabilityScore += Math.min(26, sectionCount * 5);
  parseabilityScore += bulletLines.length >= 8 ? 12 : bulletLines.length >= 4 ? 8 : bulletLines.length >= 2 ? 4 : -5;
  parseabilityScore += dateMentionCount >= 4 ? 8 : dateMentionCount >= 2 ? 4 : -4;
  parseabilityScore += wordCount >= 250 && wordCount <= 1200 ? 8 : wordCount >= 140 && wordCount <= 1800 ? 3 : -8;
  if (symbolNoiseRatio > 0.12) parseabilityScore -= 8;
  else if (symbolNoiseRatio > 0.08) parseabilityScore -= 4;
  parseabilityScore = clampScore(parseabilityScore);

  const quantityMentions =
    args.resumeText.match(/(?:\$\s?\d[\d,.]*[kmb]?|\d[\d,.]*\s?%|\b\d+\+?\b)/gi)?.length || 0;
  const actionVerbCount =
    args.resumeText.match(
      /\b(led|built|designed|implemented|improved|increased|reduced|optimized|launched|delivered|automated|managed|created|developed|drove|scaled|achieved)\b/gi,
    )?.length || 0;
  const quantifiedBulletRatio = bulletLines.length > 0 ? quantifiedBulletCount / bulletLines.length : 0;
  let impactScore = 24;
  impactScore += Math.min(40, quantityMentions * 5);
  impactScore += Math.min(18, actionVerbCount * 2);
  impactScore += quantifiedBulletRatio >= 0.4 ? 12 : quantifiedBulletRatio >= 0.2 ? 6 : 0;
  impactScore = clampScore(impactScore);

  const sentences = args.resumeText
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const sentenceCount = Math.max(1, sentences.length);
  const avgWordsPerSentence = wordCount / sentenceCount;
  const longSentenceCount = sentences.filter((sentence) => tokenizeForAts(sentence).length > 32).length;
  const allCapsWords = (args.resumeText.match(/\b[A-Z]{3,}\b/g) || []).length;
  const allCapsRatio = allCapsWords / Math.max(1, wordCount);
  let writingScore = 76;
  writingScore += avgWordsPerSentence >= 10 && avgWordsPerSentence <= 24 ? 8 : avgWordsPerSentence <= 32 ? 2 : -8;
  writingScore -= Math.min(12, longSentenceCount * 3);
  if (allCapsRatio > 0.08) writingScore -= 8;
  if (/[!?]{2,}/.test(args.resumeText)) writingScore -= 5;
  if (wordCount < 120) writingScore -= 8;
  writingScore = clampScore(writingScore);

  return {
    keywordScore,
    requirementScore,
    roleScore,
    parseabilityScore,
    impactScore,
    writingScore,
    matchedKeywords: matchedKeywords.slice(0, 12),
    missingKeywords: missingKeywords.slice(0, 12),
    matchedRequirements: matchedRequirements.slice(0, 8),
    missingRequirements: missingRequirements.slice(0, 8),
    stats: {
      hasEmail,
      hasPhone,
      hasLinkedIn,
      sectionCount,
      bulletCount: bulletLines.length,
      quantifiedBulletCount,
      dateMentionCount,
      wordCount,
    },
  };
};

const computeScores = (
  raw: RawFeedback,
  options?: {
    hasJobContext?: boolean;
    jobTitle?: string;
    jobDescription?: string;
    resumeText?: string;
  },
): Feedback => {
  const hasJobContext = options?.hasJobContext ?? true;
  const jobTitle = options?.jobTitle || "";
  const jobDescription = options?.jobDescription || "";
  const resumeText = options?.resumeText || "";

  const heuristic = computeHeuristicSignals({
    hasJobContext,
    jobTitle,
    jobDescription,
    resumeText,
  });

  const modelRoleMatch = clampScore(raw?.rubric?.roleMatch);
  const modelKeywordCoverage = clampScore(raw?.rubric?.keywordCoverage);
  const modelExperienceMatch = clampScore(raw?.rubric?.experienceMatch);
  const modelImpactEvidence = clampScore(raw?.rubric?.impactEvidence);
  const modelFormatting = clampScore(raw?.rubric?.formattingAndParseability);
  const modelWriting = clampScore(raw?.rubric?.writingQuality);

  const roleMatch = hasJobContext
    ? blendScore(modelRoleMatch, heuristic.roleScore, 0.55)
    : blendScore(modelRoleMatch, heuristic.roleScore, 0.2);
  const keywordCoverage = hasJobContext
    ? blendScore(modelKeywordCoverage, heuristic.keywordScore, 0.62)
    : blendScore(modelKeywordCoverage, heuristic.keywordScore, 0.35);
  const experienceMatch = hasJobContext
    ? blendScore(modelExperienceMatch, heuristic.requirementScore, 0.52)
    : blendScore(modelExperienceMatch, heuristic.impactScore, 0.25);
  const impactEvidence = blendScore(modelImpactEvidence, heuristic.impactScore, 0.45);
  const formattingAndParseability = blendScore(modelFormatting, heuristic.parseabilityScore, 0.62);
  const writingQuality = blendScore(modelWriting, heuristic.writingScore, 0.28);

  const resumeContext = createTextMatchContext(resumeText);
  const jobContext = createTextMatchContext(`${jobTitle}\n${jobDescription}`);
  const modelMatchedKeywords = sanitizeTextList(raw?.coverage?.matchedKeywords).filter(
    (term) => termAppearsInText(term, resumeContext) && (!hasJobContext || termAppearsInText(term, jobContext)),
  );
  const modelMissingKeywords = sanitizeTextList(raw?.coverage?.missingKeywords).filter(
    (term) => (!hasJobContext || termAppearsInText(term, jobContext)) && !termAppearsInText(term, resumeContext),
  );
  const modelMatchedRequirements = sanitizeTextList(raw?.coverage?.matchedRequirements).filter(
    (term) => termAppearsInText(term, resumeContext) && (!hasJobContext || termAppearsInText(term, jobContext)),
  );
  const modelMissingRequirements = sanitizeTextList(raw?.coverage?.missingRequirements).filter(
    (term) => (!hasJobContext || termAppearsInText(term, jobContext)) && !termAppearsInText(term, resumeContext),
  );

  const matchedKeywords = mergeUniqueLists(heuristic.matchedKeywords, modelMatchedKeywords).slice(0, 12);
  const matchedKeywordSet = new Set(matchedKeywords.map((item) => item.toLowerCase()));
  const missingKeywords = mergeUniqueLists(heuristic.missingKeywords, modelMissingKeywords)
    .filter((item) => !matchedKeywordSet.has(item.toLowerCase()))
    .slice(0, 12);

  const matchedRequirements = mergeUniqueLists(heuristic.matchedRequirements, modelMatchedRequirements).slice(0, 8);
  const matchedRequirementSet = new Set(matchedRequirements.map((item) => item.toLowerCase()));
  const missingRequirements = mergeUniqueLists(heuristic.missingRequirements, modelMissingRequirements)
    .filter((item) => !matchedRequirementSet.has(item.toLowerCase()))
    .slice(0, 8);

  const missingRequirementPenalty = hasJobContext ? Math.min(18, missingRequirements.length * 3) : 0;
  const missingKeywordPenalty = hasJobContext ? Math.min(10, Math.floor(missingKeywords.length / 2)) : 0;
  const lowAlignmentPenalty = hasJobContext ? (roleMatch < 35 ? 10 : roleMatch < 50 ? 5 : 0) : 0;
  const structurePenalty = heuristic.stats.sectionCount < 3 ? 6 : 0;
  const contactPenalty = !heuristic.stats.hasEmail || !heuristic.stats.hasPhone ? 6 : 0;

  const modelAtsComposite = hasJobContext
    ? Math.round(keywordCoverage * 0.4 + formattingAndParseability * 0.25 + roleMatch * 0.2 + experienceMatch * 0.15)
    : Math.round(formattingAndParseability * 0.4 + writingQuality * 0.25 + keywordCoverage * 0.2 + impactEvidence * 0.15);
  const evidenceAtsComposite = hasJobContext
    ? Math.round(heuristic.keywordScore * 0.45 + heuristic.parseabilityScore * 0.3 + heuristic.requirementScore * 0.25)
    : Math.round(heuristic.parseabilityScore * 0.45 + heuristic.impactScore * 0.25 + heuristic.writingScore * 0.2 + heuristic.keywordScore * 0.1);

  let atsScore = blendScore(modelAtsComposite, evidenceAtsComposite, hasJobContext ? 0.65 : 0.55);
  atsScore = clampScore(
    atsScore - missingRequirementPenalty - missingKeywordPenalty - lowAlignmentPenalty - structurePenalty - contactPenalty,
  );

  let skillsScore = hasJobContext
    ? Math.round(keywordCoverage * 0.58 + experienceMatch * 0.25 + roleMatch * 0.17)
    : Math.round(keywordCoverage * 0.45 + experienceMatch * 0.25 + roleMatch * 0.3);
  skillsScore = clampScore(skillsScore - Math.min(14, missingRequirementPenalty));

  let contentScore = hasJobContext
    ? Math.round(impactEvidence * 0.45 + experienceMatch * 0.35 + roleMatch * 0.2)
    : Math.round(impactEvidence * 0.5 + experienceMatch * 0.25 + writingQuality * 0.25);
  contentScore = clampScore(contentScore - Math.min(8, Math.floor(missingRequirementPenalty / 2)));

  const structureScore = clampScore(Math.round(formattingAndParseability * 0.8 + writingQuality * 0.2));
  const toneAndStyleScore = clampScore(Math.round(writingQuality * 0.72 + impactEvidence * 0.28));

  const overallScore = hasJobContext
    ? clampScore(
      Math.round(
        atsScore * 0.38 +
          toneAndStyleScore * 0.1 +
          contentScore * 0.2 +
          structureScore * 0.14 +
          skillsScore * 0.18,
      ),
    )
    : clampScore(
      Math.round(
        atsScore * 0.32 +
          toneAndStyleScore * 0.2 +
          contentScore * 0.23 +
          structureScore * 0.15 +
          skillsScore * 0.1,
      ),
    );

  let atsTips = sanitizeAtsTips(raw?.ATS?.tips);
  const autoImproveTips: string[] = [];
  if (hasJobContext && missingRequirements.length > 0) {
    autoImproveTips.push(`Address missing requirements: ${missingRequirements.slice(0, 2).join(", ")}.`);
  }
  if (missingKeywords.length > 0) {
    autoImproveTips.push(`Add job keywords naturally: ${missingKeywords.slice(0, 3).join(", ")}.`);
  }
  if (!heuristic.stats.hasEmail || !heuristic.stats.hasPhone) {
    autoImproveTips.push("Include both email and phone near the header for ATS parsing.");
  }
  if (heuristic.stats.quantifiedBulletCount < 2) {
    autoImproveTips.push("Add quantified outcomes to more experience bullets (%, $, counts).");
  }
  if (heuristic.stats.sectionCount < 4) {
    autoImproveTips.push("Use clear ATS section headers: Summary, Experience, Skills, Education.");
  }

  for (const tip of autoImproveTips) {
    if (!tip) continue;
    if (atsTips.some((entry) => entry.tip.toLowerCase() === tip.toLowerCase())) continue;
    atsTips.push({ type: "improve", tip });
  }
  if (!atsTips.some((entry) => entry.type === "good")) {
    const goodTip =
      matchedKeywords.length >= Math.max(3, missingKeywords.length)
        ? "Resume already includes several role-relevant keywords."
        : "Resume contains a baseline structure ATS can parse.";
    atsTips.unshift({ type: "good", tip: goodTip });
  }
  const dedupedAtsTips: AtsTip[] = [];
  const seenTipKeys = new Set<string>();
  for (const entry of atsTips) {
    const key = `${entry.type}:${entry.tip.trim().toLowerCase()}`;
    if (seenTipKeys.has(key)) continue;
    seenTipKeys.add(key);
    dedupedAtsTips.push(entry);
  }
  atsTips = dedupedAtsTips.slice(0, 3);

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
  options?: { numPredict?: number; numCtx?: number; apiKey?: string; think?: ThinkSetting },
): Promise<string> {
  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, "");
  const endpointFor = (mode: "generate" | "chat"): string => {
    if (new RegExp(`/api/${mode}$`, "i").test(normalizedBaseUrl)) return normalizedBaseUrl;
    if (/\/api$/i.test(normalizedBaseUrl)) return `${normalizedBaseUrl}/${mode}`;
    return `${normalizedBaseUrl}/api/${mode}`;
  };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options?.apiKey) headers.Authorization = `Bearer ${options.apiKey}`;

  const parsePayload = (body: string): unknown => {
    const trimmed = body.trim();
    if (!trimmed) return {};

    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      // Some providers may still return NDJSON chunks despite stream=false.
      const lines = trimmed
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      const parsedChunks: Array<Record<string, unknown>> = [];
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line) as unknown;
          if (parsed && typeof parsed === "object") {
            parsedChunks.push(parsed as Record<string, unknown>);
          }
        } catch {
          // Ignore invalid line and continue.
        }
      }

      if (parsedChunks.length === 0) {
        throw new Error("Ollama returned a non-JSON response.");
      }

      const mergedResponse = parsedChunks
        .map((chunk) => (typeof chunk.response === "string" ? chunk.response : ""))
        .join("")
        .trim();
      const mergedMessageContent = parsedChunks
        .map((chunk) => {
          const message = chunk.message;
          if (!message || typeof message !== "object") return "";
          const content = (message as { content?: unknown }).content;
          return typeof content === "string" ? content : "";
        })
        .join("")
        .trim();

      const lastChunk = parsedChunks[parsedChunks.length - 1];
      const merged: Record<string, unknown> = { ...lastChunk };
      if (mergedResponse) merged.response = mergedResponse;
      if (mergedMessageContent) {
        const lastMessage = lastChunk.message;
        const normalizedMessage =
          lastMessage && typeof lastMessage === "object"
            ? { ...(lastMessage as Record<string, unknown>) }
            : {};
        normalizedMessage.content = mergedMessageContent;
        merged.message = normalizedMessage;
      }
      return merged;
    }
  };

  const extractTextFromPayload = (payload: unknown): string => {
    if (!payload || typeof payload !== "object") return "";
    const record = payload as Record<string, unknown>;

    if (typeof record.response === "string" && record.response.trim()) {
      return record.response.trim();
    }

    if (typeof record.output_text === "string" && record.output_text.trim()) {
      return record.output_text.trim();
    }

    const message = record.message;
    if (message && typeof message === "object") {
      const content = (message as { content?: unknown }).content;
      if (typeof content === "string" && content.trim()) return content.trim();
    }

    const choices = record.choices;
    if (Array.isArray(choices) && choices.length > 0) {
      const firstChoice = choices[0];
      if (firstChoice && typeof firstChoice === "object") {
        const choice = firstChoice as Record<string, unknown>;
        if (typeof choice.text === "string" && choice.text.trim()) return choice.text.trim();
        const choiceMessage = choice.message;
        if (choiceMessage && typeof choiceMessage === "object") {
          const content = (choiceMessage as { content?: unknown }).content;
          if (typeof content === "string" && content.trim()) return content.trim();
        }
      }
    }

    return "";
  };

  const summarizePayload = (payload: unknown): Record<string, unknown> => {
    if (!payload || typeof payload !== "object") return { payloadType: typeof payload };
    const record = payload as Record<string, unknown>;
    const message = record.message;
    const messageContent =
      message && typeof message === "object" ? (message as { content?: unknown }).content : undefined;

    return {
      done: record.done,
      doneReason: record.done_reason,
      evalCount: record.eval_count,
      promptEvalCount: record.prompt_eval_count,
      hasResponse: typeof record.response === "string" && record.response.trim().length > 0,
      hasMessageContent: typeof messageContent === "string" && messageContent.trim().length > 0,
      hasOutputText: typeof record.output_text === "string" && record.output_text.trim().length > 0,
      choiceCount: Array.isArray(record.choices) ? record.choices.length : 0,
      error: record.error,
    };
  };

  const requestOllama = async (
    mode: "generate" | "chat",
    body: Record<string, unknown>,
  ): Promise<unknown> => {
    const endpoint = endpointFor(mode);
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
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

    const responseBody = await res.text();
    if (!res.ok) {
      console.error("[SkillSight:api.analyze] Ollama request failed", {
        mode,
        status: res.status,
        statusText: res.statusText,
        body: responseBody,
        endpoint,
        model,
      });
      if (res.status === 404) {
        if (/ollama\.com/i.test(normalizedBaseUrl)) {
          throw new Error(`Ollama Cloud model not found or unavailable: ${model}.`);
        }
        throw new Error(`Ollama model not found: ${model}. Run: ollama pull ${model}`);
      }
      if (res.status === 401 || res.status === 403) {
        if (/ollama\.com/i.test(normalizedBaseUrl)) {
          throw new Error("Ollama Cloud authentication failed. Check OLLAMA_API_KEY.");
        }
      }
      throw new Error(`Ollama API error (${res.status}).`);
    }

    return parsePayload(responseBody);
  };

  const commonBody = {
    model,
    stream: false,
    format: FEEDBACK_SCHEMA,
    think: options?.think ?? false,
    options: {
      temperature: 0,
      num_predict: options?.numPredict ?? 900,
      num_ctx: options?.numCtx ?? 3072,
    },
    keep_alive: "30m",
  } as const;

  const generatePayload = await requestOllama("generate", {
    ...commonBody,
    prompt,
  });
  const generateText = extractTextFromPayload(generatePayload);
  if (generateText) return generateText;

  console.error("[SkillSight:api.analyze] empty generate payload", {
    endpoint: endpointFor("generate"),
    model,
    payload: summarizePayload(generatePayload),
  });

  const chatPayload = await requestOllama("chat", {
    ...commonBody,
    messages: [{ role: "user", content: prompt }],
  });
  const chatText = extractTextFromPayload(chatPayload);
  if (chatText) return chatText;

  console.error("[SkillSight:api.analyze] empty chat payload", {
    endpoint: endpointFor("chat"),
    model,
    payload: summarizePayload(chatPayload),
  });
  throw new Error(
    "Ollama returned an empty response from both generate and chat endpoints. Check OLLAMA_MODEL availability.",
  );
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
    "Ground every claim in the provided resume text and job description only.",
    "Do not infer hidden experience. If evidence is unclear, mark it as missing.",
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
    "- Only include concrete skills/tools/requirements. Avoid generic terms like team, communication, fast-paced.",
    "- A keyword/requirement can be matched only if explicitly present in resume text.",
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
    const clientResumeText = normalizeInputText(body.resumeText, 20000);
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
    const ollamaApiKey = env("OLLAMA_API_KEY");
    const ollamaModel = env("OLLAMA_MODEL") || "qwen2.5:7b-instruct";
    const ollamaThink = resolveThinkSetting(ollamaModel, env("OLLAMA_THINK_LEVEL"));
    const ollamaTimeoutMs = Number(env("OLLAMA_TIMEOUT_MS") || "60000");
    const ollamaNumPredict = Number(env("OLLAMA_NUM_PREDICT") || "900");
    const ollamaNumCtx = Number(env("OLLAMA_NUM_CTX") || "3072");
    const maxResumeChars = Number(env("OLLAMA_MAX_RESUME_CHARS") || "4500");
    const maxResumePages = Number(env("OLLAMA_MAX_RESUME_PAGES") || "1");
    const modelAwareTimeoutMs = /gpt-oss:120b-cloud/i.test(ollamaModel)
      ? Math.max(120000, ollamaTimeoutMs)
      : ollamaTimeoutMs;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return Response.json({ error: "Missing server env vars." }, { status: 500 });
    }

    if (/ollama\.com/i.test(ollamaBaseUrl) && !ollamaApiKey) {
      return Response.json(
        { error: "Missing OLLAMA_API_KEY for Ollama Cloud requests." },
        { status: 500 },
      );
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

    let resumeText = clientResumeText;
    if (!resumeText) {
      const { data: fileBlob, error: downloadError } = await supabase.storage.from(bucket).download(path);
      if (downloadError || !fileBlob) {
        return Response.json({ error: "Failed to read uploaded resume from cloud storage." }, { status: 400 });
      }

      try {
        const { PDFParse } = await import("pdf-parse");
        const buffer = Buffer.from(await fileBlob.arrayBuffer());
        const parser = new PDFParse({ data: buffer });
        try {
          const pdf = await parser.getText({ first: maxResumePages });
          resumeText = (pdf.text || "").trim();
        } finally {
          await parser.destroy().catch(() => undefined);
        }
      } catch (parseError) {
        const parseMessage = parseError instanceof Error ? parseError.message : String(parseError);
        console.error("[SkillSight:api.analyze] PDF parse failed", {
          message: parseMessage,
          stack: parseError instanceof Error ? parseError.stack : undefined,
        });
        if (/DOMMatrix|@napi-rs\/canvas|pdfjs-dist|legacy\/build\/pdf\.mjs/i.test(parseMessage)) {
          return Response.json(
            {
              error:
                "Server PDF parsing is unavailable in this deployment runtime. Retry upload so client-side text extraction is included.",
            },
            { status: 500 },
          );
        }
        return Response.json({ error: "Failed to extract text from resume PDF." }, { status: 400 });
      }
    }
    if (!resumeText) return Response.json({ error: "Could not extract text from resume PDF." }, { status: 400 });

    const trimmedResumeText =
      resumeText.length > maxResumeChars ? `${resumeText.slice(0, maxResumeChars)}\n\n[TRUNCATED]` : resumeText;
    const basePrompt = buildPrompt({ jobTitle, jobDescription, resumeText: trimmedResumeText, hasJobContext });

    let rawFeedback: RawFeedback | null = null;
    let lastParseError: unknown = null;
    const modelBaselinePredict = /gpt-oss:120b-cloud/i.test(ollamaModel) ? 1400 : /gpt-oss/i.test(ollamaModel) ? 1200 : 900;
    const basePredict = Math.max(modelBaselinePredict, ollamaNumPredict);
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
      const output = await callOllama(ollamaBaseUrl, ollamaModel, attempt.prompt, modelAwareTimeoutMs, {
        apiKey: ollamaApiKey,
        think: ollamaThink,
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

    const feedback = computeScores(rawFeedback, {
      hasJobContext,
      jobTitle,
      jobDescription,
      resumeText,
    });
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
