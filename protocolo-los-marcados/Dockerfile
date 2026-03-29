# Usar una imagen oficial de Java (JDK)
FROM openjdk:11-jdk-slim

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiar todo el contenido del proyecto al contenedor
COPY . .

# Crear la carpeta de datos para SQLite si no existe
RUN mkdir -p /app/data

# Compilar el backend
# Nota: La estructura es backend/src/*.java y los JARs en backend/lib/
RUN mkdir -p /app/backend/out && \
    javac -d /app/backend/out \
          -encoding UTF-8 \
          -cp ".:/app/backend/lib/*" \
          /app/backend/src/*.java

# Exponer el puerto (Render lo sobreescribe pero es buena práctica)
EXPOSE 7071

# Comando para ejecutar la aplicación
# Ejecutamos desde la raíz para que las rutas relativas a 'frontend' funcionen bien
CMD ["java", "-cp", "/app/backend/out:/app/backend/lib/sqlite-jdbc.jar", "Main"]
