FROM node:21.5.0

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /usr/src/app

COPY sripts/ scripts/
COPY src/ src/
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install
RUN pnpm build

COPY languages/ languages/

EXPOSE 3000

CMD ["pnpm", "start"]
