FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies  
RUN npm install


# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Create uploads directory
RUN mkdir -p uploads

# Start server
CMD ["node", "dist/server.js"]