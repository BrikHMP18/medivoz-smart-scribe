[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Demo](https://img.shields.io/badge/Demo-Live-green.svg)](https://medivoz-smart-scribe.lovable.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

# Medivoz - Transcripción Inteligente para Consultas Médicas

Medivoz es una aplicación web que utiliza inteligencia artificial para transformar la documentación médica. Convierte consultas en tiempo real a texto y genera fichas clínicas estructuradas automáticamente.

---

### **Funcionalidades Clave**

- **Transcripción en tiempo real:** Utiliza IA para convertir la voz en texto al instante.
- **Diferenciación de voces:** Distingue entre la voz del doctor y la del paciente.
- **Fichas clínicas automáticas:** Genera fichas completas extrayendo síntomas, diagnósticos y tratamientos de la transcripción.
- **Gestión de pacientes:** Organiza y mantiene el historial médico de cada paciente.
- **Exportación profesional:** Permite exportar las fichas clínicas en formato PDF.

---

### **Stack Tecnológico**

- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend:** Supabase (BaaS), PostgreSQL.
- **Integraciones de IA:** OpenAI Whisper (transcripción) y OpenAI GPT-4 (generación de fichas).

---

### **Instalación y Configuración**

1.  Clona el repositorio: `git clone https://github.com/tu-usuario/medivoz.git`
2.  Instala las dependencias: `npm install`
3.  Configura las variables de entorno (`.env.local`) con tus credenciales de Supabase y OpenAI.
4.  Inicia el servidor de desarrollo: `npm run dev`

---

### **Seguridad y Privacidad**

El proyecto incluye seguridad robusta con **Row Level Security** en la base de datos, autenticación obligatoria y el almacenamiento de claves API en Supabase Edge Functions para proteger la información médica.

---

### **Licencia**

Este proyecto está bajo la Licencia **MIT**. Para más detalles, consulta el archivo [LICENSE](LICENSE).

---

Desarrollado para optimizar el trabajo del personal médico, permitiendo más tiempo para la atención al paciente.
