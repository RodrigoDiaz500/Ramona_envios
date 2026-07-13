# syntax=docker/dockerfile:1

# Etapa 1: compilar el microservicio seleccionado
FROM maven:3-eclipse-temurin-21 AS build

WORKDIR /workspace

COPY . .

ARG SERVICE

RUN test -n "$SERVICE" \
    && mvn -B -ntp -pl "$SERVICE" -am clean package -DskipTests \
    && JAR_FILE=$(find "$SERVICE/target" \
        -maxdepth 1 \
        -type f \
        -name "*.jar" \
        ! -name "original-*" \
        | head -n 1) \
    && test -n "$JAR_FILE" \
    && cp "$JAR_FILE" /workspace/app.jar

# Etapa 2: ejecutar únicamente el JAR
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

RUN groupadd --system spring \
    && useradd --system --gid spring spring

COPY --from=build --chown=spring:spring \
    /workspace/app.jar \
    /app/app.jar

USER spring

ENV JAVA_OPTS="-XX:MaxRAMPercentage=70.0 -XX:+UseG1GC"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]