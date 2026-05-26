import { z } from 'zod'

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const optionalText = z.preprocess(emptyToUndefined, z.string().optional())

export const arquivoVinculadoSchema = z.object({
  name: z.string().min(1, 'Nome do arquivo ausente.'),
  type: z.string().min(1, 'Tipo do arquivo ausente.'),
  url: z.string().url('URL do arquivo inválida.'),
  bucket_path: z.string().min(1, 'Caminho do arquivo ausente.'),
  size: z.number().int().nonnegative('Tamanho do arquivo inválido.'),
})

export const submitDenunciaSchema = z.object({
  categoria_id: z.string().uuid('Categoria inválida.'),
  titulo: z.string().trim().min(5, 'Informe um título com pelo menos 5 caracteres.').max(140, 'O título deve ter no máximo 140 caracteres.'),
  descricao_original: z.string().trim().min(20, 'Descreva o ocorrido com pelo menos 20 caracteres.').max(8000, 'A descrição deve ter no máximo 8000 caracteres.'),
  local: optionalText,
  cep: optionalText,
  numero: optionalText,
  bairro: optionalText,
  cidade: optionalText,
  data_ocorrido: optionalText,
  nome: optionalText,
  email: z.string().trim().toLowerCase().email('E-mail de identificação inválido.'),
  telefone: z.string().trim().min(8, 'O número de telefone/WhatsApp é obrigatório.'),
  cpf: z.string().trim().min(11, 'O CPF é obrigatório para a identificação oficial.'),
  otpToken: z.string().trim().min(4, 'Código de verificação inválido.'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  municipio: optionalText,
})

export const arquivosVinculadosSchema = z.array(arquivoVinculadoSchema).max(20, 'Limite máximo de arquivos excedido.')

export type ArquivoVinculadoInput = z.infer<typeof arquivoVinculadoSchema>
