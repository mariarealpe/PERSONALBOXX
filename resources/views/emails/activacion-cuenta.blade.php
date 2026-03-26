<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Activa tu cuenta</title></head>
<body style="font-family:Arial,sans-serif;background:#F3F4F6;padding:20px;margin:0;">
<div style="max-width:520px;margin:auto;background:#fff;padding:32px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

    <!-- Logo / Header -->
    <div style="text-align:center;margin-bottom:28px;">
        <div style="width:68px;height:68px;background:linear-gradient(135deg,#FF1493,#C71585);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;">
            <span style="font-size:30px;">🥊</span>
        </div>
        <h2 style="color:#FF1493;font-weight:bold;margin:0;font-size:24px;letter-spacing:2px;">PERSONAL BOX</h2>
        <p style="color:#9CA3AF;font-size:13px;margin-top:4px;">Armenia, Quindío</p>
    </div>

    <!-- Saludo -->
    <p style="color:#374151;font-size:15px;margin-bottom:10px;">
        Hola @if($cliente->name && $cliente->name !== '')<strong>{{ $cliente->name }}</strong>@else<strong>!</strong>@endif,
    </p>

    <p style="color:#4B5563;font-size:14px;line-height:1.7;margin-bottom:24px;">
        El administrador de Personal Box te ha creado una cuenta en el sistema de gestión de clases.
        Para empezar a reservar tus clases grupales, activa tu cuenta haciendo clic en el siguiente botón:
    </p>

    <!-- Botón CTA -->
    <div style="text-align:center;margin:28px 0;">
        <a href="{{ $enlaceActivacion }}"
           style="display:inline-block;background:linear-gradient(135deg,#FF1493,#C71585);color:#fff;padding:15px 36px;border-radius:10px;font-weight:bold;font-size:16px;text-decoration:none;letter-spacing:1px;box-shadow:0 4px 16px rgba(255,20,147,0.4);">
            🚀 Activar mi cuenta
        </a>
    </div>

    <!-- Info del enlace -->
    <div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:8px;padding:14px 16px;margin:20px 0;">
        <p style="color:#92400E;font-size:13px;margin:0;line-height:1.6;">
            ⏰ <strong>Este enlace expira en 24 horas.</strong><br>
            Si no lo usas a tiempo, contacta al administrador para que te reenvíe el correo desde el panel.
        </p>
    </div>

    <!-- Instrucciones -->
    <p style="color:#6B7280;font-size:13px;line-height:1.7;margin-bottom:0;">
        Al hacer clic en el enlace podrás:<br>
        1. Elegir tu nombre de usuario<br>
        2. Crear tu contraseña<br>
        3. Verificar tu identidad con un código que recibirás por correo
    </p>

    <hr style="margin:24px 0;border:none;border-top:1px solid #E5E7EB;">

    <p style="font-size:12px;color:#9CA3AF;text-align:center;margin:0;">
        Si no esperabas este correo, ignóralo de forma segura.<br>
        Personal Box Armenia · No respondas a este correo.
    </p>
</div>
</body>
</html>
