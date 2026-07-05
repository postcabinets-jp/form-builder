import { z } from 'zod'

// ── Shared primitives ──────────────────────────────────────────────

export const uuidSchema = z.string().uuid()

export const questionTypeSchema = z.enum([
  'text',
  'email',
  'number',
  'select',
  'multi_select',
  'rating',
  'date',
  'file',
])

export const logicOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'contains',
  'greater_than',
  'less_than',
])

// ── Question sub-schemas ───────────────────────────────────────────

export const questionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
})

export const logicConditionSchema = z.object({
  questionId: z.string().min(1),
  operator: logicOperatorSchema,
  value: z.string(),
  jumpToQuestionId: z.union([z.string().min(1), z.literal('end')]),
})

export const questionLogicSchema = z.object({
  conditions: z.array(logicConditionSchema).optional(),
})

// ── Form schemas ───────────────────────────────────────────────────

export const formSettingsSchema = z.object({
  mode: z.enum(['conversational', 'classic']),
  brandColor: z.string().min(1),
  showProgressBar: z.boolean(),
  thankYouMessage: z.string().min(1),
  thankYouRedirectUrl: z.string().url().optional(),
  notificationEmail: z.string().email().optional(),
  webhookUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  backgroundImageUrl: z.string().url().optional(),
})

export const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
})

export const updateFormSchema = z.object({
  formId: uuidSchema,
  updates: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    settings: formSettingsSchema.partial().optional(),
    is_published: z.boolean().optional(),
  }).refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'At least one update field is required' }
  ),
})

export const deleteFormSchema = z.object({
  formId: uuidSchema,
})

export const duplicateFormSchema = z.object({
  formId: uuidSchema,
})

// ── Question schemas ───────────────────────────────────────────────

export const addQuestionSchema = z.object({
  formId: uuidSchema,
  type: questionTypeSchema,
  sortOrder: z.number().int().min(0),
})

export const updateQuestionSchema = z.object({
  questionId: uuidSchema,
  formId: uuidSchema,
  updates: z.object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(2000).optional(),
    required: z.boolean().optional(),
    options: z.array(questionOptionSchema).optional(),
    logic: questionLogicSchema.optional(),
    sort_order: z.number().int().min(0).optional(),
  }).refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'At least one update field is required' }
  ),
})

export const deleteQuestionSchema = z.object({
  questionId: uuidSchema,
  formId: uuidSchema,
})

export const reorderQuestionsSchema = z.object({
  formId: uuidSchema,
  orderedIds: z.array(uuidSchema).min(1),
})

// ── Submission schemas ─────────────────────────────────────────────

/**
 * Json-compatible recursive type for answer values.
 * Matches the Json type from database.ts.
 */
const jsonValueSchema: z.ZodType<
  string | number | boolean | null | { [key: string]: unknown } | unknown[]
> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.record(z.string(), z.unknown()),
  z.array(z.unknown()),
])

export const submitFormSchema = z.object({
  formId: uuidSchema,
  answers: z.record(z.string().uuid(), jsonValueSchema),
  metadata: z.object({
    userAgent: z.string().optional(),
    referrer: z.string().optional(),
  }).optional(),
})

export const exportSubmissionsSchema = z.object({
  formId: uuidSchema,
  format: z.enum(['csv', 'json']),
})

// ── Auth schemas ───────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  next: z.string().nullable().optional(),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required').max(200),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// ── Helper ─────────────────────────────────────────────────────────

/**
 * Run a Zod schema against input data and return either the parsed
 * value or an ActionError. Centralises the safeParse + error-format
 * logic so individual actions stay clean.
 */
export type ActionError = { error: string }

export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join('; ')
    return { success: false, error: messages }
  }
  return { success: true, data: result.data }
}
