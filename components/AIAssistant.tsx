

import React, { useState } from 'react';
import { Asset } from '../types';
// FIX: The geminiService file was moved to the 'api' directory. Updating the import path.
import { getAIInsight } from '../api/geminiService';
import { SparklesIcon, SendIcon } from './icons';

interface AIAssistantProps {
  assets: Asset[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ assets }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await getAIInsight(query, assets);
      setResponse(result);
    } catch (err) {
      setError('Falha ao obter resposta da IA. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleQuery();
    }
  };

  const sampleQueries = [
    "Quais ativos estão em manutenção?",
    "Resuma o status dos equipamentos de TI.",
    "Qual o ativo com maior valor de compra?",
    "Liste os ativos ociosos."
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <SparklesIcon className="w-6 h-6 text-primary-500 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assistente Inteligente SGA</h3>
      </div>

      <div className="relative flex items-center mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre seus ativos..."
          className="w-full p-3 pr-12 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          disabled={isLoading}
        />
        <button
          onClick={handleQuery}
          disabled={isLoading}
          className="absolute right-2.5 bottom-2.5 bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-3 py-2 text-white dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:opacity-50"
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-300">Analisando dados...</p>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : response ? (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{response}</p>
        </div>
      ) : (
        <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
            <p className="mb-2">Experimente uma destas perguntas:</p>
            <div className="flex flex-wrap justify-center gap-2">
                {sampleQueries.map(q => (
                    <button key={q} onClick={() => setQuery(q)} className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900">
                        {q}
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
