@echo off
echo =======================================================
echo          MEGA-LIMPIEZA DE ESPACIO DE TRABAJO
echo =======================================================
echo.
echo 1. Eliminando basura de desarrollo y ejecutables...
rmdir /S /Q out 2>nul
del /f /s /q src\*.class 2>nul

echo 2. Eliminando codigos viejos de la tematica Paranormal...
del /f /q src\Aleja.java 2>nul
del /f /q src\Andres.java 2>nul
del /f /q src\Sebastian.java 2>nul
del /f /q src\Persona.java 2>nul
del /f /q src\Investigable.java 2>nul
del /f /q src\ArchivoParanormal.java 2>nul
del /f /q src\VerifyDB.java 2>nul
del /f /q Downloader.java 2>nul
del /f /q src\compile.bat 2>nul
del /f /q test_sqlite.ps1 2>nul

echo 3. Limpiando datos obsoletos, credenciales de texto y librerias viejas...
del /f /q users.txt 2>nul
del /f /q data\*.txt 2>nul
del /f /q data\losmarcados.db 2>nul
del /f /q lib\java-driver*.jar 2>nul
del /f /q lib\slf4j*.jar 2>nul

echo 4. Borrando subcarpetas redundantes...
rmdir /S /Q web 2>nul
rmdir /S /Q src\main\java 2>nul

echo.
echo =======================================================
echo EXITO: Tu proyecto ahora esta 100%% purificado.
echo =======================================================
echo.
pause
