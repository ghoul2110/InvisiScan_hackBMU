FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install
RUN npm install prom-client


COPY . .

EXPOSE 5000

CMD ["npm", "start"]
