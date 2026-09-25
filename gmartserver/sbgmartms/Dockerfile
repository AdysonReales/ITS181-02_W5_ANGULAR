FROM amazoncorretto:17

LABEL mentainer="ltgabriel@mapua.edu.ph"

WORKDIR /opt/app

EXPOSE 8080

COPY target/sbemplms-1.0-SNAPSHOT.jar /opt/app/sbemplms.jar

ENTRYPOINT ["java", "-jar", "sbemplms.jar"]