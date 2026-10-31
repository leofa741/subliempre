# ==========================================
# ETAPA 1: CONSTRUCCIÓN (Builder)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar solo los archivos de dependencias primero (para aprovechar la caché de Docker)
COPY package*.json ./
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación (Aquí se ejecutará tu validación de variables de entorno)
RUN npm run build

# ==========================================
# ETAPA 2: PRODUCCIÓN (Runner)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Establecer entorno de producción
ENV NODE_ENV=production

# Copiar solo lo estrictamente necesario desde la etapa de construcción
# Esto hace que la imagen final sea muy ligera y segura
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Puerto que usará la aplicación
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar el servidor de Next.js en modo standalone
CMD ["node", "server.js"]