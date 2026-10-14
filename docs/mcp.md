# MCP del proyecto

Cada cliente de agentes (Claude Code, Cursor, VS Code, Codex, Gemini, OpenCode, Antigravity) trae los mismos servidores configurados a nivel de proyecto. Todos son de lectura: un agente mira y sugiere, y una persona decide.

## Activos

| Servidor | Para qué | Acceso |
|---|---|---|
| `chrome-devtools` | Verificar cada cambio visual: Lighthouse, trazas, consola, capturas (skill `verify-ui`) | Local, perfil aislado |
| `cloudflare-docs` | Documentación vigente de Workers, KV, Analytics Engine, Turnstile | Abierto |
| `cloudflare-observability` | Logs y errores del Worker en producción | OAuth con la cuenta de Cloudflare |
| `cloudflare-graphql` | Tráfico, países, estados HTTP y analítica de la zona y del Worker | OAuth con la cuenta de Cloudflare |

Las visitas que el Worker anota (página, origen, UTM, país, persona, bot o agente de IA) están en Analytics Engine, dataset `chambeasimple_visits`. Se consultan con su API de SQL; `pnpm visits` las resumirá cuando exista el token de solo lectura.

## Cuando corresponda

| Servidor | Cuándo | Por qué esperar |
|---|---|---|
| Google Search Console (`AminForou/mcp-gsc`, MIT; no hay uno oficial) | Cuando el dominio esté en Cloudflare y verificado en Search Console | Sin dominio verificado no hay datos |
| Google Ads (`googleads/google-ads-mcp`, oficial, solo lectura) | En la primera campaña | Necesita la cuenta de Ads y un token de desarrollador |
| Meta Ads (`mcp.facebook.com/ads`, oficial, beta) | Si se anuncia en Meta | Puede escribir: conectarlo con el nivel de solo lectura |
| Google Analytics | Nunca, salvo que se adopte GA4 | El sitio no usa GA4 ni cookies |

Regla: ningún MCP con permisos de escritura por defecto. Si alguno los necesita para una tarea concreta, se conecta para esa tarea y se desconecta después.

## Cómo se usan

La skill `weekly-review` junta todo una vez por semana: tráfico y de dónde viene, qué páginas convierten, qué buscan en Google, el estado de Lighthouse y errores de producción, y termina con tres sugerencias concretas.
