import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Mic,
  Users,
  Activity,
  Calendar,
  ArrowRight,
  FileText,
  History,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

interface DoctorProfile {
  id: string;
  full_name: string;
  specialty?: string;
  avatar_url?: string;
  firstName?: string;
}

interface DashboardStats {
  totalPatients: number;
  totalSessions: number;
  sessionsThisMonth: number;
  recordsThisMonth: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buenos dias");
    else if (hour < 18) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");
  }, []);

  const { data: doctorProfile, isLoading, error } = useQuery({
    queryKey: ["doctorProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw new Error(`Error fetching doctor profile: ${error.message}`);
      return data as DoctorProfile;
    },
    select: (data) => {
      if (!data) return null;
      return {
        ...data,
        firstName: data.full_name?.split(" ")[0] || "Doctor",
      };
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboardStats", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) return { totalPatients: 0, totalSessions: 0, sessionsThisMonth: 0, recordsThisMonth: 0 };

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [patients, sessions, sessionsMonth, recordsMonth] = await Promise.all([
        supabase.from("pacientes").select("id", { count: "exact", head: true }).eq("doctor_id", user.id),
        supabase.from("sesiones").select("id", { count: "exact", head: true }).eq("doctor_id", user.id),
        supabase.from("sesiones").select("id", { count: "exact", head: true }).eq("doctor_id", user.id).gte("created_at", firstOfMonth),
        supabase.from("fichas_medicas").select("id", { count: "exact", head: true }).eq("doctor_id", user.id).gte("created_at", firstOfMonth),
      ]);

      return {
        totalPatients: patients.count ?? 0,
        totalSessions: sessions.count ?? 0,
        sessionsThisMonth: sessionsMonth.count ?? 0,
        recordsThisMonth: recordsMonth.count ?? 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (error) {
      toast.error("Error al cargar el perfil del doctor");
      logger.error("Dashboard query error:", error);
    }
  }, [error]);

  const statCards = [
    { label: "Pacientes", value: stats?.totalPatients ?? 0, icon: Users, iconColor: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Sesiones totales", value: stats?.totalSessions ?? 0, icon: History, iconColor: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-50 dark:bg-violet-900/20" },
    { label: "Sesiones este mes", value: stats?.sessionsThisMonth ?? 0, icon: TrendingUp, iconColor: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Fichas este mes", value: stats?.recordsThisMonth ?? 0, icon: FileText, iconColor: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
  ];

  const quickActions = [
    {
      title: "Nueva Sesion",
      description: "Iniciar grabacion y transcripcion de consulta medica",
      href: "/session",
      icon: Mic,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pacientes",
      description: "Gestionar listado y expedientes de pacientes",
      href: "/patients",
      icon: Users,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Historial",
      description: "Revisar sesiones pasadas y fichas medicas",
      href: "/history",
      icon: History,
      iconColor: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-900/20",
    },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-60">
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-6xl">
          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {greeting},{" "}
                  <span className="text-primary">{doctorProfile?.firstName || "Doctor"}</span>
                </h1>
                <p className="text-muted-foreground mt-1.5">
                  Bienvenido a tu panel de control de Medivoz.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-2.5 rounded-xl border border-border/60 shadow-sm">
                <Calendar className="h-4 w-4 text-primary/70" />
                {new Date().toLocaleDateString("es-PE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {isLoading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="h-24 animate-pulse bg-muted/50 border-border/40" />
                  ))
              : statCards.map((stat) => (
                  <Card key={stat.label} className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${stat.bgColor}`}>
                        <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                          {stat.label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {/* Doctor Profile Card */}
          {!isLoading && doctorProfile && (
            <Card className="mb-10 border-border/40 shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  Informacion Profesional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center shrink-0">
                    {doctorProfile.avatar_url ? (
                      <img
                        src={doctorProfile.avatar_url}
                        alt="Avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-6 w-6 text-accent-foreground" />
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                        Nombre Completo
                      </p>
                      <p className="font-medium text-foreground">
                        {doctorProfile.full_name || "No especificado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                        Especialidad
                      </p>
                      <p className="font-medium text-foreground">
                        {doctorProfile.specialty || "No especificada"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                        Estado
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <p className="font-medium text-emerald-600 dark:text-emerald-400">Activo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              Acciones Rapidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} to={action.href} className="block group">
                  <Card className="border-border/40 hover:border-primary/30 hover:shadow-md transition-all duration-200 h-full">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div
                        className={`h-12 w-12 rounded-xl ${action.bgColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{action.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
