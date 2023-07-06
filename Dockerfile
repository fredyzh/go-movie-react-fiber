# First stage: Get Golang image from DockerHub.
FROM golang:1.20 AS backend-builder

# Set our working directory for this stage.
WORKDIR /backendcompile

# Copy all of our files.
COPY . .

# Get and install all dependencies.
RUN go get -d -v ./...
RUN go build -o bin/movie_ticket_front_api.exe ./cmd

# Next stage: Build our frontend application.
FROM node:16 AS frontend-builder

# Set our working directory for this stage.
WORKDIR /frontendcompile

# Copy lockfiles and dependencies.
COPY ./package.json ./package-lock.json ./

RUN npm ci

COPY ./ .

RUN npm run build

# Last stage: discard everything except our executables.
FROM golang:1.20 AS prod

# Set our next working directory.
WORKDIR /app

# Copy our executable and our built React application.
COPY --from=backend-builder /backendcompile/bin ./bin
COPY --from=frontend-builder /frontendcompile/build ./build
RUN [ "chmod", "+x", "/app/bin/movie_ticket_front_api.exe"]
ENTRYPOINT ["./bin/movie_ticket_front_api.exe"]
# Declare entrypoints and activation commands.
EXPOSE 8282

