FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 ramona
COPY --from=build /app/target/notificacion-service-0.0.1-SNAPSHOT.jar app.jar
USER ramona
EXPOSE 8087
ENTRYPOINT ["java", "-jar", "app.jar"]
