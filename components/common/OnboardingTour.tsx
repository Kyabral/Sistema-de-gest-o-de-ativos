import React, { useState } from 'react';
import { PlusIcon, SparklesIcon, ChartPieIcon, RocketLaunchIcon } from './icons';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const tourSteps = [
  {
    icon: <RocketLaunchIcon className="h-12 w-12 text-white" />,
    title: 'Bem-vindo(a) ao SGA+!',
    content: 'Este tour rápido irá guiá-lo(a) pelas principais funcionalidades do seu novo painel de gestão de ativos. Vamos começar!',
  },
  {
    icon: <PlusIcon className="h-12 w-12 text-white" />,
    title: 'Adicione seus Ativos Facilmente',
    content: 'Clique em "Adicionar Ativo" para começar a catalogar seus equipamentos. Nossa IA pode até sugerir a categoria e localização para você!',
  },
  {
    icon: <SparklesIcon className="h-12 w-12 text-white" />,
    title: 'Converse com o Assistente de IA',
    content: 'Tem alguma dúvida? Pergunte ao Assistente Inteligente em linguagem natural para obter insights instantâneos sobre seus ativos.',
  },
  {
    icon: <ChartPieIcon className="h-12 w-12 text-white" />,
    title: 'Explore e Otimize',
    content: 'Use os gráficos interativos e a tabela de ativos para analisar seu inventário, monitorar a saúde dos equipamentos e planejar manutenções. Você está pronto para começar!',
  },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { icon, title, content } = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideInUp { animation: slideInUp 0.5s ease-out forwards; }
      `}</style>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md text-center p-8 animate-slideInUp" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 mb-6">
          {icon}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{content}</p>
        
        <div className="flex items-center justify-center mb-6">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-6 mx-1 rounded-full transition-all duration-300 ${
                index === currentStep ? 'bg-primary-500 w-8' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between items-center">
          {currentStep > 0 ? (
            <button onClick={handlePrev} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              Anterior
            </button>
          ) : <div />}
          <button
            onClick={handleNext}
            className="px-6 py-3 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-md transition-transform transform hover:scale-105"
          >
            {currentStep === tourSteps.length - 1 ? 'Concluir' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
