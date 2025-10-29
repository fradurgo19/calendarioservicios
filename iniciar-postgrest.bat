@echo off
echo ========================================
echo Iniciando PostgREST para PostgreSQL Local
echo ========================================
echo.

REM Cambiar al directorio donde está PostgREST
REM AJUSTA ESTA RUTA según dónde instalaste PostgREST
cd /d "C:\PostgREST"

REM Verificar que postgrest.exe existe
if not exist "postgrest.exe" (
    echo ERROR: No se encuentra postgrest.exe
    echo.
    echo Por favor, asegúrate de:
    echo 1. Haber descargado PostgREST desde: https://github.com/PostgREST/postgrest/releases
    echo 2. Haber extraído el archivo en C:\PostgREST\
    echo 3. Haber renombrado el ejecutable a postgrest.exe
    echo 4. O ajusta la ruta en este script (línea 9)
    echo.
    pause
    exit /b 1
)

REM Verificar que postgrest.conf existe
if not exist "postgrest.conf" (
    echo ADVERTENCIA: No se encuentra postgrest.conf
    echo.
    echo Crea un archivo postgrest.conf con la configuración necesaria.
    echo Puedes usar postgrest.conf.example como referencia.
    echo.
    pause
    exit /b 1
)

echo PostgREST encontrado. Iniciando servidor...
echo.
echo PostgREST estará disponible en: http://localhost:3001
echo.
echo Mantén esta ventana abierta mientras uses la aplicación.
echo Presiona Ctrl+C para detener PostgREST.
echo.
echo ========================================
echo.

REM Iniciar PostgREST
postgrest.exe postgrest.conf

pause

