FROM  node:20-alpine 
WORKDIR  /app

RUN corepack enable
RUN corepack prepare pnpm@latest --activate


COPY  package.json ./
COPY  turbo.json ./
COPY  pnpm-lock.yaml  pnpm-workspace.yaml ./

COPY  ./packages ./packages
COPY   ./apps  ./apps 

RUN  pnpm install

RUN pnpm turbo run build

CMD [ "pnpm" , "dev"]




