<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Clase modificada</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #F3F4F6; padding: 20px; margin: 0;">

<div style="max-width: 520px; margin: auto; background: #FFFFFF; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

    <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #F59E0B; font-weight: bold; margin: 0; font-size: 22px; letter-spacing: 1px;">
            ✏️ CLASE MODIFICADA
        </h2>
        <p style="color: #4B5563; font-size: 14px; margin-top: 8px;">Personal Box Armenia</p>
    </div>

    <p style="color: #4B5563; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
        Una clase que tienes reservada ha sido modificada por el administrador. Aquí están los cambios:
    </p>

    <div style="background: #FFFBEB; border: 2px solid #F59E0B; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0 0 12px; font-size: 17px; font-weight: bold; color: #92400E;">
            {{ $clase->tipoClase->nombre ?? 'Clase' }}
        </p>

        @foreach($cambios as $campo => $valores)
            <div style="padding: 8px 0; border-bottom: 1px solid #FDE68A;">
                <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #92400E; font-weight: bold;">
                    {{ $campo }}
                </p>
                <div style="display: flex; gap: 12px;">
                <span style="color: #EF4444; font-size: 14px; text-decoration: line-through;">
                    Antes: {{ $valores['anterior'] }}
                </span>
                    &nbsp;→&nbsp;
                    <span style="color: #059669; font-size: 14px; font-weight: bold;">
                    Ahora: {{ $valores['nuevo'] }}
                </span>
                </div>
            </div>
        @endforeach
    </div>

    <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
        Si estos cambios no te convienen, puedes cancelar tu reserva desde el sistema.
        Para más información, contáctanos.
    </p>

    <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;">

    <p style="font-size: 12px; color: #9CA3AF; text-align: center; margin: 0;">
        Personal Box Armenia · Armenia, Quindío
    </p>

</div>

</body>
</html>
