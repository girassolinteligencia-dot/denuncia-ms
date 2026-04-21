import sys
import codecs

file_path = "c:/.MAIS/denuncia-ms/components/public/denuncia-form-wizard.tsx"

with codecs.open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

stepper_old = """      <div className="flex items-center justify-between mb-12 relative px-4">
         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2"></div>
         {[1, 2, 3, 4].map(s => (
           <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${step >= s ? 'bg-primary border-primary text-white shadow-glow-cyan' : 'bg-white border-border text-muted'}`}>
                 {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-primary' : 'text-muted/50'}`}>
                 {s === 1 ? 'Tipo' : s === 2 ? 'Fatos' : s === 3 ? 'Anexos' : 'Revisão'}
              </span>
           </div>
         ))}
      </div>"""

stepper_new = """      <div className="flex items-center justify-between mb-12 relative px-4">
         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2"></div>
         {[1, 2, 3, 4, 5].map(s => (
           <div key={s} className="flex flex-col items-center gap-2 text-center w-12 sm:w-16">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex mx-auto items-center justify-center font-bold text-sm transition-all border-2 ${step >= s ? 'bg-primary border-primary text-white shadow-glow-cyan' : 'bg-white border-border text-muted'}`}>
                 {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-primary' : 'text-muted/50'}`}>
                 {s === 1 ? 'Tipo' : s === 2 ? 'O Que' : s === 3 ? 'Onde' : s === 4 ? 'Provas' : 'Revisão'}
              </span>
           </div>
         ))}
      </div>"""

content = content.replace(stepper_old, stepper_new)

idx_start = content.find("        {step === 2 && (")
idx_end = content.find("      <div className=\"mt-8 flex items-center justify-center gap-4")

if idx_start == -1 or idx_end == -1:
    print("Boundaries not found!")
    sys.exit(1)

new_steps = """        {step === 2 && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-dark tracking-tighter italic uppercase">Relato do Ocorrido</h2>
                  <p className="text-muted text-sm font-medium">Conte-nos os detalhes fundamentais para a apuração.</p>
               </div>
               <div className="p-4 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-glow-cyan">
                  <FileText size={28} />
               </div>
            </div>

            <div className="space-y-8">
               <div className="space-y-6">
                  {/* Campos dinâmicos (não-endereço, não-identificação) */}
                  {camposVisiveis.map(campo => {
                     const isEndereco = ['local', 'numero', 'bairro', 'cidade', 'cep'].includes(campo.campo);
                     const isIdentificacao = ['nome', 'email', 'telefone', 'cpf'].includes(campo.campo);
                     
                     if (isEndereco || isIdentificacao || campo.campo === 'data_ocorrido') return null;

                     return (
                        <div key={campo.id} className="space-y-2">
                           <label className={`label text-[10px] font-black uppercase tracking-widest ${campo.obrigatorio ? 'label-required' : ''}`}>
                              {campo.label}
                           </label>
                           <input 
                             className="input h-12" 
                             placeholder={campo.placeholder || undefined} 
                             value={(formData as unknown as Record<string, string>)[campo.campo] || ''}
                             onChange={(e) => handleInputChange(campo.campo as keyof DenunciaFormData, e.target.value)}
                           />
                        </div>
                     )
                  })}

                  {/* Data do Ocorrido */}
                  {camposVisiveis.find(c => c.campo === 'data_ocorrido') && (
                     <div className="space-y-2">
                        <label className="label text-[10px] font-black uppercase tracking-widest label-required">Data do Ocorrido</label>
                        <input 
                          type="date" 
                          className="input h-12" 
                          value={formData.data_ocorrido}
                          onChange={(e) => handleInputChange('data_ocorrido', e.target.value)}
                        />
                     </div>
                  )}

                  <div className="space-y-2">
                     <label className="label label-required text-[10px] font-black uppercase tracking-widest">Descrição Detalhada</label>
                     <textarea 
                       className="input min-h-[180px] py-4 leading-relaxed text-sm" 
                       placeholder="Descreva aqui os fatos, pessoas envolvidas e qualquer detalhe que ajude na investigação."
                       value={formData.descricao_original}
                       onChange={(e) => handleInputChange('descricao_original', e.target.value)}
                     />
                  </div>
               </div>
            </div>

            <div className="flex justify-between pt-6">
               <button onClick={handleBack} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Voltar
               </button>
               <button 
                onClick={() => {
                   if (!formData.titulo || !formData.descricao_original) {
                      toast.error("Preencha o título e a descrição principal")
                      return
                   }
                   handleNext()
                }}
                className="btn-primary btn-md sm:btn-lg gap-2 min-w-[200px]"
               >
                  Localização da Ocorrência
                  <ArrowRight size={18} />
               </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-dark tracking-tighter italic uppercase">Localização</h2>
                  <p className="text-muted text-sm font-medium">Onde o fato aconteceu? Comece pelo CEP.</p>
               </div>
               <div className="p-4 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-glow-cyan">
                  <FileText size={28} />
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="label text-[10px] font-black uppercase tracking-widest label-required">CEP (Preenchimento Automático)</label>
                  <input 
                    className="input h-14 text-lg font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal" 
                    placeholder="00000-000" 
                    value={formData.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                  />
                  {loadingEnderecos && <p className="text-[10px] font-bold text-primary animate-pulse">Buscando endereço localmente...</p>}
               </div>
            
               <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3 relative">
                     <label className="label text-[10px] font-black uppercase tracking-widest label-required">Local / Rua / Logradouro</label>
                     <input 
                       className="input h-12 pr-10" 
                       placeholder="Ex: Av. Afonso Pena" 
                       value={formData.local}
                       onChange={(e) => handleSearchEndereco(e.target.value)}
                       autoComplete="off"
                     />
                     {sugestoesEndereco.length > 0 && (
                       <div className="absolute z-50 w-full mt-2 bg-white border-2 border-primary shadow-2xl rounded-2xl overflow-hidden animate-slide-up">
                          {sugestoesEndereco.map((s, idx) => (
                             <button
                               key={idx}
                               type="button"
                               onClick={() => handleSelectEndereco(s)}
                               className="w-full p-4 text-left hover:bg-surface border-b border-border last:border-none flex items-start gap-3 transition-colors group"
                             >
                                <div className="mt-1 p-1.5 bg-primary/5 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                   <Camera size={14} />
                                </div>
                                <div className="flex-grow min-w-0">
                                   <p className="text-[11px] font-black text-dark uppercase tracking-tighter leading-none mb-1">
                                      {s.display_name.split(',')[0]}
                                   </p>
                                   <p className="text-[10px] text-muted font-bold truncate">
                                      {s.display_name}
                                   </p>
                                </div>
                             </button>
                          ))}
                       </div>
                     )}
                  </div>
                  <div className="sm:col-span-1">
                     <label className="label text-[10px] font-black uppercase tracking-widest label-required">Número</label>
                     <input 
                       className="input h-12" 
                       placeholder="Ex: 123" 
                       value={formData.numero}
                       onChange={(e) => handleInputChange('numero', e.target.value)}
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                     <label className="label text-[10px] font-black uppercase tracking-widest label-required">Bairro</label>
                     <input 
                       className="input h-12" 
                       placeholder="Ex: Centro" 
                       value={formData.bairro}
                       onChange={(e) => handleInputChange('bairro', e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="label text-[10px] font-black uppercase tracking-widest label-required">Cidade / Município</label>
                     <input 
                       className="input h-12" 
                       placeholder="Ex: Campo Grande" 
                       value={formData.cidade}
                       onChange={(e) => handleInputChange('cidade', e.target.value)}
                     />
                  </div>
               </div>
            </div>

            <div className="flex justify-between pt-6">
               <button onClick={handleBack} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Voltar
               </button>
               <button 
                onClick={handleNext}
                className="btn-primary btn-md sm:btn-lg gap-2 min-w-[200px]"
               >
                  Enviar Evidências
                  <ArrowRight size={18} />
               </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-slide-up">
             <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-dark tracking-tighter italic uppercase">Provas & Evidências</h2>
                  <p className="text-muted text-sm font-medium">Anexe fotos, vídeos ou documentos que ajudem no caso.</p>
               </div>
               <div className="text-primary">
                  <Camera size={28} />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {politicasArquivo.filter(t => t.ativo).map(tipo => (
                 <label 
                  key={tipo.tipo} 
                  className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 hover:bg-surface hover:border-primary/50 transition-all cursor-pointer group"
                 >
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                    <div className="text-muted group-hover:text-primary transition-colors">
                       <Paperclip size={28} />
                    </div>
                    <div>
                       <p className="font-extrabold text-dark uppercase text-xs tracking-tight">Anexar {tipo.tipo}</p>
                       <p className="text-[10px] text-muted font-bold mt-1">Até {tipo.qtd_maxima} arquivos de {tipo.tamanho_max_mb}MB</p>
                    </div>
                 </label>
               ))}
            </div>

            {formData.arquivos.length > 0 && (
               <div className="bg-surface rounded-2xl p-4 space-y-2 border border-border">
                  <p className="text-[10px] font-black uppercase text-secondary">Arquivos Selecionados ({formData.arquivos.length})</p>
                  <div className="flex flex-wrap gap-2">
                     {formData.arquivos.map((f, i) => (
                        <div key={i} className="px-3 py-1.5 bg-white border border-border rounded-lg text-[10px] font-bold flex items-center gap-2">
                           <FileText size={12} className="text-primary" />
                           <span className="truncate max-w-[100px]">{f.name}</span>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            <div className="p-6 bg-surface border border-border rounded-2xl flex gap-4 text-muted text-xs leading-relaxed">
               <ShieldCheck size={24} className="shrink-0 text-primary" />
               <p className="font-medium">Seus arquivos serão criptografados e armazenados em servidores seguros de alta disponibilidade em Mato Grosso do Sul. Anonimato técnico garantido.</p>
            </div>

            <div className="flex items-center justify-between pt-6 gap-4">
               <button onClick={handleBack} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Voltar
               </button>
               <button 
                onClick={handleNext}
                className="btn-primary btn-md sm:btn-lg gap-3 flex-1 sm:flex-none sm:min-w-[280px] bg-dark hover:bg-black border-none"
               >
                  Ir Para Identificação & Revisão
                  <ArrowRight size={20} />
               </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-slide-up">
             <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-dark tracking-tighter italic uppercase text-primary">Privacidade e Revisão Final</h2>
                  <p className="text-muted text-sm font-medium">Configure seu anonimato e confira os dados antes de gerar o protocolo.</p>
               </div>
               <div className="p-4 bg-secondary/10 text-secondary rounded-2xl">
                  <ShieldCheck size={32} />
               </div>
            </div>

            {/* Configuração de Privacidade */}
            <div className="p-8 bg-dark text-white rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
               
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                     <Lock size={20} className="text-secondary" />
                  </div>
                  <h3 className="font-extrabold text-sm uppercase tracking-tighter">Nível de Sigilo Desejado</h3>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                   onClick={() => handleInputChange('anonima', true)}
                   className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${formData.anonima ? 'border-secondary bg-secondary/10 text-white shadow-glow-green' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                  >
                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.anonima ? 'border-secondary bg-secondary' : 'border-white/20'}`}>
                        {formData.anonima && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-widest">Manter Anônimo</span>
                  </button>

                  <button 
                   onClick={() => handleInputChange('anonima', false)}
                   className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${!formData.anonima ? 'border-secondary bg-secondary/10 text-white shadow-glow-green' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                  >
                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!formData.anonima ? 'border-secondary bg-secondary' : 'border-white/20'}`}>
                        {!formData.anonima && <div className="w-2 h-2 rounded-full bg-white"></div>}
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-widest">Identificar-me</span>
                  </button>
               </div>

               {!formData.anonima && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 animate-slide-up">
                    <div className="space-y-1">
                       <p className="text-[9px] font-bold text-white/40 uppercase pl-1">Nome Completo</p>
                       <input 
                         className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary w-full transition-all" 
                         placeholder="Seu nome completo" 
                         value={formData.nome}
                         onChange={(e) => handleInputChange('nome', e.target.value)}
                       />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-bold text-white/40 uppercase pl-1">E-mail para Contato (Opcional)</p>
                       <input 
                         className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary w-full transition-all" 
                         placeholder="seu@email.com" 
                         value={formData.email}
                         onChange={(e) => handleInputChange('email', e.target.value)}
                       />
                    </div>
                 </div>
               )}
            </div>

            <div className="space-y-4">
               {/* Resumo Card */}
               <div className="bg-surface rounded-3xl p-6 border border-border space-y-6">
                  <div className="flex items-center gap-4 border-b border-border pb-4">
                     <span className="text-4xl">{currentCategory?.emoji}</span>
                     <div>
                        <p className="text-[10px] font-black uppercase text-muted tracking-widest">Categoria Selecionada</p>
                        <h4 className="text-lg font-black text-dark leading-tight">{currentCategory?.label}</h4>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted tracking-widest">Localização</p>
                        <p className="font-bold text-dark">{formData.local}, {formData.numero}</p>
                        <p className="text-xs text-muted font-medium">{formData.bairro} — {formData.cidade} / MS (CEP {formData.cep})</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted tracking-widest">Fato</p>
                        <h5 className="font-black text-dark text-base">{formData.titulo}</h5>
                     </div>
                  </div>

                  {formData.arquivos.length > 0 && (
                     <div className="pt-4 border-t border-border flex items-center justify-between">
                         <p className="text-[10px] font-black uppercase text-muted tracking-widest">Evidências Anexadas</p>
                         <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black">{formData.arquivos.length} ARQUIVO(S)</span>
                     </div>
                  )}
               </div>

               {/* Seção de Consentimento Jurídico */}
               <div className={`p-6 rounded-2xl border transition-all ${formData.consentimento ? 'bg-white border-primary shadow-glow-cyan' : 'bg-surface border-border'}`}>
                  <label className="flex items-start gap-4 cursor-pointer group">
                     <div className="pt-1">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-primary transition-all cursor-pointer"
                          checked={formData.consentimento}
                          onChange={(e) => handleInputChange('consentimento', e.target.checked)}
                        />
                     </div>
                     <div className="space-y-2">
                        <p className="text-[11px] font-black text-dark uppercase tracking-widest flex items-center gap-2">
                           Termo de Responsabilidade e Ciência
                           <Shield size={14} className="text-primary" />
                        </p>
                        <ul className="text-[10px] text-muted leading-relaxed font-bold space-y-1">
                           <li>• Declaro estar ciente de que sou o único responsável pela veracidade dos fatos narrados.</li>
                           <li>• O uso de má-fé neste canal ou denúncia falsa são crimes (Arts. 339 e 340 do Código Penal).</li>
                           <li>• Compreendo que esta plataforma atua como facilitador e encaminha dados aos órgãos competentes.</li>
                        </ul>
                     </div>
                  </label>
               </div>
            </div>

            <div className="flex items-center justify-between pt-6 gap-4">
               <button onClick={handleBack} disabled={loading} className="flex items-center gap-2 text-[10px] uppercase font-black text-muted hover:text-dark transition-colors">
                  <ArrowLeft size={16} /> Voltar para Alterar
               </button>
               <button 
                onClick={() => {
                   if (!formData.consentimento) {
                      toast.error("Você precisa concordar com os termos de responsabilidade para protocolar.")
                      return
                   }
                   handleSubmit()
                }}
                disabled={loading || !formData.consentimento}
                className={`btn-primary btn-md sm:btn-lg gap-3 flex-1 sm:flex-none sm:min-w-[300px] bg-secondary hover:bg-secondary-600 border-none shadow-glow-green transition-all ${!formData.consentimento ? 'opacity-50 grayscale' : ''}`}
               >
                  {loading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      CONFIRMAR E PROTOCOLAR
                      <Send size={20} />
                    </>
                  )}
               </button>
            </div>
          </div>
        )}
"""

content = content[:idx_start] + new_steps + content[idx_end:]

with codecs.open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Wizard successfully updated with 5 steps!")
