# --- Build stage --------------------------------------------------------------
FROM golang:1.22-alpine AS build
WORKDIR /src

# Cache deps separately from source for faster rebuilds
COPY go.mod ./
RUN go mod download

COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/celpip-audio .

# --- Runtime stage ------------------------------------------------------------
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=build /out/celpip-audio /app/celpip-audio
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/app/celpip-audio"]
