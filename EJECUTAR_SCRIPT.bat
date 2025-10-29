@echo off
REM Script para ejecutar SETUP_POSTGRES_LOCAL.sql en PostgreSQL
REM Cambia la ruta si es necesario

echo ========================================
echo Ejecutando SETUP_POSTGRES_LOCAL.sql
echo ========================================
echo.

REM Cambiar al directorio del proyecto
cd /d "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\CalendarioServicio\project"

REM Verificar que el archivo existe
if not exist "SETUP_POSTGRES_LOCAL.sql" (
    echo ERROR: No se encuentra el archivo SETUP_POSTGRES_LOCAL.sql
    echo Asegúrate de estar en el directorio correcto.
    pause
    exit /b 1
)

echo Archivo encontrado. Ejecutando script...
echo.

REM Ejecutar el script SQL
psql -U postgres -d calendario_servicios -f SETUP_POSTGRES_LOCAL.sql

echo.
echo ========================================
echo Script ejecutado. Revisa los mensajes anteriores.
echo ========================================
pause


