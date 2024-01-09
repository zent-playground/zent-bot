FROM node:21.5.0

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

COPY dist/ dist/

EXPOSE 3000

CMD ["pnpm", "start:prod"]
