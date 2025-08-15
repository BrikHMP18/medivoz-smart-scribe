# 🎤 Medivoz - Transcripción Inteligente para Consultas Médicas

Medivoz es una aplicación web diseñada para transformar la documentación médica mediante transcripción inteligente de consultas y generación automática de fichas clínicas con inteligencia artificial. Pueden visitar la web en el siguiente link: https://medivoz-smart-scribe.lovable.app/

## 📋 Descripción del Proyecto

Medivoz permite a los profesionales médicos:
- **Grabar consultas médicas** con transcripción en tiempo real
- **Diferenciar voces** de doctor y paciente con marcas de tiempo precisas
- **Generar automáticamente** fichas médicas estructuradas usando IA
- **Gestionar pacientes** de forma organizada por doctor
- **Exportar documentación** en formato PDF profesional

## ✨ Características Principales

### 🎯 Transcripción Inteligente
- Transcripción en tiempo real con OpenAI Whisper
- Diferenciación automática de voces (Doctor/Paciente)
- Marcas de tiempo precisas para cada intervención
- Visualización de forma de onda del audio

### 🤖 IA para Fichas Médicas
- Prellenado automático de fichas clínicas
- Análisis de síntomas y diagnósticos
- Extracción de información médica relevante
- Generación de planes de tratamiento

### 👥 Gestión de Pacientes
- Registro y gestión de pacientes por doctor
- Historial médico completo
- Búsqueda y filtros avanzados
- Vinculación con sesiones de consulta

### 📊 Panel de Control
- Dashboard con métricas de sesiones
- Gestión de agentes de IA personalizados
- Configuración de flujos de trabajo médicos
- Temas claro/oscuro

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** como bundler de desarrollo
- **Tailwind CSS** para estilos
- **shadcn/ui** como sistema de diseño
- **Radix UI** para componentes accesibles

### Backend & Base de Datos
- **Supabase** como backend-as-a-service
- **PostgreSQL** con Row Level Security (RLS)
- **Supabase Auth** para autenticación
- **Supabase Edge Functions** para lógica serverless

### Integraciones de IA
- **OpenAI API** para transcripción (Whisper)
- **OpenAI GPT** para análisis y generación de fichas médicas
- **Flujos de trabajo personalizados** con agentes especializados

### Herramientas Adicionales
- **React Hook Form** + **Zod** para formularios
- **TanStack Query** para gestión de estado servidor
- **jsPDF** para generación de documentos
- **Lucide React** para iconografía

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm
- Cuenta de Supabase
- API Key de OpenAI

### Configuración Local

```bash
# 1. Clonar el repositorio
git clone <YOUR_GIT_URL>
cd medivoz

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env.local con:
# Configurar variables de entorno de Supabase en el archivo .env

# 4. Iniciar el servidor de desarrollo
npm run dev
```

### Configuración de Supabase

1. **Base de datos**: Las migraciones se ejecutan automáticamente
2. **Autenticación**: Configurar proveedores en el dashboard
3. **Edge Functions**: Configurar secrets de OpenAI
4. **Storage**: Configurar buckets para archivos de audio

## 📁 Arquitectura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── auth/           # Componentes de autenticación
│   ├── agents/         # Gestión de agentes de IA
│   ├── patients/       # Gestión de pacientes
│   ├── session/        # Grabación y transcripción
│   └── medical-record/ # Fichas médicas
├── hooks/              # Custom hooks
│   ├── medical-record/ # Hooks para fichas médicas
│   └── ...            # Otros hooks especializados
├── pages/              # Páginas principales
├── contexts/           # Contextos de React
├── integrations/       # Integraciones externas
│   └── supabase/      # Cliente y configuración
└── utils/             # Utilidades y helpers

supabase/
├── functions/          # Edge Functions
│   ├── transcribe-audio/     # Transcripción con OpenAI
│   └── auto-fill-medical-record/ # IA para fichas
└── migrations/         # Migraciones de base de datos
```

## 🔧 Edge Functions

### `transcribe-audio`
Procesa archivos de audio y los envía a OpenAI Whisper para transcripción con diferenciación de voces.

### `auto-fill-medical-record`
Analiza transcripciones médicas y genera automáticamente fichas clínicas estructuradas usando GPT-4.

## 🔐 Seguridad

- **Row Level Security (RLS)** en todas las tablas
- **Autenticación** obligatoria para todas las funcionalidades
- **Políticas de acceso** basadas en el usuario autenticado
- **Validación** de tipos con TypeScript y Zod

## 📱 Características Móviles

- Diseño completamente responsive
- Optimizado para dispositivos móviles
- Grabación de audio en dispositivos táctiles
- Interfaz adaptativa según el tamaño de pantalla

## 🚀 Despliegue

### Lovable (Recomendado)
```bash
# Desde el panel de Lovable
Share → Publish
```

### Manual
```bash
# Build de producción
npm run build

# El contenido de dist/ puede desplegarse en cualquier hosting estático
```

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🔗 Links Útiles

- **Repositorio del Proyecto**: [Medivoz en GitHub](https://github.com)
- **Documentación de Supabase**: [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase Dashboard**: Configuración de backend y base de datos
- **Documentación de Supabase**: [https://supabase.com/docs](https://supabase.com/docs)

## 🏥 Sobre Medivoz

Medivoz representa el futuro de la documentación médica, combinando tecnologías de vanguardia con las necesidades reales de los profesionales de la salud. Nuestro objetivo es reducir significativamente el tiempo dedicado a la documentación, permitiendo que los médicos se enfoquen en lo más importante: la atención al paciente.

---

*Desarrollado con ❤️ para mejorar la atención médica a través de la tecnología.*
