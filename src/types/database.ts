export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          title: string
          description: string | null
          pdf_url: string
          signed_pdf_url: string | null
          status: 'pending' | 'signed' | 'expired' | 'declined'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          pdf_url: string
          signed_pdf_url?: string | null
          status?: 'pending' | 'signed' | 'expired' | 'declined'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          pdf_url?: string
          signed_pdf_url?: string | null
          status?: 'pending' | 'signed' | 'expired' | 'declined'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      signature_requests: {
        Row: {
          id: string
          document_id: string
          signer_email: string
          signer_name: string | null
          status: 'pending' | 'signed' | 'declined' | 'expired'
          signed_at: string | null
          signature_data: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          document_id: string
          signer_email: string
          signer_name?: string | null
          status?: 'pending' | 'signed' | 'declined' | 'expired'
          signed_at?: string | null
          signature_data?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          document_id?: string
          signer_email?: string
          signer_name?: string | null
          status?: 'pending' | 'signed' | 'declined' | 'expired'
          signed_at?: string | null
          signature_data?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at?: string | null
        }
      }
      signature_audit: {
        Row: {
          id: string
          document_id: string
          request_id: string | null
          event_type:
            | 'document_created'
            | 'document_viewed'
            | 'signature_requested'
            | 'signature_started'
            | 'signature_completed'
            | 'signature_declined'
            | 'document_expired'
            | 'document_downloaded'
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          request_id?: string | null
          event_type:
            | 'document_created'
            | 'document_viewed'
            | 'signature_requested'
            | 'signature_started'
            | 'signature_completed'
            | 'signature_declined'
            | 'document_expired'
            | 'document_downloaded'
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          request_id?: string | null
          event_type?:
            | 'document_created'
            | 'document_viewed'
            | 'signature_requested'
            | 'signature_started'
            | 'signature_completed'
            | 'signature_declined'
            | 'document_expired'
            | 'document_downloaded'
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
  }
}
