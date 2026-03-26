<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reserva confirmada</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

<div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    {{-- Header --}}
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #FF1493; margin: 0; font-size: 24px; letter-spacing: 1px;">PERSONAL BOX</h1>
        <p style="color: #aaa; margin: 5px 0 0; font-size: 13px;">Sistema de Gestión · Armenia</p>
    </div>

    {{-- Body --}}
    <div style="padding: 30px;">

        <div style="background: #f0fff4; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 6px; margin-bottom: 24px;">
            <p style="margin: 0; color: #333; font-size: 15px;">
                ✅ <strong>¡Reserva confirmada, {{ $cliente->name }}!</strong><br>
                Tu lugar en la clase ha sido reservado exitosamente.
            </p>
        </div>

        {{-- Detalle de la clase --}}
        <div style="background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 14px; color: #FF1493; font-size: 18px;">
                {{ $clase->tipoClase->nombre ?? 'Clase' }}
            </h3>
            <table style="width: 100%; font-size: 14px; color: #555;">
                <tr>
                    <td style="padding: 6px 0; border-bottom: 1px solid #eee;">📅 Fecha</td>
                    <td style="padding: 6px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333;">
                        {{ \Carbon\Carbon::parse($clase->fecha_hora_inicio)->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY') }}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; border-bottom: 1px solid #eee;">🕐 Horario</td>
                    <td style="padding: 6px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333;">
                        {{ \Carbon\Carbon::parse($clase->fecha_hora_inicio)->format('H:i') }} – {{ \Carbon\Carbon::parse($clase->fecha_hora_fin)->format('H:i') }}
                    </td>
                </tr>
                @if($clase->instructor)
                    <tr>
                        <td style="padding: 6px 0; border-bottom: 1px solid #eee;">👤 Instructor</td>
                        <td style="padding: 6px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333;">
                            {{ $clase->instructor->name }}
                        </td>
                    </tr>
                @endif
                @if($clase->sala)
                    <tr>
                        <td style="padding: 6px 0;">📍 Sala</td>
                        <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #333;">
                            {{ $clase->sala }}
                        </td>
                    </tr>
                @endif
            </table>
        </div>

        <div style="background: #fff8e1; border: 1px solid #f59e0b; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
            <p style="color: #92400E; font-size: 13px; margin: 0;">
                ⚠️ Recuerda que puedes cancelar hasta <strong>1 hora antes</strong> del inicio de la clase desde la sección <strong>Mis Reservas</strong>.
            </p>
        </div>

    </div>

    {{-- Footer --}}
    <div style="background: #1a1a2e; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">© 2026 <span style="color: #FF1493; font-weight: bold;">Personal Box Armenia</span> · Todos los derechos reservados</p>
    </div>

</div>
</body>
</html>
