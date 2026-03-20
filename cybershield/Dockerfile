FROM eclipse-temurin:21-jdk-alpine AS build
COPY . .
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
COPY --from=build build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]