import { describe, it, expect } from 'vitest'
import {
  uuidSchema,
  questionTypeSchema,
  logicOperatorSchema,
  questionOptionSchema,
  logicConditionSchema,
  questionLogicSchema,
  formSettingsSchema,
  createFormSchema,
  updateFormSchema,
  deleteFormSchema,
  duplicateFormSchema,
  addQuestionSchema,
  updateQuestionSchema,
  deleteQuestionSchema,
  reorderQuestionsSchema,
  submitFormSchema,
  exportSubmissionsSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  validate,
} from '@/lib/validations'

// ── Helpers ──────────────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const VALID_UUID_2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

function expectPass(schema: { safeParse: (d: unknown) => { success: boolean } }, data: unknown) {
  expect(schema.safeParse(data).success).toBe(true)
}
function expectFail(schema: { safeParse: (d: unknown) => { success: boolean } }, data: unknown) {
  expect(schema.safeParse(data).success).toBe(false)
}

// ── uuidSchema ───────────────────────────────────────────────────────

describe('uuidSchema', () => {
  it('accepts a valid v4 UUID', () => {
    expectPass(uuidSchema, VALID_UUID)
  })

  it('accepts another valid UUID', () => {
    expectPass(uuidSchema, VALID_UUID_2)
  })

  it('rejects an empty string', () => {
    expectFail(uuidSchema, '')
  })

  it('rejects a non-UUID string', () => {
    expectFail(uuidSchema, 'not-a-uuid')
  })

  it('rejects a UUID missing one character', () => {
    expectFail(uuidSchema, '550e8400-e29b-41d4-a716-44665544000') // 35 chars
  })

  it('rejects a number', () => {
    expectFail(uuidSchema, 12345)
  })

  it('rejects null', () => {
    expectFail(uuidSchema, null)
  })
})

// ── questionTypeSchema ───────────────────────────────────────────────

describe('questionTypeSchema', () => {
  const validTypes = ['text', 'email', 'number', 'select', 'multi_select', 'rating', 'date', 'file']

  it.each(validTypes)('accepts "%s"', (type) => {
    expectPass(questionTypeSchema, type)
  })

  it('rejects an unknown type', () => {
    expectFail(questionTypeSchema, 'checkbox')
  })

  it('rejects empty string', () => {
    expectFail(questionTypeSchema, '')
  })

  it('rejects number', () => {
    expectFail(questionTypeSchema, 1)
  })
})

// ── logicOperatorSchema ──────────────────────────────────────────────

describe('logicOperatorSchema', () => {
  const validOps = ['equals', 'not_equals', 'contains', 'greater_than', 'less_than']

  it.each(validOps)('accepts "%s"', (op) => {
    expectPass(logicOperatorSchema, op)
  })

  it('rejects unknown operator', () => {
    expectFail(logicOperatorSchema, 'starts_with')
  })
})

// ── questionOptionSchema ─────────────────────────────────────────────

describe('questionOptionSchema', () => {
  it('accepts a valid option', () => {
    expectPass(questionOptionSchema, { id: 'opt1', label: 'Yes', value: 'yes' })
  })

  it('rejects empty id', () => {
    expectFail(questionOptionSchema, { id: '', label: 'Yes', value: 'yes' })
  })

  it('rejects empty label', () => {
    expectFail(questionOptionSchema, { id: 'opt1', label: '', value: 'yes' })
  })

  it('rejects empty value', () => {
    expectFail(questionOptionSchema, { id: 'opt1', label: 'Yes', value: '' })
  })

  it('rejects missing fields', () => {
    expectFail(questionOptionSchema, { id: 'opt1' })
  })

  it('rejects non-object input', () => {
    expectFail(questionOptionSchema, 'not-an-object')
  })
})

// ── logicConditionSchema ─────────────────────────────────────────────

describe('logicConditionSchema', () => {
  it('accepts a valid condition with string jumpToQuestionId', () => {
    expectPass(logicConditionSchema, {
      questionId: 'q1',
      operator: 'equals',
      value: 'yes',
      jumpToQuestionId: 'q2',
    })
  })

  it('accepts "end" as jumpToQuestionId', () => {
    expectPass(logicConditionSchema, {
      questionId: 'q1',
      operator: 'not_equals',
      value: '',
      jumpToQuestionId: 'end',
    })
  })

  it('allows empty string for value', () => {
    expectPass(logicConditionSchema, {
      questionId: 'q1',
      operator: 'contains',
      value: '',
      jumpToQuestionId: 'q3',
    })
  })

  it('rejects empty questionId', () => {
    expectFail(logicConditionSchema, {
      questionId: '',
      operator: 'equals',
      value: 'yes',
      jumpToQuestionId: 'q2',
    })
  })

  it('rejects empty jumpToQuestionId (not "end")', () => {
    expectFail(logicConditionSchema, {
      questionId: 'q1',
      operator: 'equals',
      value: 'yes',
      jumpToQuestionId: '',
    })
  })

  it('rejects invalid operator', () => {
    expectFail(logicConditionSchema, {
      questionId: 'q1',
      operator: 'invalid_op',
      value: 'yes',
      jumpToQuestionId: 'q2',
    })
  })
})

// ── questionLogicSchema ──────────────────────────────────────────────

describe('questionLogicSchema', () => {
  it('accepts empty conditions array', () => {
    expectPass(questionLogicSchema, { conditions: [] })
  })

  it('accepts omitted conditions', () => {
    expectPass(questionLogicSchema, {})
  })

  it('accepts valid conditions', () => {
    expectPass(questionLogicSchema, {
      conditions: [
        { questionId: 'q1', operator: 'equals', value: 'a', jumpToQuestionId: 'q2' },
      ],
    })
  })

  it('rejects invalid condition inside array', () => {
    expectFail(questionLogicSchema, {
      conditions: [{ questionId: '', operator: 'equals', value: '', jumpToQuestionId: '' }],
    })
  })
})

// ── formSettingsSchema ───────────────────────────────────────────────

describe('formSettingsSchema', () => {
  const validSettings = {
    mode: 'conversational' as const,
    brandColor: '#ff0000',
    showProgressBar: true,
    thankYouMessage: 'Thank you!',
  }

  it('accepts minimal valid settings', () => {
    expectPass(formSettingsSchema, validSettings)
  })

  it('accepts all optional URLs', () => {
    expectPass(formSettingsSchema, {
      ...validSettings,
      thankYouRedirectUrl: 'https://example.com/thanks',
      notificationEmail: 'admin@example.com',
      webhookUrl: 'https://hooks.example.com/hook',
      logoUrl: 'https://cdn.example.com/logo.png',
      backgroundImageUrl: 'https://cdn.example.com/bg.jpg',
    })
  })

  it('accepts "classic" mode', () => {
    expectPass(formSettingsSchema, { ...validSettings, mode: 'classic' })
  })

  it('rejects unknown mode', () => {
    expectFail(formSettingsSchema, { ...validSettings, mode: 'wizard' })
  })

  it('rejects empty brandColor', () => {
    expectFail(formSettingsSchema, { ...validSettings, brandColor: '' })
  })

  it('rejects empty thankYouMessage', () => {
    expectFail(formSettingsSchema, { ...validSettings, thankYouMessage: '' })
  })

  it('rejects non-boolean showProgressBar', () => {
    expectFail(formSettingsSchema, { ...validSettings, showProgressBar: 'yes' })
  })

  it('rejects invalid thankYouRedirectUrl', () => {
    expectFail(formSettingsSchema, { ...validSettings, thankYouRedirectUrl: 'not-a-url' })
  })

  it('rejects invalid notificationEmail', () => {
    expectFail(formSettingsSchema, { ...validSettings, notificationEmail: 'not-email' })
  })

  it('rejects invalid webhookUrl', () => {
    expectFail(formSettingsSchema, { ...validSettings, webhookUrl: 'not-a-url' })
  })
})

// ── createFormSchema ─────────────────────────────────────────────────

describe('createFormSchema', () => {
  it('accepts a valid title', () => {
    expectPass(createFormSchema, { title: 'My Form' })
  })

  it('accepts a title at max length (200)', () => {
    expectPass(createFormSchema, { title: 'x'.repeat(200) })
  })

  it('rejects empty title', () => {
    expectFail(createFormSchema, { title: '' })
  })

  it('rejects title over 200 chars', () => {
    expectFail(createFormSchema, { title: 'x'.repeat(201) })
  })

  it('rejects missing title', () => {
    expectFail(createFormSchema, {})
  })
})

// ── updateFormSchema ─────────────────────────────────────────────────

describe('updateFormSchema', () => {
  it('accepts updating title only', () => {
    expectPass(updateFormSchema, {
      formId: VALID_UUID,
      updates: { title: 'New Title' },
    })
  })

  it('accepts updating description only', () => {
    expectPass(updateFormSchema, {
      formId: VALID_UUID,
      updates: { description: 'A description' },
    })
  })

  it('accepts updating is_published', () => {
    expectPass(updateFormSchema, {
      formId: VALID_UUID,
      updates: { is_published: true },
    })
  })

  it('accepts partial settings', () => {
    expectPass(updateFormSchema, {
      formId: VALID_UUID,
      updates: { settings: { mode: 'classic' } },
    })
  })

  it('rejects empty updates object', () => {
    expectFail(updateFormSchema, {
      formId: VALID_UUID,
      updates: {},
    })
  })

  it('rejects invalid formId', () => {
    expectFail(updateFormSchema, {
      formId: 'bad-id',
      updates: { title: 'X' },
    })
  })

  it('rejects title over 200 chars', () => {
    expectFail(updateFormSchema, {
      formId: VALID_UUID,
      updates: { title: 'x'.repeat(201) },
    })
  })

  it('rejects description over 2000 chars', () => {
    expectFail(updateFormSchema, {
      formId: VALID_UUID,
      updates: { description: 'x'.repeat(2001) },
    })
  })
})

// ── deleteFormSchema / duplicateFormSchema ────────────────────────────

describe('deleteFormSchema', () => {
  it('accepts valid UUID', () => {
    expectPass(deleteFormSchema, { formId: VALID_UUID })
  })

  it('rejects invalid UUID', () => {
    expectFail(deleteFormSchema, { formId: 'nope' })
  })
})

describe('duplicateFormSchema', () => {
  it('accepts valid UUID', () => {
    expectPass(duplicateFormSchema, { formId: VALID_UUID })
  })

  it('rejects missing formId', () => {
    expectFail(duplicateFormSchema, {})
  })
})

// ── addQuestionSchema ────────────────────────────────────────────────

describe('addQuestionSchema', () => {
  it('accepts a valid question', () => {
    expectPass(addQuestionSchema, { formId: VALID_UUID, type: 'text', sortOrder: 0 })
  })

  it('accepts sortOrder = 0 (boundary)', () => {
    expectPass(addQuestionSchema, { formId: VALID_UUID, type: 'email', sortOrder: 0 })
  })

  it('accepts large sortOrder', () => {
    expectPass(addQuestionSchema, { formId: VALID_UUID, type: 'rating', sortOrder: 9999 })
  })

  it('rejects negative sortOrder', () => {
    expectFail(addQuestionSchema, { formId: VALID_UUID, type: 'text', sortOrder: -1 })
  })

  it('rejects float sortOrder', () => {
    expectFail(addQuestionSchema, { formId: VALID_UUID, type: 'text', sortOrder: 1.5 })
  })

  it('rejects invalid type', () => {
    expectFail(addQuestionSchema, { formId: VALID_UUID, type: 'unknown', sortOrder: 0 })
  })

  it('rejects invalid formId', () => {
    expectFail(addQuestionSchema, { formId: 'bad', type: 'text', sortOrder: 0 })
  })
})

// ── updateQuestionSchema ─────────────────────────────────────────────

describe('updateQuestionSchema', () => {
  it('accepts updating title', () => {
    expectPass(updateQuestionSchema, {
      questionId: VALID_UUID,
      formId: VALID_UUID_2,
      updates: { title: 'What is your name?' },
    })
  })

  it('accepts updating required flag', () => {
    expectPass(updateQuestionSchema, {
      questionId: VALID_UUID,
      formId: VALID_UUID_2,
      updates: { required: true },
    })
  })

  it('accepts updating options', () => {
    expectPass(updateQuestionSchema, {
      questionId: VALID_UUID,
      formId: VALID_UUID_2,
      updates: {
        options: [
          { id: 'a', label: 'Option A', value: 'a' },
          { id: 'b', label: 'Option B', value: 'b' },
        ],
      },
    })
  })

  it('accepts updating logic', () => {
    expectPass(updateQuestionSchema, {
      questionId: VALID_UUID,
      formId: VALID_UUID_2,
      updates: {
        logic: {
          conditions: [
            { questionId: 'q1', operator: 'equals', value: 'yes', jumpToQuestionId: 'end' },
          ],
        },
      },
    })
  })

  it('accepts updating sort_order', () => {
    expectPass(updateQuestionSchema, {
      questionId: VALID_UUID,
      formId: VALID_UUID_2,
      updates: { sort_order: 5 },
    })
  })

  it('rejects empty updates', () => {
    expectFail(updateQuestionSchema, {
      questionId: VALID_UUID,
      formId: VALID_UUID_2,
      updates: {},
    })
  })

  it('rejects title over 500 chars', () => {
    expectFail(updateQuestionSchema, {
      questionId: VALID_UUID,
      formId: VALID_UUID_2,
      updates: { title: 'x'.repeat(501) },
    })
  })

  it('rejects description over 2000 chars', () => {
    expectFail(updateQuestionSchema, {
      questionId: VALID_UUID,
      formId: VALID_UUID_2,
      updates: { description: 'x'.repeat(2001) },
    })
  })

  it('rejects negative sort_order', () => {
    expectFail(updateQuestionSchema, {
      questionId: VALID_UUID,
      formId: VALID_UUID_2,
      updates: { sort_order: -1 },
    })
  })
})

// ── deleteQuestionSchema ─────────────────────────────────────────────

describe('deleteQuestionSchema', () => {
  it('accepts valid UUIDs', () => {
    expectPass(deleteQuestionSchema, { questionId: VALID_UUID, formId: VALID_UUID_2 })
  })

  it('rejects invalid questionId', () => {
    expectFail(deleteQuestionSchema, { questionId: 'bad', formId: VALID_UUID })
  })

  it('rejects invalid formId', () => {
    expectFail(deleteQuestionSchema, { questionId: VALID_UUID, formId: 'bad' })
  })
})

// ── reorderQuestionsSchema ───────────────────────────────────────────

describe('reorderQuestionsSchema', () => {
  it('accepts a valid reorder payload', () => {
    expectPass(reorderQuestionsSchema, {
      formId: VALID_UUID,
      orderedIds: [VALID_UUID, VALID_UUID_2],
    })
  })

  it('accepts single-element array', () => {
    expectPass(reorderQuestionsSchema, {
      formId: VALID_UUID,
      orderedIds: [VALID_UUID],
    })
  })

  it('rejects empty orderedIds array', () => {
    expectFail(reorderQuestionsSchema, {
      formId: VALID_UUID,
      orderedIds: [],
    })
  })

  it('rejects non-UUID in orderedIds', () => {
    expectFail(reorderQuestionsSchema, {
      formId: VALID_UUID,
      orderedIds: ['not-a-uuid'],
    })
  })
})

// ── submitFormSchema ─────────────────────────────────────────────────

describe('submitFormSchema', () => {
  it('accepts valid submission with string answer', () => {
    expectPass(submitFormSchema, {
      formId: VALID_UUID,
      answers: { [VALID_UUID]: 'My answer' },
    })
  })

  it('accepts numeric answer value', () => {
    expectPass(submitFormSchema, {
      formId: VALID_UUID,
      answers: { [VALID_UUID]: 42 },
    })
  })

  it('accepts boolean answer value', () => {
    expectPass(submitFormSchema, {
      formId: VALID_UUID,
      answers: { [VALID_UUID]: true },
    })
  })

  it('accepts null answer value', () => {
    expectPass(submitFormSchema, {
      formId: VALID_UUID,
      answers: { [VALID_UUID]: null },
    })
  })

  it('accepts object answer value', () => {
    expectPass(submitFormSchema, {
      formId: VALID_UUID,
      answers: { [VALID_UUID]: { nested: 'value' } },
    })
  })

  it('accepts array answer value', () => {
    expectPass(submitFormSchema, {
      formId: VALID_UUID,
      answers: { [VALID_UUID]: ['a', 'b'] },
    })
  })

  it('accepts empty answers', () => {
    expectPass(submitFormSchema, {
      formId: VALID_UUID,
      answers: {},
    })
  })

  it('accepts metadata', () => {
    expectPass(submitFormSchema, {
      formId: VALID_UUID,
      answers: {},
      metadata: { userAgent: 'Mozilla/5.0', referrer: 'https://example.com' },
    })
  })

  it('accepts metadata with only userAgent', () => {
    expectPass(submitFormSchema, {
      formId: VALID_UUID,
      answers: {},
      metadata: { userAgent: 'test' },
    })
  })

  it('accepts omitted metadata', () => {
    expectPass(submitFormSchema, {
      formId: VALID_UUID,
      answers: {},
    })
  })

  it('rejects non-UUID answer key', () => {
    expectFail(submitFormSchema, {
      formId: VALID_UUID,
      answers: { 'not-uuid': 'value' },
    })
  })

  it('rejects invalid formId', () => {
    expectFail(submitFormSchema, {
      formId: 'bad',
      answers: {},
    })
  })
})

// ── exportSubmissionsSchema ──────────────────────────────────────────

describe('exportSubmissionsSchema', () => {
  it('accepts csv format', () => {
    expectPass(exportSubmissionsSchema, { formId: VALID_UUID, format: 'csv' })
  })

  it('accepts json format', () => {
    expectPass(exportSubmissionsSchema, { formId: VALID_UUID, format: 'json' })
  })

  it('rejects unknown format', () => {
    expectFail(exportSubmissionsSchema, { formId: VALID_UUID, format: 'xml' })
  })

  it('rejects invalid formId', () => {
    expectFail(exportSubmissionsSchema, { formId: 'bad', format: 'csv' })
  })
})

// ── loginSchema ──────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid login', () => {
    expectPass(loginSchema, { email: 'user@example.com', password: 'secret' })
  })

  it('accepts login with next URL', () => {
    expectPass(loginSchema, { email: 'user@example.com', password: 'p', next: '/dashboard' })
  })

  it('accepts login with null next', () => {
    expectPass(loginSchema, { email: 'user@example.com', password: 'p', next: null })
  })

  it('rejects invalid email', () => {
    expectFail(loginSchema, { email: 'not-email', password: 'secret' })
  })

  it('rejects empty password', () => {
    expectFail(loginSchema, { email: 'user@example.com', password: '' })
  })

  it('rejects missing email', () => {
    expectFail(loginSchema, { password: 'secret' })
  })

  it('rejects missing password', () => {
    expectFail(loginSchema, { email: 'user@example.com' })
  })
})

// ── registerSchema ───────────────────────────────────────────────────

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    expectPass(registerSchema, {
      email: 'new@example.com',
      password: 'abcdef',
      full_name: 'John Doe',
    })
  })

  it('accepts password at min length (6)', () => {
    expectPass(registerSchema, {
      email: 'a@b.com',
      password: '123456',
      full_name: 'X',
    })
  })

  it('accepts full_name at max length (200)', () => {
    expectPass(registerSchema, {
      email: 'a@b.com',
      password: '123456',
      full_name: 'N'.repeat(200),
    })
  })

  it('rejects password shorter than 6', () => {
    expectFail(registerSchema, {
      email: 'a@b.com',
      password: '12345',
      full_name: 'Name',
    })
  })

  it('rejects empty full_name', () => {
    expectFail(registerSchema, {
      email: 'a@b.com',
      password: '123456',
      full_name: '',
    })
  })

  it('rejects full_name over 200', () => {
    expectFail(registerSchema, {
      email: 'a@b.com',
      password: '123456',
      full_name: 'N'.repeat(201),
    })
  })

  it('rejects invalid email', () => {
    expectFail(registerSchema, {
      email: 'bad',
      password: '123456',
      full_name: 'Name',
    })
  })
})

// ── resetPasswordSchema ──────────────────────────────────────────────

describe('resetPasswordSchema', () => {
  it('accepts valid email', () => {
    expectPass(resetPasswordSchema, { email: 'user@example.com' })
  })

  it('rejects invalid email', () => {
    expectFail(resetPasswordSchema, { email: 'nope' })
  })

  it('rejects missing email', () => {
    expectFail(resetPasswordSchema, {})
  })
})

// ── validate helper ──────────────────────────────────────────────────

describe('validate()', () => {
  it('returns success with parsed data on valid input', () => {
    const result = validate(createFormSchema, { title: 'Test' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Test')
    }
  })

  it('returns error string on invalid input', () => {
    const result = validate(createFormSchema, { title: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(typeof result.error).toBe('string')
      expect(result.error.length).toBeGreaterThan(0)
    }
  })

  it('joins multiple error messages with semicolon', () => {
    const result = validate(loginSchema, { email: 'bad', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      // Two failures: invalid email + empty password
      expect(result.error).toContain(';')
    }
  })
})
