# 🔒 Guía de Seguridad - Medivoz

## Resumen de Seguridad

Este proyecto está diseñado para ser **SEGURO para repositorios públicos**. No contiene credenciales sensibles en el código fuente.

## ✅ Datos Seguros para Repositorios Públicos

Los siguientes datos son **SEGUROS** y pueden estar en repositorios públicos:

- **URL de Supabase**: `https://ncmgxsrlzbqyqkowomkr.supabase.co`
- **Anon Key de Supabase**: Es una clave pública diseñada para estar expuesta
- **Project ID**: `ncmgxsrlzbqyqkowomkr`

Estas credenciales están **destinadas a ser públicas** según la arquitectura de Supabase.

## 🔐 Datos Sensibles (Protegidos)

Los siguientes datos están **PROTEGIDOS** y NO están en el repositorio:

- **OpenAI API Key**: Almacenada en Supabase Edge Functions Secrets
- **Service Role Key**: Solo en Supabase backend
- **Database passwords**: Gestionadas por Supabase
- **JWT secrets**: Gestionados por Supabase

## 🛡️ Arquitectura de Seguridad

### Frontend (Público)
```typescript
// ✅ SEGURO - Estas credenciales pueden estar públicas
const SUPABASE_URL = "https://ncmgxsrlzbqyqkowomkr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### Backend (Protegido)
```typescript
// 🔒 PROTEGIDO - Solo en Supabase Edge Functions
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
```

## 🔍 Verificación de Seguridad

### Archivos que NUNCA deben subirse:
- `.env` (añadido a .gitignore)
- `*.key`
- `*.pem`
- `secrets/`
- `config/secrets.*`

### Archivos seguros para repositorios públicos:
- `src/integrations/supabase/client.ts` ✅
- `.env.example` ✅
- Todo el código frontend ✅

## 📝 RLS (Row Level Security)

El proyecto usa RLS de Supabase para proteger los datos:

- ✅ Usuarios solo pueden ver sus propios pacientes
- ✅ Usuarios solo pueden ver sus propias sesiones
- ✅ Todas las tablas tienen políticas RLS activas

## 🚀 Despliegue Seguro

Para desplegar este proyecto:

1. **HuggingFace Spaces**: ✅ Completamente seguro
2. **Vercel/Netlify**: ✅ Completamente seguro
3. **GitHub Pages**: ✅ Completamente seguro

## ⚠️ Importante para Desarrolladores

Si haces fork de este proyecto:

1. **NO** cambies las credenciales públicas de Supabase
2. **SÍ** configura tu propia instancia de Supabase para desarrollo
3. **NO** añadas archivos .env al repositorio
4. **SÍ** usa las Edge Functions para APIs sensibles

## 🔄 Para Desarrollo Local

```bash
# 1. Clona el repositorio
git clone [repo-url]

# 2. Instala dependencias
npm install

# 3. (Opcional) Configura tu .env local
cp .env.example .env
# Edita .env con TUS credenciales locales

# 4. Ejecuta el proyecto
npm run dev
```

## 📞 Contacto de Seguridad

Si encuentras algún problema de seguridad, por favor reporta a través de GitHub Issues.

---

**🎯 Conclusión**: Este proyecto está diseñado siguiendo las mejores prácticas de seguridad para aplicaciones web modernas y es seguro para repositorios públicos.