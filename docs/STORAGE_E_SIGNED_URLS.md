# Revisao de Storage e Signed URLs

## Estado revisado e corrigido

O codigo foi ajustado para nao persistir URL publica permanente em pontos sensiveis:

- `lib/actions/denuncia.ts`: upload de anexos retorna signed URL temporaria ao cliente e persiste `bucket_path`.
- `lib/actions/denuncia.ts`: `pdf_assinaturas.url_storage` passa a guardar o caminho do PDF no bucket, nao uma URL publica.
- `lib/actions/admin-denuncias.ts`: painel admin gera signed URLs temporarias para anexos.
- `lib/storage.ts`: helper central `criarSignedUrl()` encapsula `createSignedUrl`.
- E-mails baixam anexos server-side por `bucket_path`, sem depender de URL publica permanente.

Ainda ha migrations historicas com policies publicas para `denuncias` e `relatos-oficiais`. Elas nao devem ser aplicadas novamente em producao sem revisao. Se ja estiverem aplicadas no banco real, e necessario remover essas policies em janela controlada.

## Decisao para producao

Para producao profissional, anexos de denuncias e PDFs oficiais devem ser privados.

Modelo recomendado:

- Buckets privados: `denuncias` e `relatos-oficiais`.
- Banco armazena `bucket_path`, tamanho, tipo e hash quando aplicavel.
- URLs assinadas devem ser geradas somente em rotas autenticadas ou em fluxos que validem protocolo + chave de acesso.
- URLs assinadas devem ter TTL curto.
- E-mails podem anexar binarios baixados server-side, sem expor URL publica permanente.
- Conteudo publico, como banners e noticias, pode continuar em buckets publicos separados.

## Plano de migracao segura do banco/storage

Nao aplicar diretamente em producao sem janela e backup.

1. Confirmar no Supabase quais buckets existem e se estao publicos.
2. Criar ambiente staging com copia nao sensivel ou dados anonimizados.
3. Confirmar que o codigo publicado guarda somente `bucket_path` nos fluxos sensiveis.
4. Confirmar que telas admin usam URL assinada ou download autenticado.
5. Remover policies publicas dos buckets sensiveis em staging.
6. Marcar buckets `denuncias` e `relatos-oficiais` como privados.
7. Rodar fluxo completo: denuncia, anexos, PDF, despacho, acompanhamento e admin.
8. Gerar backup de producao.
9. Aplicar mudanca em producao somente apos aprovacao explicita.

## SQL de referencia para revisao

Nao executar sem confirmar nomes de policies no ambiente alvo:

```sql
drop policy if exists "Public Access Denuncias" on storage.objects;
drop policy if exists "Public Access Relatos" on storage.objects;

update storage.buckets
set public = false
where id in ('denuncias', 'relatos-oficiais');
```

## Bloqueio operacional

O codigo esta preparado para signed URLs, mas producao so deve ser considerada endurecida depois de validar no Supabase que os buckets `denuncias` e `relatos-oficiais` estao privados e sem policies publicas de leitura.

Esse bloqueio nao impede desenvolvimento local; impede apenas publicacao como producao final sem a validacao operacional do bucket no ambiente alvo.
