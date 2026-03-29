@echo off
setlocal
echo =======================================
echo     Compilando y Ejecutando CineCritik
echo =======================================

pushd backend
if not exist out mkdir out

echo Compilando...
javac -d out -encoding UTF-8 -cp ".;lib\sqlite-jdbc.jar" src\*.java

IF %ERRORLEVEL% NEQ 0 (
  echo Error en compilacion!
  popd
  pause
  exit /b %ERRORLEVEL%
)

echo Compilacion exitosa. Arrancando servidor...
java -cp "out;lib\sqlite-jdbc.jar" Main

popd
endlocal
