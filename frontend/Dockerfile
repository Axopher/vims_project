# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files first to leverage Docker's layer caching
COPY ./frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend application code
COPY ./frontend/ .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]
