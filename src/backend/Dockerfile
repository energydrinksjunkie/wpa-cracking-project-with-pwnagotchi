FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && \
    apt-get install -y hashcat git make cmake libssl-dev zlib1g-dev

RUN git clone https://github.com/ZerBea/hcxtools.git && \
    cd hcxtools && \
    make -j $(nproc) && \
    make install && \
    cd .. && rm -rf hcxtools

COPY . .

CMD ["npm", "start"]
