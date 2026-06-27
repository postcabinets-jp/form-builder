export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      forms: {
        Row: {
          id: string
          user_id: string
          title: string
          slug: string
          description: string | null
          settings: Json
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          slug: string
          description?: string | null
          settings?: Json
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          slug?: string
          description?: string | null
          settings?: Json
          is_published?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'forms_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      questions: {
        Row: {
          id: string
          form_id: string
          type: string
          title: string
          description: string | null
          required: boolean
          options: Json
          logic: Json
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          form_id: string
          type: string
          title: string
          description?: string | null
          required?: boolean
          options?: Json
          logic?: Json
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          type?: string
          title?: string
          description?: string | null
          required?: boolean
          options?: Json
          logic?: Json
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'questions_form_id_fkey'
            columns: ['form_id']
            isOneToOne: false
            referencedRelation: 'forms'
            referencedColumns: ['id']
          }
        ]
      }
      submissions: {
        Row: {
          id: string
          form_id: string
          metadata: Json
          is_complete: boolean
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          form_id: string
          metadata?: Json
          is_complete?: boolean
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          form_id?: string
          metadata?: Json
          is_complete?: boolean
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'submissions_form_id_fkey'
            columns: ['form_id']
            isOneToOne: false
            referencedRelation: 'forms'
            referencedColumns: ['id']
          }
        ]
      }
      answers: {
        Row: {
          id: string
          submission_id: string
          question_id: string
          value: Json
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          question_id: string
          value: Json
          created_at?: string
        }
        Update: {
          id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'answers_submission_id_fkey'
            columns: ['submission_id']
            isOneToOne: false
            referencedRelation: 'submissions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'answers_question_id_fkey'
            columns: ['question_id']
            isOneToOne: false
            referencedRelation: 'questions'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Application-level types
export type QuestionType =
  | 'text'
  | 'email'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'rating'
  | 'date'
  | 'file'

export interface FormSettings {
  mode: 'conversational' | 'classic'
  brandColor: string
  showProgressBar: boolean
  thankYouMessage: string
  thankYouRedirectUrl?: string
  notificationEmail?: string
  webhookUrl?: string
  logoUrl?: string
  backgroundImageUrl?: string
}

export interface QuestionOption {
  id: string
  label: string
  value: string
}

export interface QuestionLogic {
  conditions?: LogicCondition[]
}

export interface LogicCondition {
  questionId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: string
  jumpToQuestionId: string | 'end'
}

// DB row types
export type DBForm = Database['public']['Tables']['forms']['Row']
export type DBQuestion = Database['public']['Tables']['questions']['Row']
export type DBSubmission = Database['public']['Tables']['submissions']['Row']
export type DBAnswer = Database['public']['Tables']['answers']['Row']
export type DBProfile = Database['public']['Tables']['profiles']['Row']

// Application types with properly typed fields
export interface Form extends Omit<DBForm, 'settings'> {
  settings: FormSettings
}

export interface Question extends Omit<DBQuestion, 'type' | 'options' | 'logic'> {
  type: QuestionType
  options: QuestionOption[]
  logic: QuestionLogic
}

export type Submission = DBSubmission
export type Answer = DBAnswer
export type Profile = DBProfile
