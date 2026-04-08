<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Restablecer contraseña</title>
    <style>
        /* Reset básico email */
        body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
        table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
        img { -ms-interpolation-mode:bicubic; }
        body { margin:0 !important; padding:0 !important; width:100% !important; height:100% !important; }

        .email-bg {
            background-color:#000000;
            background-image:
                radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,20,147,0.20) 0%, transparent 60%),
                radial-gradient(ellipse 60% 80% at 80% 70%, rgba(255,20,147,0.12) 0%, transparent 60%);
        }

        .email-card {
            width:100%;
            max-width:600px;
            border:1px solid #2a2a2a;
            border-radius:14px;
            overflow:hidden;
            background:#0b0b0f;
            box-shadow:0 0 40px rgba(255,20,147,0.15);
        }

        .header {
            background:rgba(255,255,255,0.03);
            border-bottom:1px solid rgba(255,20,147,0.35);
            padding:18px 24px;
        }

        .brand {
            margin:0;
            color:#FF1493;
            font-family:Arial, Helvetica, sans-serif;
            font-size:18px;
            font-weight:800;
            letter-spacing:2px;
            text-transform:uppercase;
            text-shadow:0 0 10px rgba(255,20,147,0.45);
        }

        .content {
            padding:26px 24px;
            font-family:Arial, Helvetica, sans-serif;
            color:#e5e7eb;
        }

        .title {
            margin:0 0 14px;
            color:#ffffff;
            font-size:22px;
            line-height:1.2;
            font-weight:800;
        }

        .text {
            margin:0 0 14px;
            color:#c7c9d1;
            font-size:15px;
            line-height:1.7;
        }

        .text-muted {
            margin:0;
            color:#9ca3af;
            font-size:13px;
            line-height:1.6;
        }

        .cta-wrap { padding:10px 0 18px; text-align:center; }

        .cta {
            display:inline-block;
            background:#FF1493;
            color:#ffffff !important;
            text-decoration:none;
            font-family:Arial, Helvetica, sans-serif;
            font-size:14px;
            font-weight:700;
            letter-spacing:.3px;
            padding:12px 22px;
            border-radius:10px;
            box-shadow:0 0 18px rgba(255,20,147,0.45);
        }

        .link {
            color:#FF1493;
            text-decoration:underline;
            word-break:break-all;
        }

        .footer {
            padding:14px 24px;
            border-top:1px solid rgba(255,20,147,0.20);
            background:#08080b;
            color:#6b7280;
            font-family:Arial, Helvetica, sans-serif;
            font-size:12px;
            text-align:center;
        }

        @media screen and (max-width: 600px) {
            .outer-pad { padding:14px 10px !important; }
            .content { padding:20px 16px !important; }
            .header, .footer { padding-left:16px !important; padding-right:16px !important; }
            .brand { font-size:16px !important; letter-spacing:1.5px !important; }
            .title { font-size:20px !important; }
            .text { font-size:14px !important; }
            .cta {
                display:block !important;
                width:100% !important;
                box-sizing:border-box !important;
                text-align:center !important;
                padding:12px 14px !important;
            }
        }
    </style>
</head>
<body class="email-bg" style="background-color:#000000; margin:0; padding:0;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-bg" style="background-color:#000000;">
    <tr>
        <td align="center" class="outer-pad" style="padding:24px 12px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-card" width="100%">
                <tr>
                    <td class="header">
                        <p class="brand">PERSONAL BOX</p>
                    </td>
                </tr>

                <tr>
                    <td class="content">
                        <h1 class="title">Restablece tu contraseña</h1>

                        <p class="text">
                            Hola {{ $cliente->name ?? 'usuario' }},
                        </p>

                        <p class="text">
                            Recibimos una solicitud para cambiar tu contraseña. Presiona el siguiente botón para continuar.
                        </p>

                        <div class="cta-wrap">
                            <a href="{{ $resetUrl }}" class="cta">Restablecer contraseña</a>
                        </div>

                        <p class="text">
                            Este enlace expirará en <strong>{{ $expiraMinutos }} minutos</strong>.
                        </p>

                        <p class="text" style="margin-bottom:8px;">
                            Si el botón no funciona, copia y pega este enlace en tu navegador:
                        </p>

                        <p class="text" style="margin-bottom:16px;">
                            <a href="{{ $resetUrl }}" class="link">{{ $resetUrl }}</a>
                        </p>

                        <p class="text-muted">
                            Si no solicitaste este cambio, puedes ignorar este correo.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td class="footer">
                        © {{ date('Y') }} Personal Box Armenia. Todos los derechos reservados.
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>

