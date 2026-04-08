<!DOCTYPE html>
<html lang="es" style="background:#000000 !important;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>{{ ($context ?? 'login_2fa') === 'email_change' ? 'Confirmación de cambio de correo' : 'Código de verificación 2FA' }}</title>
    <style>
        html, body { margin:0 !important; padding:0 !important; background:#000000 !important; }
        table{border-collapse:collapse;border-spacing:0;}
        .wrapper{width:100%;background:#000000 !important;}
        .container{width:100%;max-width:620px;margin:0 auto;}
        .card{
            background:#0b0b0b;
            border:1px solid rgba(255,20,147,.28);
            border-radius:18px;
            box-shadow:0 0 0 1px rgba(255,20,147,.14),0 0 28px rgba(255,20,147,.2),0 16px 40px rgba(0,0,0,.55);
        }
        .badge{
            display:inline-block;
            color:#FF1493;
            border:1px solid rgba(255,20,147,.45);
            background:rgba(255,20,147,.12);
            border-radius:999px;
            padding:6px 12px;
            font:700 11px Arial,Helvetica,sans-serif;
            letter-spacing:1px;
            text-transform:uppercase;
        }
        .title{
            margin:0;
            color:#FF1493;
            font:900 28px/1.2 Arial,Helvetica,sans-serif;
            letter-spacing:2px;
            text-shadow:0 0 14px rgba(255,20,147,.45);
        }
        .subtitle{
            margin:0;
            color:#8c8c8c;
            font:400 14px/1.6 Arial,Helvetica,sans-serif;
        }
        .otp-wrap{
            background:#050505;
            border:1px solid rgba(255,20,147,.35);
            border-radius:12px;
            padding:16px 10px;
        }
        .otp{
            margin:0;
            color:#FF1493;
            text-align:center;
            font:900 42px/1 "Courier New",monospace;
            letter-spacing:10px;
            text-shadow:0 0 16px rgba(255,20,147,.5);
        }
        .hint{margin:0;color:#9a9a9a;font:400 13px/1.5 Arial,Helvetica,sans-serif;}
        .divider{border-top:1px solid rgba(255,255,255,.12);}
        .foot{margin:0;color:#666;font:400 12px/1.6 Arial,Helvetica,sans-serif;}
        .city{margin:6px 0 0;color:rgba(255,20,147,.5);font:700 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:1.6px;}
        @media only screen and (max-width:600px){
            .px{padding-left:18px!important;padding-right:18px!important;}
            .py{padding-top:24px!important;padding-bottom:24px!important;}
            .title{font-size:22px!important;letter-spacing:1px!important;}
            .otp{font-size:34px!important;letter-spacing:8px!important;}
        }
        @media only screen and (max-width:420px){
            .otp{font-size:30px!important;letter-spacing:6px!important;}
            .subtitle{font-size:13px!important;}
        }
    </style>
</head>
<body bgcolor="#000000" style="margin:0!important;padding:0!important;background:#000000!important;">
<table role="presentation" class="wrapper" width="100%" bgcolor="#000000" style="background:#000000 !important;">
    <tr>
        <td align="center" bgcolor="#000000" style="padding:28px 12px; background:#000000 !important;">
            <table role="presentation" class="container" width="100%">
                <tr>
                    <td class="card px py" style="padding:30px 28px;">
                        <table role="presentation" width="100%">
                            <tr>
                                <td align="center" style="padding-bottom:12px;">
                                    <span class="badge">Verificación segura</span>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-bottom:8px;">
                                    <div style="font-size:34px;line-height:1;">🔒</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-bottom:10px;">
                                    <h1 class="title">
                                        {{ ($context ?? 'login_2fa') === 'email_change' ? 'CONFIRMA TU NUEVO CORREO' : 'VERIFICACIÓN 2FA' }}
                                    </h1>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-bottom:18px;">
                                    <p class="subtitle">
                                        @if(($context ?? 'login_2fa') === 'email_change')
                                            Ingresa este código de 6 dígitos para aprobar el cambio de correo{{ !empty($targetEmail) ? ' a '.$targetEmail : '' }}.
                                        @else
                                            Ingresa este código de 6 dígitos para completar tu inicio de sesión.
                                        @endif
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom:14px;">
                                    <div class="otp-wrap">
                                        <p class="otp">{{ $otp }}</p>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-bottom:18px;">
                                    <p class="hint">El código expira en <strong style="color:#ffffff;">5 minutos</strong>.</p>
                                </td>
                            </tr>
                            <tr><td class="divider" style="padding-top:16px;"></td></tr>
                            <tr>
                                <td align="center" style="padding-top:14px;">
                                    <p class="foot">Si no solicitaste este código, ignora este correo.</p>
                                    <p class="city">ARMENIA, QUINDÍO</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
