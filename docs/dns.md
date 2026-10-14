# DNS de chambasimple.com

Zona en Cloudflare (plan gratis), cuenta de Alex. Nameservers asignados: `anna.ns.cloudflare.com` y `khalid.ns.cloudflare.com` (antes, en Namecheap: `dns1/dns2.registrar-servers.com`).

## Correo (SimpleLogin): todo en "DNS only", sin proxy

| Tipo | Nombre | Contenido |
|---|---|---|
| MX | `@` | `mx1.simplelogin.co` (10) |
| MX | `@` | `mx2.simplelogin.co` (20) |
| TXT | `@` | `v=spf1 include:simplelogin.co ~all` |
| TXT | `@` | `sl-verification=…` (el de SimpleLogin) |
| CNAME | `dkim._domainkey` | `dkim._domainkey.simplelogin.co` |
| CNAME | `dkim02._domainkey` | `dkim02._domainkey.simplelogin.co` |
| CNAME | `dkim03._domainkey` | `dkim03._domainkey.simplelogin.co` |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; pct=100; adkim=s; aspf=s` |
| TXT | `@` | `google-site-verification=…` (Google Postmaster Tools, cuenta hola@) |

Verificado el 2026-10-14: los nameservers de Cloudflare respondían exactamente lo mismo que Namecheap antes del cambio. La importación automática de Cloudflare trajo solo uno de los tres DKIM, y con proxy: se corrigió a mano. Si se repite la importación, revisar esto.

Prueba en mail-tester (2026-10-14, desde Proton por un alias inverso): 8,9/10. SPF, DKIM y DMARC pasan y la IP no está en listas negras. Lo que resta: dominio de menos de 28 días (`FROM_FMBLA_NEWDOM28`, se va solo) y LinkedIn, que responde 999 a los robots (falso enlace roto). Si un correo a Gmail cae en spam, es reputación del dominio nuevo, no configuración: Postmaster Tools (dominio verificado) muestra la reputación cuando hay volumen.

## Web

- `chambasimple.com`: dominio propio del Worker `chambeasimple-web` (con proxy, lo crea Wrangler).
- `www.chambasimple.com`: redirige con 308 a `chambasimple.com`.
- `agenda.chambasimple.com`: dominio propio del Worker `chambeasimple-agenda`.

## Rastreadores de IA

Búsqueda, agentes y entrenamiento: permitidos (decisión del 2026-10-14). El sitio quiere ser leído por IA (`llms.txt`, Markdown por página). Sin Bot Fight Mode: bloquearía a esos agentes. El captcha (Turnstile) solo está en el formulario de la agenda.
