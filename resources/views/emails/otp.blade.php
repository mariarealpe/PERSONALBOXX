<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Código de verificación</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #F3F4F6; padding: 20px;">

<div style="
        max-width: 500px;
        margin: auto;
        background: #FFFFFF;
        padding: 30px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    ">

    <h2 style="color: #1E3A8A; font-weight: bold;">
        Código de verificación
    </h2>

    <p style="color: #4B5563; font-size: 16px;">
        Tu código 2FA es:
    </p>

    <div style="margin: 20px 0;">
        <h1 style="
                font-size: 40px;
                color: #3B82F6;
                letter-spacing: 6px;
                font-weight: bold;
            ">
            {{ $otp }}
        </h1>
    </div>

    <p style="color: #6B7280; font-size: 14px;">
        Este código expira en 5 minutos.
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">

    <p style="font-size: 12px; color: #9CA3AF;">
        Si no solicitaste este código, ignora este correo.
    </p>

</div>

</body>
</html>
