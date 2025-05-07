FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json bun.lock ./
RUN npm ci

# Copy application files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 