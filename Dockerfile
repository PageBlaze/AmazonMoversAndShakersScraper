FROM apify/actor-node-puppeteer-chrome

# Create app directory and give ownership to default user
RUN mkdir -p /app && chown -R apify:apify /app

WORKDIR /app

# Copy package files
COPY package*.json ./

# Switch to apify user (already default in newer images, but explicit is safer)
USER apify

# Install dependencies
RUN npm install

# Copy all local files
COPY --chown=apify:apify . .

# Run main.js
CMD ["node", "main.js"]
