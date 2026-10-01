cat > Dockerfile <<'DOCKERFILE'
FROM alpine:3
WORKDIR /app
COPY greet.sh .
ENTRYPOINT ["sh", "greet.sh"]
CMD ["world"]
DOCKERFILE
