FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx playwright install --with-deps

ENV ENV=dev
ENV HEADLESS=true
ENV BROWSER=chromium

CMD ["npm", "test"]
