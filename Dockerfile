# Use the official Puppeteer Apify image
FROM apify/actor-node-puppeteer-chrome

# Set working directory
WORKDIR /home/apify/app

# Copy package.json and main.js
COPY package*.json ./
COPY main.js ./

# No RUN npm install! Apify will handle dependencies automatically

# Default command
CMD ["node", "main.js"]
