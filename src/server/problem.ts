import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { $ZodIssue } from "zod/v4/core";

export interface FieldProblem {
  path: string;
  message: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  request_id: string;
  errors?: FieldProblem[];
}

export interface ProblemInput {
  status: ContentfulStatusCode;
  title: string;
  detail: string;
  code: string;
  errors?: FieldProblem[];
}

export function problemResponse(requestId: string, input: ProblemInput): Response {
  const body: ProblemDetails = {
    type: `urn:foodie-planner:problem:${input.code}`,
    title: input.title,
    status: input.status,
    detail: input.detail,
    code: input.code,
    request_id: requestId,
    ...(input.errors === undefined ? {} : { errors: input.errors }),
  };

  return new Response(JSON.stringify(body), {
    status: input.status,
    headers: { "content-type": "application/problem+json; charset=UTF-8" },
  });
}

export function zodIssuesToFieldProblems(issues: $ZodIssue[]): FieldProblem[] {
  return issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}
