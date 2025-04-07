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
      fichas_medicas: {
        Row: {
          antecedentes_relevantes: string | null
          created_at: string
          diagnostico_principal: string
          id: string
          motivo_consulta: string
          notas_adicionales: string | null
          paciente_id: string
          plan_tratamiento: string
          sesion_id: string
          sintomas_principales: string | null
          updated_at: string
        }
        Insert: {
          antecedentes_relevantes?: string | null
          created_at?: string
          diagnostico_principal: string
          id?: string
          motivo_consulta: string
          notas_adicionales?: string | null
          paciente_id: string
          plan_tratamiento: string
          sesion_id: string
          sintomas_principales?: string | null
          updated_at?: string
        }
        Update: {
          antecedentes_relevantes?: string | null
          created_at?: string
          diagnostico_principal?: string
          id?: string
          motivo_consulta?: string
          notas_adicionales?: string | null
          paciente_id?: string
          plan_tratamiento?: string
          sesion_id?: string
          sintomas_principales?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fichas_medicas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fichas_medicas_sesion_id_fkey"
            columns: ["sesion_id"]
            isOneToOne: false
            referencedRelation: "sesiones"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          created_at: string
          diagnostico: string | null
          dni: string
          edad: number | null
          id: string
          nombre: string
          ocupacion: string | null
          procedencia: string | null
          ultima_visita: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          diagnostico?: string | null
          dni: string
          edad?: number | null
          id?: string
          nombre: string
          ocupacion?: string | null
          procedencia?: string | null
          ultima_visita?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          diagnostico?: string | null
          dni?: string
          edad?: number | null
          id?: string
          nombre?: string
          ocupacion?: string | null
          procedencia?: string | null
          ultima_visita?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sesiones: {
        Row: {
          codigo_sesion: string
          created_at: string
          fecha_consulta: string
          id: string
          paciente_id: string
          transcripcion: string | null
          updated_at: string
        }
        Insert: {
          codigo_sesion: string
          created_at?: string
          fecha_consulta?: string
          id?: string
          paciente_id: string
          transcripcion?: string | null
          updated_at?: string
        }
        Update: {
          codigo_sesion?: string
          created_at?: string
          fecha_consulta?: string
          id?: string
          paciente_id?: string
          transcripcion?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sesiones_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
