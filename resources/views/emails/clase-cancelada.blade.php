<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Clase cancelada</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #F3F4F6; padding: 20px; margin: 0;">

<div style="max-width: 520px; margin: auto; background: #FFFFFF; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

    <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #EF4444; font-weight: bold; margin: 0; font-size: 22px; letter-spacing: 1px;">
            ❌ CLASE CANCELADA
        </h2>
        <p style="color: #4B5563; font-size: 14px; margin-top: 8px;">Personal Box Armenia</p>
    </div>

    <p style="color: #4B5563; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
        Lamentamos informarte que la siguiente clase ha sido cancelada:
    </p>

    <div style="background: #FEF2F2; border: 2px solid #EF4444; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold; color: #EF4444;">
            {{ $clase->tipoClase->nombre ?? 'Clase' }}
        </p>
        <p style="margin: 0 0 6px; color: #4B5563; font-size: 14px;">
            📅 {{ \Carbon\Carbon::parse($clase->fecha_hora_inicio)->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY') }}
        </p>
        <p style="margin: 0 0 6px; color: #4B5563; font-size: 14px;">
            🕐 {{ \Carbon\Carbon::parse($clase->fecha_hora_inicio)->format('H:i') }} – {{ \Carbon\Carbon::parse($clase->fecha_hora_fin)->format('H:i') }}
        </p>
        @if($clase->instructor)
            <p style="margin: 0; color: #4B5563; font-size: 14px;">
                👨‍🏫 {{ $clase->instructor->name }}
            </p>
        @endif
    </div>

    <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">
        Tu reserva ha sido cancelada automáticamente. Disculpa los inconvenientes.
        Puedes reservar otra clase disponible desde el sistema.
    </p>

    <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;">

    <p style="font-size: 12px; color: #9CA3AF; text-align: center; margin: 0;">
        Personal Box Armenia · Armenia, Quindío
    </p>

</div>

</body>
</html>
