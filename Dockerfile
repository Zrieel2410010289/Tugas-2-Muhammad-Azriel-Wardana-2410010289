# ---- Tugas 2 Cloud Computing: Dockerfile ----
# Base image ringan (Alpine) untuk Node.js
FROM node:20-alpine

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Copy package.json & package-lock.json dulu (memanfaatkan Docker layer cache)
COPY app/package*.json ./

# Install dependency production
RUN npm install --omit=dev

# Copy seluruh source code aplikasi
COPY app/ .

# Expose port aplikasi
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "server.js"]
