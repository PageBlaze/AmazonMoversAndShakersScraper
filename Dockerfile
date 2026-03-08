FROM apify/actor-node-puppeteer-chrome

WORKDIR /app

# Copy package.json and package-lock.json first (for faster rebuilds)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all local files (including main.js) into the container
COPY . .

# Set the default command to run main.js
CMD ["node", "main.js"]
