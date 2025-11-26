import React, { useState } from 'react';
import { CircleStackIcon, CheckCircleIcon, LightBulbIcon, ShieldCheckIcon, DocumentChartBarIcon, WrenchScrewdriverIcon, BuildingOfficeIcon, DevicePhoneMobileIcon } from './icons';
import { UserRegistrationData } from '../types';
import { plans } from '../services/plansData';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration states
  // FIX: Add 'companyName' to initial state to satisfy UserRegistrationData type.
  const [regData, setRegData] = useState<UserRegistrationData>({ name: '', email: '', password: '', companyName: '' });
  const [regError, setRegError] = useState('');
  const [isRegLoading, setIsRegLoading] = useState(false);


  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      console.log('Login simulado com sucesso para:', email);
      setIsLoading(false);
      onLogin();
    }, 1000);
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regData.name || !regData.email || !regData.password || !regData.companyName) {
      setRegError("Por favor, preencha todos os campos.");
      return;
    }
    if (regData.password.length < 6) {
      setRegError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsRegLoading(true);
    // Simulate API call to register user
    console.log('Registrando novo usuário:', regData.email);
    setTimeout(() => {
      alert('Conta criada com sucesso! Bem-vindo ao modo de demonstração.');
      setIsRegLoading(false);
      onLogin(); // Log in to enter demo mode
    }, 1500);
  };


  const features = [
    {
      name: 'Inventário Inteligente com IoT',
      description: 'Leitura de ativos via QR Code, RFID e NFC, com inventário rápido em modo online e offline e mapa de localização.',
      icon: <WrenchScrewdriverIcon className="w-8 h-8 text-white" />,
    },
    {
      name: 'Ordens de Serviço com IA',
      description: 'Geração e classificação automática de ordens de serviço por eventos de IoT, com painel de status, custo e SLA.',
      icon: <LightBulbIcon className="w-8 h-8 text-white" />,
    },
    {
      name: 'Inteligência Analítica Preditiva',
      description: 'Painéis interativos com gráficos e insights preditivos, utilizando IA para estimar falhas e custos futuros.',
      icon: <DocumentChartBarIcon className="w-8 h-8 text-white" />,
    },
    {
      name: 'Segurança e Compliance Total',
      description: 'Controle de acesso granular (RBAC), criptografia AES-256 e conformidade com LGPD, ISO 55000 e SOX.',
      icon: <ShieldCheckIcon className="w-8 h-8 text-white" />,
    },
    {
      name: 'App Mobile Avançado',
      description: 'Login biométrico, geolocalização de ativos, inventário offline, push notifications e resumo de KPIs na tela inicial.',
      icon: <DevicePhoneMobileIcon className="w-8 h-8 text-white" />,
    },
    {
      name: 'Integrações Inteligentes',
      description: 'Conecte-se facilmente com SAP, Totvs, Oracle, Google Drive, Dropbox e APIs IoT (MQTT/REST).',
      icon: <BuildingOfficeIcon className="w-8 h-8 text-white" />,
    },
  ];

  const faqs = [
    {
      question: 'Posso integrar o SGA+ com meu sistema de ERP atual?',
      answer: 'Sim! O plano Enterprise oferece integrações nativas com os principais ERPs do mercado, como SAP, Totvs e Oracle, além de uma API dedicada para customizações.'
    },
    {
      question: 'Como funciona o teste gratuito?',
      answer: 'Você terá acesso a todos os recursos do plano Profissional, sem a necessidade de cadastrar um cartão de crédito. Ao final do período, você pode escolher o plano que melhor se adapta à sua empresa.'
    },
     {
      question: 'A plataforma é segura para os dados da minha empresa?',
      answer: 'Absolutamente. Usamos criptografia de ponta (AES-256), autenticação multifator e seguimos as melhores práticas de segurança para garantir a proteção e a conformidade dos seus dados (LGPD, ISO 27001).'
    },
    {
      question: 'O sistema pode ser customizado com a marca da minha empresa?',
      answer: 'Sim, a plataforma oferece amplas opções de customização e branding, incluindo o uso de domínio próprio, personalização de cores e logotipo, e a criação de layouts e dashboards exclusivos para sua empresa.'
    }
  ];
  
  const handlePlanSelection = (planName: string) => {
    switch (planName) {
        case 'Essencial':
        case 'Profissional':
            setView('register');
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
            break;
        case 'Enterprise':
            window.location.href = 'mailto:vendas@sga-plus.com?subject=Interesse no Plano Enterprise da SGA+&body=Olá, gostaria de saber mais sobre o plano Enterprise e solicitar uma demonstração.';
            break;
        default:
            alert('Plano não reconhecido.');
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <style>{`
        @keyframes pulse-custom {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
        }
        .animate-pulse-custom { animation: pulse-custom 2s infinite; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
        @keyframes grow-bar {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .animate-grow-bar { animation: grow-bar 0.8s ease-out forwards; transform-origin: bottom; }
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-gray-900/10 dark:border-gray-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')} className="flex items-center">
                    <CircleStackIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">SGA+</span>
                </a>
                <nav className="hidden md:flex items-center space-x-8">
                    <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="nav-link">Funcionalidades</a>
                    <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="nav-link">Planos</a>
                    <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="nav-link">FAQ</a>
                </nav>
                <a href="#hero" onClick={(e) => { e.preventDefault(); setView('login'); handleNavClick(e, 'hero')}} className="btn-secondary hidden md:inline-flex">Entrar</a>
            </div>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section id="hero" className="flex items-center justify-center p-4 py-16 lg:py-24">
          <div className="flex w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
              
              {view === 'login' ? (
                <>
                  <div className="mb-8 text-center lg:text-left">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white animate-fadeInUp">
                      Acesso à sua Plataforma de Gestão de Ativos
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                      Bem-vindo de volta. Faça login para acessar seu dashboard.
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                      <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-style" placeholder="seu@email.com" />
                    </div>
                    <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Senha</label>
                      <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-style" placeholder="••••••••" />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full btn-primary !mt-6">
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Entrar'}
                    </button>
                  </form>
                   <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Não tem uma conta?{' '}
                        <button onClick={() => { setView('register'); setError(''); }} className="font-medium text-primary-600 hover:underline dark:text-primary-400">
                           Crie uma agora e comece seu teste gratuito.
                        </button>
                    </p>
                </>
              ) : (
                 <>
                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                            Crie sua conta e inicie seu teste
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                            Acesso instantâneo aos recursos do plano Profissional. Não é necessário cartão de crédito.
                        </p>
                    </div>
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome Completo</label>
                            <input type="text" name="name" id="name" value={regData.name} onChange={(e) => setRegData({...regData, name: e.target.value})} required className="input-style" placeholder="Seu Nome" />
                        </div>
                        <div>
                            <label htmlFor="companyName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome da Empresa</label>
                            <input type="text" name="companyName" id="companyName" value={regData.companyName} onChange={(e) => setRegData({...regData, companyName: e.target.value})} required className="input-style" placeholder="Nome da sua empresa" />
                        </div>
                        <div>
                            <label htmlFor="email-register" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email Corporativo</label>
                            <input type="email" name="email" id="email-register" value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} required className="input-style" placeholder="seu@email.com" />
                        </div>
                        <div>
                            <label htmlFor="password-register" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Senha</label>
                            <input type="password" name="password" id="password-register" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} required className="input-style" placeholder="•••••••• (mínimo 6 caracteres)" />
                        </div>
                        {regError && <p className="text-sm text-red-500">{regError}</p>}
                        <button type="submit" disabled={isRegLoading} className="w-full btn-primary !mt-6 animate-pulse-custom">
                            {isRegLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Criar Conta e Iniciar Teste Gratuito'}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Já tem uma conta?{' '}
                        <button onClick={() => { setView('login'); setRegError(''); }} className="font-medium text-primary-600 hover:underline dark:text-primary-400">
                            Faça o login aqui
                        </button>
                    </p>
                 </>
              )}
            </div>

            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white relative">
                <div className="flex flex-col justify-center h-full text-center">
                    <h2 className="text-3xl font-bold mb-4">O Futuro da Gestão de Ativos é Inteligente e Integrado</h2>
                    <p className="text-primary-200">Controle, preveja e otimize o ciclo de vida dos seus ativos com uma plataforma que une IoT, IA e integrações robustas.</p>
                </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-20 bg-gray-100 dark:bg-gray-900/50">
           <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-12">
                   <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                       Uma plataforma, controle total.
                   </h2>
                   <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                       Vá além do rastreamento. Otimize, preveja e economize com nossas ferramentas inteligentes.
                   </p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {features.map((feature) => (
                       <div key={feature.name} className="flex items-start space-x-4">
                           <div className="flex-shrink-0 bg-primary-600 p-3 rounded-lg">
                               {feature.icon}
                           </div>
                           <div>
                               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.name}</h3>
                               <p className="mt-1 text-gray-600 dark:text-gray-400">{feature.description}</p>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
        </section>

        {/* How it works / Visual section */}
        <section className="py-16 sm:py-20 bg-white dark:bg-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Intuitivo, poderoso e visual.
                 </h2>
                 <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                    Navegue por dashboards claros e tome decisões baseadas em dados precisos. Veja como o SGA+ funciona.
                 </p>
                 <div className="mt-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl shadow-lg flex items-center justify-center p-4 sm:p-8 aspect-[16/9] overflow-hidden">
                    {/* Mockup UI */}
                    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex ring-1 ring-gray-900/5">
                        {/* Mock Sidebar */}
                        <div className="w-1/5 bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-4 space-y-3">
                            <div className="h-4 bg-primary-200 dark:bg-primary-700/50 rounded-md animate-fadeInUp" style={{ animationDelay: '0.4s' }}></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-3/4 animate-fadeInUp" style={{ animationDelay: '0.5s' }}></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-fadeInUp" style={{ animationDelay: '0.6s' }}></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-fadeInUp" style={{ animationDelay: '0.7s' }}></div>
                        </div>
                        {/* Mock Content */}
                        <div className="w-4/5 p-2 sm:p-4">
                            {/* Mock Header */}
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 animate-fadeInUp" style={{ animationDelay: '0.5s' }}></div>
                            {/* Mock Metric Cards */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
                                <div className="h-12 sm:h-20 bg-gray-100 dark:bg-gray-700/50 rounded-md animate-fadeInUp" style={{ animationDelay: '0.7s' }}></div>
                                <div className="h-12 sm:h-20 bg-gray-100 dark:bg-gray-700/50 rounded-md animate-fadeInUp" style={{ animationDelay: '0.8s' }}></div>
                                <div className="h-12 sm:h-20 bg-gray-100 dark:bg-gray-700/50 rounded-md animate-fadeInUp" style={{ animationDelay: '0.9s' }}></div>
                            </div>
                            {/* Mock Chart */}
                            <div className="mt-4 h-2/3 bg-gray-100 dark:bg-gray-700/50 rounded-md p-2 sm:p-4 flex items-end justify-around animate-fadeInUp" style={{ animationDelay: '1s' }}>
                                <div className="w-1/6 h-[60%] bg-primary-300 dark:bg-primary-600 rounded-t-sm animate-grow-bar" style={{ animationDelay: '1.2s' }}></div>
                                <div className="w-1/6 h-[80%] bg-primary-300 dark:bg-primary-600 rounded-t-sm animate-grow-bar" style={{ animationDelay: '1.3s' }}></div>
                                <div className="w-1/6 h-[50%] bg-primary-300 dark:bg-primary-600 rounded-t-sm animate-grow-bar" style={{ animationDelay: '1.4s' }}></div>
                                <div className="w-1/6 h-[70%] bg-primary-300 dark:bg-primary-600 rounded-t-sm animate-grow-bar" style={{ animationDelay: '1.5s' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Escolha o plano ideal para sua empresa
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Comece com um teste gratuito. Sem necessidade de cartão de crédito.
              </p>
            </div>
            <div className="grid max-w-md grid-cols-1 gap-8 mx-auto lg:max-w-none lg:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.name} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col relative ${plan.isPopular ? 'border-2 border-primary-500' : 'border border-gray-200 dark:border-gray-700'}`}>
                  {plan.isPopular && (
                    <div className="absolute top-0 -translate-y-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                      Mais Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-semibold leading-8 text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{plan.price}</span>
                    {plan.price.startsWith('R$') && <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mês</span>}
                  </div>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-300 flex-grow">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckCircleIcon className="h-6 w-5 flex-none text-primary-600" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => handlePlanSelection(plan.name)}
                    className={`mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 w-full ${ plan.isPopular ? 'bg-primary-600 text-white hover:bg-primary-500 focus-visible:outline-primary-600' : 'text-primary-600 ring-1 ring-inset ring-primary-200 hover:ring-primary-300 dark:text-primary-400 dark:ring-primary-700 dark:hover:ring-primary-600'}`}>
                    {plan.price === 'Sob Consulta' ? 'Fale com Vendas' : 'Iniciar teste gratuito'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 sm:py-20 bg-white dark:bg-gray-800">
             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                   <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                       Perguntas Frequentes
                   </h2>
                </div>
                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                         <details key={index} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg group">
                            <summary className="flex items-center justify-between cursor-pointer">
                                <h5 className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</h5>
                                <span className="relative flex-shrink-0 ml-1.5 w-5 h-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-5 h-5 opacity-100 group-open:opacity-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9" /></svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-5 h-5 opacity-0 group-open:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9" /></svg>
                                </span>
                            </summary>
                            <p className="mt-4 leading-relaxed text-gray-700 dark:text-gray-300">{faq.answer}</p>
                        </details>
                    ))}
                </div>
             </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} SGA+. Todos os direitos reservados.</p>
        </div>
      </footer>

       <style>{`
          .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.75rem; transition: all 0.2s; }
          .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
          .input-style:focus { ring: 2; ring-offset-2; border-color: #3b82f6; }
          .btn-primary { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1rem; font-weight: 500; border-radius: 0.5rem; transition: background-color 0.2s; background-color: #3b82f6; color: white; }
          .btn-primary:hover { background-color: #2563eb; }
          .btn-secondary { display: inline-flex; align-items: center; justify-content: center; padding: 0.625rem 1rem; font-weight: 500; border-radius: 0.5rem; transition: background-color 0.2s; background-color: #4f46e5; color: white; }
          .btn-secondary:hover { background-color: #4338ca; }
          .nav-link { font-medium: text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors; }
        `}</style>
    </div>
  );
};

export default Login;
