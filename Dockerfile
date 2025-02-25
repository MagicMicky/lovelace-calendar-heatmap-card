FROM node:18-alpine
WORKDIR /app
COPY . .
#COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "build"]
