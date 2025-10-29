@echo off
echo ========================================
echo Instalador Rápido de PostgREST
echo ========================================
echo.

REM Verificar si PostgREST ya está instalado
set POSTGREST_DIR=C:\PostgREST
if exist "%POSTGREST_DIR%\postgrest.exe" (
    echo PostgREST ya está instalado en %POSTGREST_DIR%
    echo.
    set /p continue="¿Deseas reinstalar? (S/N): "
    if /i not "%continue%"=="S" (
        echo Operación cancelada.
        pause
        exit /b 0
    )
)

echo.
echo Paso 1: Creando directorio...
if not exist "%POSTGREST_DIR%" (
    mkdir "%POSTGREST_DIR%"
    echo ✅ Directorio creado: %POSTGREST_DIR%
) else (
    echo ✅ Directorio ya existe: %POSTGREST_DIR%
)

echo.
echo Paso 2: Descargar PostgREST
echo.
echo Por favor, sigue estos pasos:
echo.
echo 1. Abre tu navegador en: https://github.com/PostgREST/postgrest/releases
echo 2. Descarga la última versión para Windows (postgrest-v12.x.x-windows-x64.zip)
echo 3. Extrae el archivo 'postgrest.exe' en: %POSTGREST_DIR%
echo.
set /p downloaded="Presiona Enter cuando hayas descargado y extraído PostgREST..."

if not exist "%POSTGREST_DIR%\postgrest.exe" (
    echo.
    echo ❌ ERROR: No se encuentra postgrest.exe en %POSTGREST_DIR%
    echo Por favor, asegúrate de haber extraído el archivo correctamente.
    pause
    exit /b 1
)

echo.
echo ✅ PostgREST encontrado!

echo.
echo Paso 3: Crear archivo de configuración
echo.

REM Solicitar información del usuario
set /p db_password="Ingresa la contraseña de PostgreSQL (usuario postgres): "
if "%db_password%"=="" (
    echo ERROR: La contraseña no puede estar vacía.
    pause
    exit /b 1
)

REM Crear archivo postgrest.conf
(
echo # PostgREST Configuration para PostgreSQL Local
echo db-uri = "postgresql://postgres:%db_password%@localhost:5432/calendario_servicios"
echo db-schema = "public"
echo db-anon-role = "postgres"
echo server-host = "127.0.0.1"
echo server-port = 3001
) > "%POSTGREST_DIR%\postgrest.conf"

echo.
echo ✅ Archivo de configuración creado: %POSTGREST_DIR%\postgrest.conf
echo.

echo ========================================
echo Instalación Completada
echo ========================================
echo.
echo Próximos pasos:
echo.
echo 1. Ejecuta: iniciar-postgrest.bat
echo    O manualmente: cd %POSTGREST_DIR% ^&^& postgrest.exe postgrest.conf
echo.
echo 2. Mantén PostgREST ejecutándose mientras uses la aplicación
echo.
echo 3. Asegúrate de que el archivo .env.local esté configurado
echo    con: VITE_SUPABASE_URL=http://localhost:3001
echo.
echo ========================================
echo.
pause

