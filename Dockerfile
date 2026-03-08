FROM apify/actor-node-puppeteer-chrome

# Use a truly writable directory for npm modules
WORKDIR /home/apify/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies in a temporary writable location
RUN npm install --prefix /home/apify/app --unsafe-perm

# Copy rest of your source code
COPY . .

# Set NODE_PATH so Node can find installed modules
ENV NODE_PATH=/home/apify/app/node_modules

# Run main.js
CMD ["node", "main.js"]
