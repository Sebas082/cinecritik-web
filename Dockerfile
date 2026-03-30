# Usar una imagen oficial de Java (JDK) de Eclipse Temurin
FROM eclipse-temurin:11-jdk

# Instalar curl para descargar el driver de Postgres
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiar todo el contenido del repositorio al contenedor
COPY . .

# Crear la carpeta de librerías y descargar el driver de PostgreSQL
RUN mkdir -p /app/protocolo-los-marcados/backend/lib && \
    curl -L -o /app/protocolo-los-marcados/backend/lib/postgresql-42.7.2.jar https://jdbc.postgresql.org/download/postgresql-42.7.2.jar

# Crear la carpeta de datos para SQLite (como fallback)
RUN mkdir -p /app/data

# Compilar el backend incluyendo ambos drivers en el classpath
RUN mkdir -p /app/protocolo-los-marcados/backend/out && \
    javac -d /app/protocolo-los-marcados/backend/out \
          -encoding UTF-8 \
          -cp ".:/app/protocolo-los-marcados/backend/lib/*" \
          /app/protocolo-los-marcados/backend/src/*.java

# Exponer el puerto
EXPOSE 7071

# Comando para ejecutar la aplicación
WORKDIR /app/protocolo-los-marcados
CMD ["java", "-cp", "backend/out:backend/lib/*", "Main"]
