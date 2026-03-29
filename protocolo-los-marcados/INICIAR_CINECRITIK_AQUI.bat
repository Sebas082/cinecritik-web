@echo off
setlocal
echo ===========================================
echo    INICIANDO CINECRITIK (SISTEMA REAL)
echo ===========================================
echo.

:: 1. Limpiar procesos de Java colgados
echo [!] Limpiando memoria...
taskkill /F /IM java.exe >nul 2>&1

:: 2. Entrar a backend
cd backend

:: 3. Compilar
echo [!] Compilando codigo nuevo...
if not exist out mkdir out
javac -d out -encoding UTF-8 -cp ".;lib\sqlite-jdbc.jar" src\*.java
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Hubo un problema al compilar. Revisa el codigo.
    pause
    exit /b
)

:: 4. Iniciar Servidor
echo.
echo [OK] Servidor iniciado correctamente en:
echo      http://127.0.0.1:7071
echo.
echo (Manten esta ventana abierta para usar la pagina)
echo.
java -cp "out;lib\sqlite-jdbc.jar" Main
pause
