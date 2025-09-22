# 🎤 Medivoz - Transcripción Inteligente para Consultas Médicas

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Demo](https://img.shields.io/badge/Demo-Live-green.svg)](https://medivoz-smart-scribe.lovable.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

Medivoz es una aplicación web diseñada para transformar la documentación médica mediante transcripción inteligente de consultas y generación automática de fichas clínicas con inteligencia artificial.

**🌐 [Demo en Vivo](https://medivoz-smart-scribe.lovable.app/)**

## 📋 Descripción del Proyecto

Medivoz revoluciona el proceso de documentación médica, permitiendo a los profesionales de la salud optimizar el tiempo de consulta y mejorar la calidad de la atención al paciente.

### 🎯 Problema que Resuelve
- ⏰ **Tiempo perdido**: Los médicos dedican hasta 40% de su tiempo a documentación
- 📝 **Errores manuales**: Transcripción incorrecta de información crítica
- 🗂️ **Desorganización**: Dificultad para mantener historiales médicos actualizados
- 💼 **Carga administrativa**: Exceso de trabajo burocrático vs. atención médica

### ✅ Solución Ofrecida
- **Transcripción automática** en tiempo real con IA
- **Diferenciación de voces** doctor/paciente
- **Generación automática** de fichas clínicas estructuradas
- **Gestión organizada** de pacientes e historiales
- **Exportación profesional** en PDF

## ✨ Características Principales

### 🎙️ **Transcripción Inteligente**
- 🤖 Transcripción en tiempo real con OpenAI Whisper
- 👥 Diferenciación automática de voces (Doctor/Paciente)
- ⏱️ Marcas de tiempo precisas para cada intervención
- 📊 Visualización de forma de onda del audio en tiempo real
- 🔄 Pausar/reanudar grabación sin perder contexto

### 🧠 **IA para Fichas Médicas**
- 📋 Prellenado automático de fichas clínicas
- 🔍 Análisis inteligente de síntomas y diagnósticos
- 📊 Extracción de información médica relevante
- 💊 Generación automática de planes de tratamiento
- 🎯 Agentes de IA especializados por área médica

### 👥 **Gestión de Pacientes**
- 📂 Registro y gestión de pacientes por doctor
- 🏥 Historial médico completo y organizado
- 🔍 Búsqueda y filtros avanzados
- 🔗 Vinculación automática con sesiones de consulta
- 📅 Seguimiento de fechas de última consulta

### 📊 **Panel de Control Avanzado**
- 📈 Dashboard con métricas de sesiones y pacientes
- ⚙️ Gestión de agentes de IA personalizados
- 🔧 Configuración de flujos de trabajo médicos
- 🌓 Temas claro/oscuro adaptativos
- 📱 Interfaz completamente responsive

## 🛠️ Stack Tecnológico

### **Frontend**
```json
{
  "framework": "React 18 + TypeScript",
  "build_tool": "Vite",
  "styling": "Tailwind CSS",
  "ui_library": "shadcn/ui + Radix UI",
  "state_management": "TanStack Query",
  "forms": "React Hook Form + Zod"
}
```

### **Backend & Base de Datos**
```json
{
  "backend": "Supabase (BaaS)",
  "database": "PostgreSQL + Row Level Security",
  "auth": "Supabase Auth",
  "functions": "Supabase Edge Functions",
  "storage": "Supabase Storage"
}
```

### **Integraciones de IA**
```json
{
  "transcription": "OpenAI Whisper API",
  "text_generation": "OpenAI GPT-4",
  "workflow": "Custom AI Agents",
  "audio_processing": "Web Audio API"
}
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** 18+ y npm/yarn
- **Cuenta de Supabase** (gratuita)
- **API Key de OpenAI** (para transcripción e IA)

### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/medivoz.git
cd medivoz

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional para desarrollo local)
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Iniciar servidor de desarrollo
npm run dev
```

### Configuración de Supabase

1. **Crear proyecto en Supabase**: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Configurar autenticación**: Habilitar email/password en Auth → Settings
3. **Edge Functions**: Configurar `OPENAI_API_KEY` en Functions → Settings → Secrets
4. **Base de datos**: Las migraciones se ejecutan automáticamente

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting del código
```

## 📁 Arquitectura del Proyecto

```
medivoz/
├── 📂 src/
│   ├── 📂 components/          # Componentes reutilizables
│   │   ├── 📂 ui/             # Sistema de diseño (shadcn/ui)
│   │   ├── 📂 auth/           # Autenticación y registro
│   │   ├── 📂 agents/         # Gestión de agentes de IA
│   │   ├── 📂 patients/       # Módulo de pacientes
│   │   ├── 📂 session/        # Grabación y transcripción
│   │   ├── 📂 medical-record/ # Fichas médicas
│   │   └── 📂 landing/        # Página de inicio
│   ├── 📂 hooks/              # Custom hooks especializados
│   ├── 📂 pages/              # Páginas principales de la app
│   ├── 📂 contexts/           # Contextos globales de React
│   ├── 📂 integrations/       # Integraciones externas
│   ├── 📂 utils/              # Utilidades y helpers
│   └── 📂 types/              # Definiciones de tipos
├── 📂 supabase/
│   ├── 📂 functions/          # Edge Functions serverless
│   └── 📂 migrations/         # Migraciones de base de datos
├── 📂 public/                 # Archivos estáticos
└── 📄 Archivos de configuración
```

## 🔧 Edge Functions

### `transcribe-audio`
**Función**: Procesa archivos de audio y los envía a OpenAI Whisper para transcripción.
- 🎵 Soporta múltiples formatos de audio
- 🔧 Procesamiento optimizado en chunks
- 👥 Diferenciación de voces automática
- ⚡ Respuesta en tiempo real

### `auto-fill-medical-record`
**Función**: Analiza transcripciones médicas y genera fichas clínicas estructuradas.
- 🤖 Uso de GPT-4 para análisis médico
- 📋 Extracción de síntomas, diagnósticos y tratamientos
- 🎯 Agentes especializados por área médica
- 📊 Formato estructurado para exportación

## 🔐 Seguridad y Privacidad

### Medidas de Seguridad Implementadas
- 🔒 **Row Level Security (RLS)** en todas las tablas
- 🔑 **Autenticación obligatoria** para acceso a funcionalidades
- 👤 **Políticas de acceso** basadas en usuario autenticado
- 🛡️ **Validación de tipos** con TypeScript y Zod
- 🌐 **HTTPS** forzado en todas las comunicaciones
- 🔐 **API Keys** almacenadas en Supabase Edge Functions

### Cumplimiento de Privacidad
- 📋 Compatible con regulaciones de privacidad médica
- 🏥 Datos almacenados de forma segura en Supabase
- 🚫 Sin almacenamiento local de información sensible
- 🔄 Procesamiento de IA sin retención de datos

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome/Chromium 88+
- ✅ Firefox 84+
- ✅ Safari 14+
- ✅ Edge 88+

### Dispositivos
- 💻 **Desktop**: Experiencia completa
- 📱 **Mobile**: Interfaz adaptativa optimizada
- 🎙️ **Grabación de audio**: Compatible con dispositivos móviles
- 📊 **Responsive**: Diseño adaptativo en todas las pantallas

## 🚀 Despliegue

### Opciones de Hosting

#### 1. **Supabase + Vercel/Netlify** (Recomendado)
```bash
npm run build
# Subir carpeta dist/ a tu hosting favorito
```

#### 2. **Servidor Propio**
```bash
npm run build
# Servir archivos estáticos desde dist/
```

#### 3. **Docker** (Opcional)
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor, sigue estos pasos:

### Proceso de Contribución
1. 🍴 **Fork** del proyecto
2. 🌿 **Crear rama** feature: `git checkout -b feature/nueva-funcionalidad`
3. ✍️ **Commit** cambios: `git commit -am 'feat: agregar nueva funcionalidad'`
4. 📤 **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. 🔄 **Pull Request** con descripción detallada

### Guías de Contribución
- 📝 Seguir convenciones de commit ([Conventional Commits](https://www.conventionalcommits.org/))
- 🧪 Agregar tests para nuevas funcionalidades
- 📚 Actualizar documentación cuando sea necesario
- 🎨 Mantener consistencia con el estilo de código existente

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor:
1. 🔍 Verificar que no esté ya reportado en [Issues](https://github.com/tu-usuario/medivoz/issues)
2. 📝 Crear un nuevo issue con:
   - Descripción detallada del problema
   - Pasos para reproducirlo
   - Capturas de pantalla (si aplica)
   - Información del navegador/dispositivo

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para más detalles.

### Resumen de la Licencia MIT
- ✅ Uso comercial y personal permitido
- ✅ Modificación y distribución permitida
- ✅ Uso privado permitido
- ❗ Sin garantía ni responsabilidad del autor

## 🔗 Enlaces Útiles

- 🌐 **[Demo en Vivo](https://medivoz-smart-scribe.lovable.app/)**
- 📚 **[Documentación de Supabase](https://supabase.com/docs)**
- 🤖 **[OpenAI API Docs](https://platform.openai.com/docs)**
- 🎨 **[shadcn/ui Components](https://ui.shadcn.com/)**
- 📱 **[Tailwind CSS](https://tailwindcss.com/docs)**

## 🏥 Acerca de Medivoz

**Medivoz** representa el futuro de la documentación médica, combinando tecnologías de vanguardia con las necesidades reales de los profesionales de la salud. 

### 🎯 Nuestra Misión
Reducir significativamente el tiempo dedicado a la documentación administrativa, permitiendo que los médicos se enfoquen en lo más importante: **la atención al paciente**.

### 💡 Visión
Ser la herramienta estándar para la transcripción inteligente en consultorios médicos, hospitales y clínicas a nivel global.

### 🌟 Valores
- **🏥 Centrado en el paciente**: Mejorando la calidad de atención médica
- **⚡ Eficiencia**: Optimizando procesos médicos con tecnología
- **🔐 Privacidad**: Respetando la confidencialidad médica
- **🌍 Accesibilidad**: Tecnología accesible para todos los profesionales

---

**Desarrollado con ❤️ para transformar la atención médica a través de la tecnología.**

*¿Te gusta Medivoz? ¡Dale una ⭐ al repositorio!*
