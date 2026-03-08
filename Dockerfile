FROM apify/actor-node-puppeteer-chrome

# Use writable working directory
WORKDIR /home/apify/app

# Copy package.json and package-lock.json first (for dependency install)
COPY package*.json ./

# Copy all other files (including main.js)
COPY . .

# Do NOT run npm install — Apify cloud handles this automatically
# Run main.js
CMD ["node", "main.js"]
