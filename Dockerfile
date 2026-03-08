FROM apify/actor-node-puppeteer-chrome

# Set working directory
WORKDIR /home/apify/app

# Copy package files
COPY package*.json ./

# Install dependencies (important!)
RUN npm install --only=prod --no-optional

# Copy source code
COPY main.js ./

# Default command
CMD ["node", "main.js"]
