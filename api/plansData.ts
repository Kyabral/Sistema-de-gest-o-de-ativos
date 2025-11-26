export const plans = [
    {
      name: 'Essencial',
      price: 'R$ 79',
      description: 'Ideal para PMEs e equipes que precisam de controle centralizado e relatórios essenciais.',
      features: [
        'Até 200 ativos',
        'Dashboard operacional',
        'Controle de manutenção',
        'Relatórios padrão',
        'Suporte via e-mail',
      ],
      isPopular: false,
    },
    {
      name: 'Profissional',
      price: 'R$ 199',
      description: 'Para empresas que buscam automação, insights de IA e gestão preditiva.',
      features: [
        'Ativos ilimitados',
        'Tudo do Essencial, e mais:',
        'Assistente de IA e score de saúde',
        'Alertas de manutenção preditiva',
        'Fluxos de aprovação',
        'Suporte prioritário',
      ],
      isPopular: true,
    },
    {
      name: 'Enterprise',
      price: 'Sob Consulta',
      description: 'Solução completa para grandes corporações com integração ERP e segurança avançada.',
      features: [
        'Tudo do Profissional, e mais:',
        'Integração ERP bidirecional',
        'API para integrações customizadas',
        'Controle de acesso (RBAC)',
        'Módulos de BI e auditoria',
        'Gerente de conta dedicado',
        'SLA de 99.9%',
      ],
      isPopular: false,
    },
];
