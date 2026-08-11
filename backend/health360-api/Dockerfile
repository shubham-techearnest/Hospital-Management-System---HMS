# Multi-stage build for Health360 API [DOC-13 §5]
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && \
    mvn -B -q package -DskipTests && \
    apk del maven

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S health360 && adduser -S health360 -G health360
WORKDIR /app
COPY --from=build /app/target/health360-api-*.jar app.jar
RUN mkdir -p /app/.local/uploads /tmp/health360 && chown -R health360:health360 /app /tmp/health360
USER health360
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
