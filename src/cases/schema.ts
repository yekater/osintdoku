import { z } from "zod";
export const constraintSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("is"),
    entity: z.number().int().nonnegative(),
    category: z.number().int().nonnegative(),
    evidenceId: z.string(),
  }),
  z.object({
    type: z.literal("isNot"),
    entity: z.number().int().nonnegative(),
    category: z.number().int().nonnegative(),
    evidenceId: z.string(),
  }),
  z.object({
    type: z.literal("before"),
    first: z.number().int().nonnegative(),
    second: z.number().int().nonnegative(),
    evidenceId: z.string(),
  }),
  z.object({
    type: z.literal("nextTo"),
    first: z.number().int().nonnegative(),
    second: z.number().int().nonnegative(),
    evidenceId: z.string(),
  }),
]);
export type Constraint = z.infer<typeof constraintSchema>;
export const evidenceSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  date: z.string().optional(),
  image: z.string(),
  observation: z.string(),
  provenance: z.string(),
  status: z.enum(["recreada", "verificada", "en revisión", "no confirmada"]),
  tool: z.string(),
});
export type Evidence = z.infer<typeof evidenceSchema>;
export const caseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string(),
  category: z.string(),
  difficulty: z.enum(["Inicial", "Intermedia", "Avanzada"]),
  estimatedMinutes: z.number(),
  summary: z.string(),
  briefing: z.string(),
  objective: z.string(),
  heroImage: z.string(),
  sceneImage: z.string(),
  resolutionImage: z.string(),
  mechanic: z.enum([
    "claims",
    "timeline",
    "geolocation",
    "provenance",
    "verification",
  ]),
  sourceType: z.enum(["simulation", "adaptation"]),
  visualEvidence: z.array(evidenceSchema).min(3).max(6),
  hotspots: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      x: z.number(),
      y: z.number(),
      evidenceId: z.string(),
      detail: z.string(),
    }),
  ),
  entities: z.array(z.string()).min(3).max(4),
  categories: z.array(z.string()).min(3).max(4),
  entityEvidenceIds: z.array(z.string()).min(3).max(4),
  logicalClues: z.array(
    z.object({ id: z.string(), text: z.string(), evidenceId: z.string() }),
  ),
  constraints: z.array(constraintSchema),
  solution: z.array(z.number().int()),
  hintLevels: z
    .array(
      z.object({ level: z.number(), text: z.string(), evidenceId: z.string() }),
    )
    .length(3),
  verdict: z.object({
    question: z.string(),
    options: z.array(
      z.object({ id: z.string(), text: z.string(), explanation: z.string() }),
    ),
    correctId: z.string(),
  }),
  resolution: z.object({
    conclusion: z.string(),
    decisiveEvidence: z.array(z.string()),
    technique: z.string(),
    realStory: z.string(),
    uncertainty: z.string(),
  }),
  sourceLinks: z.array(z.object({ label: z.string(), url: z.url() })),
  osintTools: z.array(z.object({ name: z.string(), url: z.url() })),
  relatedCourse: z.string(),
  published: z.boolean(),
  featured: z.boolean(),
});
export type Investigation = z.infer<typeof caseSchema>;
