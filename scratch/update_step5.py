import codecs

file_path = "components/public/denuncia-form-wizard.tsx"
with codecs.open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if "import { solicitarCodigoOTP }" not in content:
    content = content.replace(
        "import { registrarDenuncia }",
        "import { registrarDenuncia }\nimport { solicitarCodigoOTP } from '@/lib/actions/auth'"
    )

# 2. Add OTP fields to interface
if "otpToken:" not in content:
    content = content.replace(
        "consentimento: boolean\n}",
        "consentimento: boolean\n  otpToken: string\n}"
    )

# 3. Add states
if "const [otpEnviado" not in content:
    content = content.replace(
        "const [chaveGerada, setChaveGerada] = useState<string | null>(null)",
        "const [chaveGerada, setChaveGerada] = useState<string | null>(null)\n  const [otpEnviado, setOtpEnviado] = useState(false)\n  const [loadingOtp, setLoadingOtp] = useState(false)"
    )

# 4. Modify handleSubmit payload to include otpToken
# In initial state setup
if "otpToken: ''" not in content:
    content = content.replace(
        "consentimento: false\n  })",
        "consentimento: false,\n    otpToken: ''\n  })"
    )

allow_anonymous_str = "const allowAnonymous = process.env.NEXT_PUBLIC_ALLOW_ANONYMOUS !== 'false';"

if "const allowAnonymous" not in content:
    content = content.replace(
        "const [step, setStep] = useState(1)",
        f"{allow_anonymous_str}\n  const [step, setStep] = useState(1)"
    )

# Step 5 block replacement
step5_old_start = "{step === 5 && ("
step5_old_end = "      <div className=\"mt-8 flex items-center justify-center gap-4 text-[10px] text-muted font-black uppercase tracking-[0.2em]\">"

start_idx = content.find(step5_old_start, content.find("{step === 4 && ("))
end_idx = content.find(step5_old_end)

if start_idx != -1 and end_idx != -1:
    step5_old = content[start_idx:end_idx]
    
    step5_new = """{step === 5 && (
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
                  {allowAnonymous && (
                    <button 
                     onClick={() => { handleInputChange('anonima', true); setOtpEnviado(false); }}
                     className={`p-4 rounded-xl border-2 flex flex-col items-start gap-1 transition-all ${formData.anonima ? 'border-secondary bg-secondary/10 text-white shadow-glow-green' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                    >
                       <div className="flex items-center gap-3 w-full">
                         <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.anonima ? 'border-secondary bg-secondary' : 'border-white/20'}`}>
                            {formData.anonima && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest leading-tight text-left">Manter Anônimo</span>
                       </div>
                    </button>
                  )}

                  <button 
                   onClick={() => handleInputChange('anonima', false)}
                   className={`p-4 rounded-xl border-2 flex flex-col gap-1 transition-all ${!formData.anonima ? 'border-secondary bg-secondary/10 text-white shadow-glow-green' : 'border-white/10 text-white/40 hover:border-white/20'} ${!allowAnonymous ? 'col-span-2' : ''}`}
                  >
                     <div className="flex items-center gap-3 w-full">
                       <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!formData.anonima ? 'border-secondary bg-secondary' : 'border-white/20'}`}>
                          {!formData.anonima && <div className="w-2 h-2 rounded-full bg-white"></div>}
                       </div>
                       <span className="text-[11px] font-black uppercase tracking-widest leading-tight text-left">Identificar-me</span>
                     </div>
                  </button>
               </div>

               {/* Nudges Psicológicos */}
               {formData.anonima && allowAnonymous && (
                 <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl animate-fade-in flex gap-3">
                   <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                   <p className="text-[11px] text-amber-200/90 leading-tight">
                     <strong>Atenção:</strong> Ao optar pelo anonimato, você não receberá e-mails automáticos com as resoluções do caso, e a Equipe da plataforma DenunciaMS não terá como solicitar mais provas ou detalhes. Isso pode causar o arquivamento da investigação por falta de dados básicos.
                   </p>
                 </div>
               )}

               {!allowAnonymous && formData.anonima === false && (
                 <div className="bg-blue-950/40 border border-blue-500/30 p-4 rounded-2xl animate-fade-in flex gap-3">
                   <ShieldCheck className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                   <p className="text-[11px] text-blue-200/90 leading-tight">
                     Por exigência das diretrizes de responsabilização vigentes para este canal, a identificação mínima autenticada foi tornada obrigatória, garantindo-se o total sigilo da sua identidade (LAI).
                   </p>
                 </div>
               )}

               {!formData.anonima && (
                 <div className="space-y-4 pt-2 animate-slide-up">
                    <p className="text-[10px] text-white/60 leading-tight border-l-2 border-secondary/50 pl-3">
                      A Equipe da plataforma DenunciaMS aplica técnicas de pseudonimização. Seus dados são legalmente protegidos (Art. 31, §1º, I da LAI) e ocultados no relato principal. A identificação mínima blinda o canal contra fraudes e acelera o tratamento sério da sua denúncia.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-white/40 uppercase pl-1">Nome Completo</p>
                          <input 
                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary w-full transition-all" 
                            placeholder="Seu nome completo" 
                            disabled={otpEnviado}
                            value={formData.nome || ''}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                          />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-white/40 uppercase pl-1">E-mail (Para Receber o Código)</p>
                          <input 
                            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary w-full transition-all" 
                            placeholder="seu@email.com" 
                            disabled={otpEnviado}
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                       </div>
                    </div>

                    {/* Bloco de OTP */}
                    <div className="pt-2">
                      {!otpEnviado ? (
                        <button 
                          onClick={async () => {
                            if (!formData.email || !formData.email.includes('@')) {
                               toast.error('Informe um e-mail válido.'); return;
                            }
                            if (!formData.nome || formData.nome.length < 3) {
                               toast.error('Informe seu nome.'); return;
                            }
                            setLoadingOtp(true);
                            const res = await solicitarCodigoOTP(formData.email, formData.nome);
                            setLoadingOtp(false);
                            if (res.success) {
                               setOtpEnviado(true);
                               toast.success('Código enviado! Verifique sua caixa de entrada.');
                            } else {
                               toast.error(res.error || 'Erro ao enviar código.');
                            }
                          }}
                          disabled={loadingOtp || !formData.email || !formData.nome}
                          className="w-full bg-secondary/20 hover:bg-secondary/30 text-secondary font-black uppercase text-[11px] tracking-widest p-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                           {loadingOtp ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                           Solicitar Código de Segurança
                        </button>
                      ) : (
                        <div className="bg-white/10 border border-secondary/30 p-4 rounded-xl space-y-3 animate-fade-in">
                           <p className="text-[11px] font-black uppercase tracking-widest text-secondary text-center">Código Enviado</p>
                           <p className="text-[10px] text-white/70 text-center leading-tight">Enviamos um PIN de 6 dígitos para {formData.email}. Insira-o abaixo para validar sua identidade.</p>
                           <input 
                              className="bg-black/20 border border-white/20 rounded-xl p-4 text-center text-2xl font-black tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-secondary w-full max-w-[200px] mx-auto block uppercase" 
                              placeholder="000000" 
                              maxLength={6}
                              value={formData.otpToken || ''}
                              onChange={(e) => handleInputChange('otpToken', e.target.value.replace(/\D/g, ''))}
                           />
                           <button onClick={() => setOtpEnviado(false)} className="text-[9px] text-white/40 uppercase hover:text-white mx-auto block pt-2 underline">Mudar E-mail / Reenviar</button>
                        </div>
                      )}
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
                           <li>• Compreendo que a Equipe da plataforma DenunciaMS atua como facilitador e encaminha dados aos órgãos competentes.</li>
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
                   if (!allowAnonymous) formData.anonima = false;
                   if (!formData.anonima && (!formData.otpToken || formData.otpToken.length !== 6)) {
                      toast.error("Efetue a validação do código de segurança recebido no e-mail.")
                      return
                   }
                   handleSubmit()
                }}
                disabled={loading || !formData.consentimento || (!formData.anonima && (!formData.otpToken || formData.otpToken.length !== 6))}
                className={`btn-primary btn-md sm:btn-lg gap-3 flex-1 sm:flex-none sm:min-w-[300px] bg-secondary hover:bg-secondary-600 border-none shadow-glow-green transition-all ${!formData.consentimento || (!formData.anonima && (!formData.otpToken || formData.otpToken.length !== 6)) ? 'opacity-50 grayscale' : ''}`}
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
    
    content = content.replace(step5_old, step5_new)
    
    with codecs.open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Step 5 replaced successfully!")
else:
    print("Could not find step 5 block.")
