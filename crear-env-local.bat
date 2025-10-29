@echo off
echo ========================================
echo Crear archivo .env.local para PostgreSQL Local
echo ========================================
echo.

REM Verificar si el archivo ya existe
if exist ".env.local" (
    echo El archivo .env.local ya existe.
    echo.
    set /p overwrite="¿Deseas sobrescribirlo? (S/N): "
    if /i not "%overwrite%"=="S" (
        echo Operación cancelada.
        pause
        exit /b 0
    )
)

REM Crear el archivo .env.local
(
echo # PostgreSQL Local con PostgREST
echo # Esta configuración conecta la aplicación a PostgreSQL local vía PostgREST
echo # 
echo # IMPORTANTE: 
echo # 1. Asegúrate de que PostgREST esté ejecutándose en http://localhost:3001
echo # Ver CONFIGURAR_POSTGRES_LOCAL.md para más detalles
echo.
echo # URL de PostgREST ^(API REST sobre PostgreSQL local^)
echo VITE_SUPABASE_URL=http://localhost:3001
echo.
echo # Clave anónima dummy para PostgREST ^(compatible con Supabase client^)
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
) > .env.local

echo.
echo ✅ Archivo .env.local creado exitosamente!
echo.
echo Próximos pasos:
echo 1. Asegúrate de que PostgREST esté ejecutándose ^(puerto 3001^)
echo 2. Reinicia el servidor de desarrollo: npm run dev
echo 3. La aplicación debería conectarse a PostgreSQL local
echo.
pause

