import { z } from "zod";

const apiProblemBodySchema = z
  .object({
    type: z.string().min(1),
    title: z.string().min(1),
    status: z.number().int().min(400).max(599),
    detail: z.string().min(1),
    code: z.string().min(1),
    request_id: z.string().min(1),
    errors: z
      .array(z.object({ path: z.string(), message: z.string().min(1) }).strict())
      .optional(),
  })
  .strict();

export type ApiProblemBody = z.infer<typeof apiProblemBodySchema>;

export class ApiProblem extends Error {
  constructor(public readonly problem: ApiProblemBody) {
    super(problem.detail);
    this.name = "ApiProblem";
  }
}

export async function apiRequest<T>(
  path: string,
  responseSchema: z.ZodType<T>,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.body !== undefined) {
    headers.set("content-type", "application/json");
  }
  if (init.method !== undefined && init.method !== "GET" && init.method !== "HEAD") {
    headers.set("x-operation-id", crypto.randomUUID());
  }

  const response = await fetch(path, { ...init, headers });
  if (!response.ok) {
    const body: unknown = await response.json();
    const problem = apiProblemBodySchema.parse(body);
    throw new ApiProblem(problem);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const body: unknown = await response.json();
  return responseSchema.parse(body);
}
