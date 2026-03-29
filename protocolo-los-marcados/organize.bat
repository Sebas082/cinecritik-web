@echo off
mkdir frontend
mkdir backend
move src\main\resources\static\* frontend\
rmdir /S /Q src\main
move data backend\
move lib backend\
move out backend\
move src backend\
move clean_project.bat backend\
move run_server.bat backend\
