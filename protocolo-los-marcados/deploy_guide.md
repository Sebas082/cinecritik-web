# Guía de Despliegue: CineCritik a Internet

Ya he preparado el código para que sea compatible con la nube. Ahora falta el último paso: subirlo a tu GitHub y conectarlo a Render.

### Paso 1: Subir tu código a GitHub
Sigue estos pasos en tu computadora (PowerShell o CMD dentro de la carpeta del proyecto):

1.  **Inicializar Git**:
    ```bash
    git init
    git add .
    git commit -m "Preparado para despliegue en Render"
    ```
2.  **Crear el repositorio en la web**:
    *   Ve a [github.com/new](https://github.com/new).
    *   Ponle de nombre `cinecritik-web`.
    *   Crea el repositorio (sin README ni .gitignore).
3.  **Conectar y subir**:
    *   Copia los comandos que te da GitHub (algo parecido a esto):
    ```bash
    git remote add origin https://github.com/TU_USUARIO/cinecritik-web.git
    git branch -M main
    git push -u origin main
    ```

---

### Paso 2: Conectar con Render.com
Una vez que el código esté en GitHub:

1.  Entra en el [Dashboard de Render](https://dashboard.render.com/).
2.  Haz clic en **New +** y selecciona **Web Service**.
3.  Conecta tu cuenta de GitHub (si no lo has hecho) y selecciona el repositorio `cinecritik-web`.
4.  **Configuración del servicio**:
    *   **Name**: `cinecritik` (o el que quieras).
    *   **Region**: Cualquiera (ej: Oregon).
    *   **Runtime**: Selecciona **Docker**. (Esto es FUNDAMENTAL).
    *   **Instance Type**: Free (Gratis).
5.  Haz clic en **Create Web Service**.

---

### Paso 3: ¡Listo!
*   Render empezará a leer tu `Dockerfile`, instalará Java, compilará y encenderá el servidor.
*   En unos minutos verás un mensaje que dice **"Live"**.
*   Te darán un enlace (ej: `https://cinecritik.onrender.com`). **¡Esa es tu página web pública!**

> [!WARNING]
> **Recordatorio:** Como usamos la versión gratuita, si nadie entra a la página por 15 minutos, el servidor se "duerme". Al entrar de nuevo, tardará unos 30 segundos en despertar. Además, recuerda que los datos se reinician al apagarse.
