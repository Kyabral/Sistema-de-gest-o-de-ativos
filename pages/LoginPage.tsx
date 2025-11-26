import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CircleStackIcon, CheckCircleIcon, LightBulbIcon, ShieldCheckIcon, DocumentChartBarIcon, WrenchScrewdriverIcon, BuildingOfficeIcon, DevicePhoneMobileIcon, Bars3Icon, XMarkIcon } from '../components/common/icons';
import { UserRegistrationData } from '../types';
import { plans } from '../api/plansData';


const LoginPage: React.FC = () => {
  const { signIn, signUp, error: authError, isLoading: isAuthLoading } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState('');

  // Registration states
  const [regData, setRegData] = useState<UserRegistrationData>({ name: '', email: '', password: '', companyName: '', phone: '' });
  const [regLocalError, setRegLocalError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Por favor, preencha o e-mail e a senha.');
      return;
    }
    try {
      await signIn(email, password, rememberMe);
    } catch (err) {
      console.error(err);
    }
  };

  const phoneMask = (v: string) => {
    v = v.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    return v.slice(0, 15);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setRegData(prev => ({ ...prev, phone: phoneMask(e.target.value) }));
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLocalError('');

    if (!regData.name || !regData.email || !regData.password || !regData.companyName || !regData.phone) {
      setRegLocalError("Por favor, preencha todos os campos.");
      return;
    }
    if (regData.password.length < 6) {
      setRegLocalError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const unmaskedPhone = regData.phone.replace(/\D/g, '');
    if (unmaskedPhone.length < 10 || unmaskedPhone.length > 11) {
        setRegLocalError("Formato de telefone inválido. Insira um número com DDD (10 ou 11 dígitos).");
        return;
    }

    try {
      await signUp({ ...regData, phone: unmaskedPhone });
      sessionStorage.setItem('showOnboardingTour', 'true');
    } catch (err) {
        console.error(err);
    }
  };

  const features = [
    { name: 'Inventário Inteligente com IoT', description: 'Leitura de ativos via QR Code, RFID e NFC, com inventário rápido em modo online e offline e mapa de localização.', icon: <WrenchScrewdriverIcon className="w-8 h-8 text-white" /> },
    { name: 'Ordens de Serviço com IA', description: 'Geração e classificação automática de ordens de serviço por eventos de IoT, com painel de status, custo e SLA.', icon: <LightBulbIcon className="w-8 h-8 text-white" /> },
    { name: 'Inteligência Analítica Preditiva', description: 'Painéis interativos com gráficos e insights preditivos, utilizando IA para estimar falhas e custos futuros.', icon: <DocumentChartBarIcon className="w-8 h-8 text-white" /> },
    { name: 'Segurança e Compliance Total', description: 'Controle de acesso granular (RBAC), criptografia AES-256 e conformidade com LGPD, ISO 55000 e SOX.', icon: <ShieldCheckIcon className="w-8 h-8 text-white" /> },
    { name: 'App Mobile Avançado', description: 'Login biométrico, geolocalização de ativos, inventário offline, push notifications e resumo de KPIs na tela inicial.', icon: <DevicePhoneMobileIcon className="w-8 h-8 text-white" /> },
    { name: 'Integrações Inteligentes', description: 'Conecte-se facilmente com SAP, Totvs, Oracle, Google Drive, Dropbox e APIs IoT (MQTT/REST).', icon: <BuildingOfficeIcon className="w-8 h-8 text-white" /> },
  ];

  const faqs = [
    { question: 'Posso integrar o SGA+ com meu sistema de ERP atual?', answer: 'Sim! O plano Enterprise oferece integrações nativas com os principais ERPs do mercado, como SAP, Totvs e Oracle, além de uma API dedicada para customizações.' },
    { question: 'Como funciona o teste gratuito?', answer: 'Você terá acesso a todos os recursos do plano Profissional, sem a necessidade de cadastrar um cartão de crédito. Ao final do período, você pode escolher o plano que melhor se adapta à sua empresa.'},
    { question: 'A plataforma é segura para os dados da minha empresa?', answer: 'Absolutamente. Usamos criptografia de ponta (AES-256), autenticação multifator e seguimos as melhores práticas de segurança para garantir a proteção e a conformidade dos seus dados (LGPD, ISO 27001).'},
    { question: 'O sistema pode ser customizado com a marca da minha empresa?', answer: 'Sim, a plataforma oferece amplas opções de customização e branding, incluindo o uso de domínio próprio, personalização de cores e logotipo, e a criação de layouts e dashboards exclusivos para sua empresa.'}
  ];
  
  const handlePlanSelection = (planName: string) => {
    setView('register');
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const currentError = view === 'login' ? localError || authError : regLocalError || authError;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <style>{`
        :root { --header-height: 4rem; }
        html { scroll-padding-top: var(--header-height); }
        @keyframes pulse-custom { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--color-primary-500), 0.7); } 50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(var(--color-primary-500), 0); } }
        .animate-pulse-custom { animation: pulse-custom 2s infinite; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
      `}</style>
      
      <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-gray-900/10 dark:border-gray-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')} className="flex items-center"><CircleStackIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" /><span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">SGA+</span></a>
                <div className="flex items-center">
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="nav-link">Funcionalidades</a>
                        <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="nav-link">Planos</a>
                        <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="nav-link">FAQ</a>
                    </nav>
                    <div className="hidden md:flex items-center ml-8">
                        <button onClick={(e) => { e.preventDefault(); setView('login'); handleNavClick(e as any, 'hero')}} className="btn-secondary">Entrar</button>
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-300">
                            {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
                    <nav className="flex flex-col space-y-4">
                        <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="nav-link">Funcionalidades</a>
                        <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="nav-link">Planos</a>
                        <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="nav-link">FAQ</a>
                        <button onClick={(e) => { e.preventDefault(); setView('login'); handleNavClick(e as any, 'hero')}} className="btn-secondary mt-2">Entrar</button>
                    </nav>
                </div>
            )}
        </div>
      </header>
      
      <main>
        <section id="hero" className="flex items-center justify-center p-4 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
              {view === 'login' ? (
                <>
                  <div className="mb-8 text-center lg:text-left"><h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white animate-fadeInUp">Acesso à sua Plataforma de Gestão de Ativos</h1><p className="mt-4 text-lg text-gray-600 dark:text-gray-400 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>Bem-vindo de volta. Faça login para acessar seu dashboard.</p></div>
                  <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-style" placeholder="seu@email.com" /></div>
                    <div><label htmlFor="password">Senha</label><input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-style" placeholder="••••••••" /></div>
                    <div className="flex items-center"><input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" /><label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Lembrar de mim</label></div>
                    {currentError && <p className="text-sm text-red-500">{currentError}</p>}
                    <button type="submit" disabled={isAuthLoading} className="w-full btn-primary !mt-6">{isAuthLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Entrar'}</button>
                  </form>
                   <p className="mt-6 text-center text-sm"><button onClick={() => { setView('register'); setLocalError(''); }} className="font-medium text-primary-600 hover:underline dark:text-primary-400">Não tem uma conta? Crie uma agora e comece seu teste gratuito.</button></p>
                </>
              ) : (
                 <>
                    <div className="mb-8 text-center lg:text-left"><h1 className="text-3xl lg:text-4xl font-bold">Crie sua conta e inicie seu teste</h1><p className="mt-4 text-lg">Acesso instantâneo aos recursos do plano Profissional. Não é necessário cartão de crédito.</p></div>
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div><label htmlFor="name">Nome Completo</label><input type="text" name="name" id="name" value={regData.name} onChange={(e) => setRegData({...regData, name: e.target.value})} required className="input-style" placeholder="Seu Nome" /></div>
                        <div><label htmlFor="companyName">Nome da Empresa</label><input type="text" name="companyName" id="companyName" value={regData.companyName} onChange={(e) => setRegData({...regData, companyName: e.target.value})} required className="input-style" placeholder="Nome da sua Empresa" /></div>
                        <div><label htmlFor="email-register">Email Corporativo</label><input type="email" name="email" id="email-register" value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} required className="input-style" placeholder="seu@email.com" /></div>
                        <div><label htmlFor="phone">Telefone</label><input type="tel" name="phone" id="phone" value={regData.phone || ''} onChange={handlePhoneChange} required className="input-style" placeholder="(XX) XXXXX-XXXX" maxLength={15} /></div>
                        <div><label htmlFor="password-register">Senha</label><input type="password" name="password" id="password-register" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} required className="input-style" placeholder="•••••••• (mínimo 6 caracteres)" /></div>
                        {currentError && <p className="text-sm text-red-500">{currentError}</p>}
                        <button type="submit" disabled={isAuthLoading} className="w-full btn-primary !mt-6 animate-pulse-custom">{isAuthLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Criar Conta e Iniciar Teste Gratuito'}</button>
                    </form>
                    <p className="mt-6 text-center text-sm"><button onClick={() => { setView('login'); setRegLocalError(''); }} className="font-medium text-primary-600 hover:underline dark:text-primary-400">Já tem uma conta? Faça o login aqui</button></p>
                 </>
              )}
            </div>
            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white relative"><div className="flex flex-col justify-center h-full text-center"><h2 className="text-3xl font-bold mb-4">O Futuro da Gestão de Ativos é Inteligente e Integrado</h2><p className="text-primary-200">Controle, preveja e otimize o ciclo de vida dos seus ativos com uma plataforma que une IoT, IA e integrações robustas.</p></div></div>
          </div>
        </section>
        <section id="features" className="py-16 sm:py-20 bg-gray-100 dark:bg-gray-900/50">
           <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Uma plataforma, controle total.</h2><p className="mt-4 text-lg">Vá além do rastreamento. Otimize, preveja e economize com nossas ferramentas inteligentes.</p></div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{features.map((f) => (<div key={f.name} className="flex items-start space-x-4"><div className="flex-shrink-0 bg-primary-600 p-3 rounded-lg">{f.icon}</div><div><h3 className="text-lg font-semibold">{f.name}</h3><p className="mt-1 text-base">{f.description}</p></div></div>))}</div>
           </div>
        </section>
        <section id="pricing" className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Escolha o plano ideal para sua empresa</h2><p className="mt-4 text-lg">Comece com um teste gratuito. Sem necessidade de cartão de crédito.</p></div>
            <div className="grid max-w-md grid-cols-1 gap-8 mx-auto lg:max-w-none lg:grid-cols-3">
              {plans.map((p) => (<div key={p.name} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col relative ${p.isPopular ? 'border-2 border-primary-500' : 'border border-gray-200 dark:border-gray-700'}`}>{p.isPopular && <div className="absolute top-0 -translate-y-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">Mais Popular</div>}<h3 className="text-2xl font-semibold">{p.name}</h3><p className="mt-4">{p.description}</p><div className="mt-6"><span className="text-4xl font-bold">{p.price}</span>{p.price.startsWith('R$') && <span className="text-base font-medium">/mês</span>}</div><ul role="list" className="mt-8 space-y-3 text-sm flex-grow">{p.features.map((f) => (<li key={f} className="flex gap-x-3"><CheckCircleIcon className="h-6 w-5 flex-none text-primary-600" />{f}</li>))}</ul><button onClick={() => handlePlanSelection(p.name)} className={`mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold shadow-sm w-full ${p.isPopular ? 'bg-primary-600 text-white hover:bg-primary-500' : 'text-primary-600 ring-1 ring-inset ring-primary-200 hover:ring-primary-300 dark:text-primary-400 dark:ring-primary-700 dark:hover:ring-primary-600'}`}>{p.price === 'Sob Consulta' ? 'Fale com Vendas' : 'Iniciar teste gratuito'}</button></div>))}
            </div>
          </div>
        </section>
        <section id="faq" className="py-16 sm:py-20 bg-white dark:bg-gray-800">
             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Perguntas Frequentes</h2></div>
                <div className="space-y-6">{faqs.map((f, i) => (<details key={i} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg group"><summary className="flex items-center justify-between cursor-pointer"><h5 className="text-lg font-medium">{f.question}</h5><span className="relative flex-shrink-0 ml-1.5 w-5 h-5"><svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-5 h-5 opacity-100 group-open:opacity-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 9v3m0 0v3m0-3h3m-3 0H9" /></svg><svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-5 h-5 opacity-0 group-open:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 12H9" /></svg></span></summary><p className="mt-4 leading-relaxed">{f.answer}</p></details>))}</div>
             </div>
        </section>
      </main>
      <footer className="bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700"><div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400"><p>&copy; {new Date().getFullYear()} SGA+. Todos os direitos reservados.</p></div></footer>
       <style>{`label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; } .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.75rem; transition: all 0.2s; } .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; } .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: rgb(var(--color-primary-500)); box-shadow: 0 0 0 2px rgba(var(--color-primary-500), 0.5); } .btn-primary { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1rem; font-weight: 500; border-radius: 0.5rem; transition: background-color 0.2s; background-color: rgb(var(--color-primary-600)); color: white; } .btn-primary:hover:not(:disabled) { background-color: rgb(var(--color-primary-700)); } .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; } .btn-secondary { display: inline-flex; align-items: center; justify-content: center; padding: 0.625rem 1rem; font-weight: 500; border-radius: 0.5rem; transition: background-color 0.2s; background-color: rgb(var(--color-primary-600)); color: white; } .btn-secondary:hover { background-color: rgb(var(--color-primary-700)); } .nav-link { font-weight: 500; color: #4B5563; } .dark .nav-link { color: #D1D5DB; } .nav-link:hover { color: rgb(var(--color-primary-600)); } .dark .nav-link:hover { color: rgb(var(--color-primary-400)); }`}</style>
    </div>
  );
};

export default LoginPage;
