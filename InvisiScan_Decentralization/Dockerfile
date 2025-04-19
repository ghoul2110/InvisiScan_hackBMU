FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev
COPY . .
RUN npx hardhat compile
CMD ["npx", "hardhat", "node", "--host", "0.0.0.0"]
EXPOSE 8545