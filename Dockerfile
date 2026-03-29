# Usar una imagen oficial de Java (JDK)
FROM openjdk:11-jdk-slim

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiar todo el contenido del repositorio al contenedor
COPY . .

# Crear la carpeta de datos para SQLite si no existe
RUN mkdir -p /app/data

# Compilar el backend
# La estructura ahora es protocolo-los-marcados/backend/src/*.java
RUN mkdir -p /app/protocolo-los-marcados/backend/out && \
    javac -d /app/protocolo-los-marcados/backend/out \
          -encoding UTF-8 \
          -cp ".:/app/protocolo-los-marcados/backend/lib/*" \
          /app/protocolo-los-marcados/backend/src/*.java

# Exponer el puerto (Render lo sobreescribe pero es buena práctica)
EXPOSE 7071

# Comando para ejecutar la aplicación
# Ejecutamos desde la raíz de la carpeta del proyecto para que las rutas relativas funcionen
# Cambiamos al directorio del proyecto para que Main encuentre 'frontend'
WORKDIR /app/protocolo-los-marcados
CMD ["java", "-cp", "backend/out:backend/lib/sqlite-jdbc.jar", "Main"]
