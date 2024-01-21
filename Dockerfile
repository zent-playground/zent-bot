FROM node:21.5.0

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /usr/src/app

COPY . ./

RUN pnpm install
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
