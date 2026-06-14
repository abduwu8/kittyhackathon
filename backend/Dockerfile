FROM golang:1.23-alpine AS builder

RUN apk add --no-cache ca-certificates git

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server

FROM alpine:3.20

RUN apk add --no-cache ca-certificates

WORKDIR /app

RUN adduser -D -g '' appuser

COPY --from=builder /server /app/server
COPY assets /app/assets

ENV PORT=8080
ENV FRONTEND_ASSETS_PATH=/app/assets

EXPOSE 8080

USER appuser

CMD ["/app/server"]
