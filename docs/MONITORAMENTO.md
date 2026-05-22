# Monitoramento e Operacao

## Fontes internas

Painel admin:

- `/admin/saude`: estatisticas de sistema e manutencao.
- `/admin/integracoes`: saude de encaminhamentos por categoria.
- `/admin/logs`: auditoria operacional.
- `/admin/denuncias`: fila e situacao dos protocolos.

Tabelas relevantes:

- `despacho_queue`: acompanhar `pendente`, `erro` e `falha_definitiva`.
- `log_integracoes`: acompanhar status de e-mail/webhook.
- `logs_manutencao`: acompanhar limpeza de storage.
- `logs_acesso_denuncia`: acompanhar tentativas de consulta.
- `audit_log`: acompanhar acoes administrativas.

## Alertas recomendados

Criar alerta operacional quando:

- `despacho_queue` tiver itens em `erro` por mais de 10 minutos.
- Houver item em `falha_definitiva`.
- `log_integracoes` registrar falhas consecutivas para a mesma categoria.
- `/api/worker/despacho` retornar 5xx.
- `/api/cron/cleanup-storage` retornar 401/5xx.
- Volume de anexos crescer acima do esperado.
- Login admin tiver aumento incomum de falhas.

## Rotina pos-deploy

Durante 30 minutos apos deploy:

1. Abrir home publica e pagina de denuncia.
2. Validar login admin.
3. Validar dashboard admin.
4. Validar `/admin/saude`.
5. Verificar logs da Vercel.
6. Verificar fila `despacho_queue`.
7. Verificar `log_integracoes`.
8. Registrar resultado no changelog operacional.

## Incidente

Em caso de incidente:

- Congelar novas mudancas.
- Identificar se o problema e codigo, banco, storage, e-mail ou variavel.
- Executar rollback conforme `docs/PRODUCAO_RUNBOOK.md`.
- Registrar horario de inicio, impacto, causa provavel, decisao tomada e validacao final.
