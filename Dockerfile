FROM apify/actor-node-puppeteer-chrome

# Set working directory inside container
WORKDIR /home/apify/app

# Copy package.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your code (main.js, etc.)
COPY . .

# Default command
CMD ["node", "main.js"]
