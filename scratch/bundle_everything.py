import os
import codecs

files_to_bundle = [
    "utils/supabase/middleware.ts",
    "utils/supabase/server.ts",
    "lib/supabase-admin.ts",
    "lib/encrypt.ts",
    "lib/webhook.ts",
    "lib/pdf.ts",
    "lib/protocolo.ts",
    "lib/email.ts",
    "lib/documento.ts",
    "lib/actions/auth.ts",
    "lib/actions/denuncia.ts",
    "types/index.ts",
    "components/public/denuncia-form-wizard.tsx"
]

output_path = r"C:\Users\paulo\.gemini\antigravity\brain\a7697f6d-bec9-47da-b83d-8ece13135363\denunciams_full_codebase_bundle.md"

with codecs.open(output_path, "w", encoding="utf-8") as outfile:
    outfile.write("# 📦 Bundle Completo de Código — DenunciaMS (Versão Final)\n\n")
    outfile.write("Este documento contém o código-fonte integral de todos os componentes core, bibliotecas e ações da plataforma.\n\n---\n\n")

    for file_rel_path in files_to_bundle:
        if os.path.exists(file_rel_path):
            with codecs.open(file_rel_path, "r", encoding="utf-8") as infile:
                content = infile.read()
                outfile.write(f"## 📄 Arquivo: `{file_rel_path}`\n")
                outfile.write("```typescript\n")
                outfile.write(content)
                outfile.write("\n```\n\n---\n\n")
        else:
            outfile.write(f"## ❌ Arquivo não encontrado: `{file_rel_path}`\n\n---\n\n")

print(f"Bundle successfully created at: {output_path}")
