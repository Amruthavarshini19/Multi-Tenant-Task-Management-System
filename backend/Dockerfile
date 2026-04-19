FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS final
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY src ./src
COPY package.json .
ENV NODE_ENV=production
EXPOSE 4000
USER node
CMD ["node", "src/app.js"]