export type UserRole = "admin" | "partner" | "agency";
export type UserStatus = "pending" | "approved" | "suspended";
export type BookingStatus = "pending" | "accepted" | "rejected" | "completed";
export type ExcursionCategory = "sea" | "adventure" | "aerial" | "gastronomy" | "culture" | "vip" | "niche";
export type Area = "heraklion" | "chania" | "rethymno" | "lasithi";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          role: UserRole | null;
          status: UserStatus;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          role?: UserRole | null;
          status?: UserStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          role?: UserRole | null;
          status?: UserStatus;
          created_at?: string;
        };
      };
      partners: {
        Row: {
          id: string;
          business_name: string;
          afm: string | null;
          phone: string | null;
          description: string | null;
          areas: Area[] | null;
          logo_url: string | null;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          business_name: string;
          afm?: string | null;
          phone?: string | null;
          description?: string | null;
          areas?: Area[] | null;
          logo_url?: string | null;
          approved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["partners"]["Insert"]>;
      };
      agencies: {
        Row: {
          id: string;
          business_name: string;
          afm: string | null;
          gemi: string | null;
          eot: string | null;
          phone: string | null;
          address: string | null;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          business_name: string;
          afm?: string | null;
          gemi?: string | null;
          eot?: string | null;
          phone?: string | null;
          address?: string | null;
          approved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agencies"]["Insert"]>;
      };
      partner_agency_connections: {
        Row: {
          id: string;
          partner_id: string;
          agency_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          partner_id: string;
          agency_id: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["partner_agency_connections"]["Insert"]>;
      };
      excursions: {
        Row: {
          id: string;
          partner_id: string;
          name: string;
          description: string | null;
          category: ExcursionCategory | null;
          area: Area | null;
          price_per_person: number | null;
          max_capacity: number | null;
          duration_hours: number | null;
          photos: string[] | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          partner_id: string;
          name: string;
          description?: string | null;
          category?: ExcursionCategory | null;
          area?: Area | null;
          price_per_person?: number | null;
          max_capacity?: number | null;
          duration_hours?: number | null;
          photos?: string[] | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["excursions"]["Insert"]>;
      };
      availability: {
        Row: {
          id: string;
          excursion_id: string;
          date: string;
          available_slots: number | null;
          blackout: boolean;
        };
        Insert: {
          id?: string;
          excursion_id: string;
          date: string;
          available_slots?: number | null;
          blackout?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["availability"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          agency_id: string;
          excursion_id: string;
          partner_id: string;
          date: string;
          persons_adults: number;
          persons_children: number;
          total_persons: number;
          status: BookingStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          excursion_id: string;
          partner_id: string;
          date: string;
          persons_adults?: number;
          persons_children?: number;
          status?: BookingStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      service_fees: {
        Row: {
          id: string;
          booking_id: string;
          partner_id: string;
          persons: number | null;
          amount: number | null;
          paid: boolean;
          stripe_invoice_id: string | null;
          period: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          partner_id: string;
          persons?: number | null;
          amount?: number | null;
          paid?: boolean;
          stripe_invoice_id?: string | null;
          period?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_fees"]["Insert"]>;
      };
    };
  };
}
