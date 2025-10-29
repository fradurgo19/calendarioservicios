# Script para crear usuario administrador
$body = @{
    username = "admin"
    email = "admin@partequipos.com"
    password = "admin123"
    role = "Administrator"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

