FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
RUN apk add --no-cache bash curl helm kubectl postgresql-client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/client ./client
COPY --from=builder /app/data ./data
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/public ./public
COPY --from=builder /app/helm ./helm
EXPOSE 4000
CMD ["node", "server/index.js"]
