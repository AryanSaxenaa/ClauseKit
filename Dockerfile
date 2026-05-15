FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
ARG NEXT_PUBLIC_TW_API_KEY
ENV NEXT_PUBLIC_TW_API_KEY=$NEXT_PUBLIC_TW_API_KEY
ARG NEXT_PUBLIC_PLATFORM_ADDRESS
ENV NEXT_PUBLIC_PLATFORM_ADDRESS=$NEXT_PUBLIC_PLATFORM_ADDRESS
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
