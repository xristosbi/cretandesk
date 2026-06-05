// Full Supabase-compatible Database type for CretanDesk
// Matches the shape that @supabase/supabase-js v2 generics require.

export type Database = {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["user_status"]
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["user_status"]
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["user_status"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      partners: {
        Row: {
          id: string
          business_name: string
          afm: string | null
          phone: string | null
          description: string | null
          areas: Database["public"]["Enums"]["cretan_area"][] | null
          logo_url: string | null
          approved: boolean
          created_at: string
        }
        Insert: {
          id: string
          business_name: string
          afm?: string | null
          phone?: string | null
          description?: string | null
          areas?: Database["public"]["Enums"]["cretan_area"][] | null
          logo_url?: string | null
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          afm?: string | null
          phone?: string | null
          description?: string | null
          areas?: Database["public"]["Enums"]["cretan_area"][] | null
          logo_url?: string | null
          approved?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      agencies: {
        Row: {
          id: string
          business_name: string
          afm: string | null
          gemi: string | null
          eot: string | null
          phone: string | null
          address: string | null
          approved: boolean
          created_at: string
        }
        Insert: {
          id: string
          business_name: string
          afm?: string | null
          gemi?: string | null
          eot?: string | null
          phone?: string | null
          address?: string | null
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          afm?: string | null
          gemi?: string | null
          eot?: string | null
          phone?: string | null
          address?: string | null
          approved?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agencies_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      partner_agency_connections: {
        Row: {
          id: string
          partner_id: string
          agency_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          agency_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          agency_id?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_agency_connections_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_agency_connections_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      excursions: {
        Row: {
          id: string
          partner_id: string
          name: string
          description: string | null
          category: Database["public"]["Enums"]["excursion_category"] | null
          area: Database["public"]["Enums"]["cretan_area"] | null
          price_per_person: number | null
          max_capacity: number | null
          duration_hours: number | null
          photos: string[] | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          name: string
          description?: string | null
          category?: Database["public"]["Enums"]["excursion_category"] | null
          area?: Database["public"]["Enums"]["cretan_area"] | null
          price_per_person?: number | null
          max_capacity?: number | null
          duration_hours?: number | null
          photos?: string[] | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          name?: string
          description?: string | null
          category?: Database["public"]["Enums"]["excursion_category"] | null
          area?: Database["public"]["Enums"]["cretan_area"] | null
          price_per_person?: number | null
          max_capacity?: number | null
          duration_hours?: number | null
          photos?: string[] | null
          active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "excursions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          }
        ]
      }
      availability: {
        Row: {
          id: string
          excursion_id: string
          date: string
          available_slots: number | null
          blackout: boolean
        }
        Insert: {
          id?: string
          excursion_id: string
          date: string
          available_slots?: number | null
          blackout?: boolean
        }
        Update: {
          id?: string
          excursion_id?: string
          date?: string
          available_slots?: number | null
          blackout?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "availability_excursion_id_fkey"
            columns: ["excursion_id"]
            isOneToOne: false
            referencedRelation: "excursions"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          agency_id: string
          excursion_id: string
          partner_id: string
          date: string
          persons_adults: number
          persons_children: number
          total_persons: number
          status: Database["public"]["Enums"]["booking_status"]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          excursion_id: string
          partner_id: string
          date: string
          persons_adults?: number
          persons_children?: number
          status?: Database["public"]["Enums"]["booking_status"]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          excursion_id?: string
          partner_id?: string
          date?: string
          persons_adults?: number
          persons_children?: number
          status?: Database["public"]["Enums"]["booking_status"]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_excursion_id_fkey"
            columns: ["excursion_id"]
            isOneToOne: false
            referencedRelation: "excursions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          }
        ]
      }
      service_fees: {
        Row: {
          id: string
          booking_id: string
          partner_id: string
          persons: number | null
          amount: number | null
          paid: boolean
          stripe_invoice_id: string | null
          period: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          partner_id: string
          persons?: number | null
          amount?: number | null
          paid?: boolean
          stripe_invoice_id?: string | null
          period?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          partner_id?: string
          persons?: number | null
          amount?: number | null
          paid?: boolean
          stripe_invoice_id?: string | null
          period?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_fees_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_fees_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      auth_status: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_status"]
      }
    }
    Enums: {
      user_role: "admin" | "partner" | "agency"
      user_status: "pending" | "approved" | "suspended"
      booking_status: "pending" | "accepted" | "rejected" | "completed"
      excursion_category: "sea" | "adventure" | "aerial" | "gastronomy" | "culture" | "vip" | "niche"
      cretan_area:
        // Prefectures (legacy / filter buckets)
        | "heraklion" | "chania" | "rethymno" | "lasithi"
        // Heraklion towns
        | "heraklion_city" | "malia" | "hersonissos" | "gouves"
        | "anissaras" | "anogia" | "arkadi" | "zaros"
        // Chania towns
        | "chania_city" | "kolympari" | "paleochora" | "sfakia"
        | "sougia" | "georgioupoli" | "vamos"
        // Rethymno towns
        | "rethymno_city" | "plakias" | "agia_galini" | "spili"
        // Lasithi towns
        | "agios_nikolaos" | "elounda" | "siteia" | "ierapetra" | "lasithi_plateau"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience aliases
export type UserRole           = Database["public"]["Enums"]["user_role"]
export type UserStatus         = Database["public"]["Enums"]["user_status"]
export type BookingStatus      = Database["public"]["Enums"]["booking_status"]
export type ExcursionCategory  = Database["public"]["Enums"]["excursion_category"]
export type Area               = Database["public"]["Enums"]["cretan_area"]

// Row types
export type Profile      = Database["public"]["Tables"]["profiles"]["Row"]
export type Partner      = Database["public"]["Tables"]["partners"]["Row"]
export type Agency       = Database["public"]["Tables"]["agencies"]["Row"]
export type Excursion    = Database["public"]["Tables"]["excursions"]["Row"]
export type Booking      = Database["public"]["Tables"]["bookings"]["Row"]
export type ServiceFee   = Database["public"]["Tables"]["service_fees"]["Row"]
export type Availability = Database["public"]["Tables"]["availability"]["Row"]
export type Connection   = Database["public"]["Tables"]["partner_agency_connections"]["Row"]
