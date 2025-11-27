
import React, { useState, useMemo } from 'react';
import { Asset } from '../types';
import { getAIInsight } from '../api/geminiService';
import { SparklesIcon, SendIcon } from './icons';
import * as ds from '../styles/designSystem';

type Style = React.CSSProperties;

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

  const styles: { [key: string]: Style } = useMemo(() => ({
    container: {
        ...ds.componentStyles.card,
        backgroundColor: ds.colors.dark.card,
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${ds.colors.dark.border}`,
    },
    header: { display: 'flex', alignItems: 'center', marginBottom: ds.spacing[4] },
    title: { fontSize: ds.typography.fontSizes.lg, fontWeight: ds.typography.fontWeights.semibold, color: ds.colors.dark.text_primary, marginLeft: ds.spacing[3] },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', marginBottom: ds.spacing[4] },
    input: {
        ...ds.componentStyles.input,
        backgroundColor: ds.colors.dark.background,
        color: ds.colors.dark.text_primary,
        width: '100%',
        paddingRight: ds.spacing[12],
        border: `1px solid ${ds.colors.dark.border}`,
    },
    sendButton: {
        position: 'absolute',
        right: ds.spacing[2],
        height: '36px',
        width: '36px',
        borderRadius: ds.borders.radius.md,
        background: ds.colors.primary.main,
        color: ds.colors.primary.contrastText,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s ease',
    },
    contentArea: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', color: ds.colors.dark.text_secondary },
    spinner: { width: ds.spacing[6], height: ds.spacing[6], borderTop: `2px solid ${ds.colors.primary.main}`, borderRight: `2px solid ${ds.colors.primary.main}`, borderBottom: '2px solid transparent', borderLeft: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: ds.spacing[3] },
    errorText: { color: ds.colors.error.main, textAlign: 'center' },
    responseContainer: { backgroundColor: ds.colors.dark.background, borderRadius: ds.borders.radius.md, padding: ds.spacing[4], color: ds.colors.dark.text_secondary, fontSize: ds.typography.fontSizes.sm, whiteSpace: 'pre-wrap', maxHeight: '220px', overflowY: 'auto' },
    sampleQueriesContainer: { textAlign: 'center', color: ds.colors.dark.text_secondary },
    sampleQueriesGrid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: ds.spacing[2], marginTop: ds.spacing[3] },
    sampleQueryButton: {
        background: ds.colors.dark.background,
        border: `1px solid ${ds.colors.dark.border}`,
        color: ds.colors.dark.text_secondary,
        padding: `${ds.spacing[2]} ${ds.spacing[3]}`,
        borderRadius: ds.borders.radius.full,
        cursor: 'pointer',
        fontSize: ds.typography.fontSizes.xs,
        transition: 'all 0.2s ease',
    },
  }), [ds]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <SparklesIcon style={{ width: 24, height: 24, color: ds.colors.primary.main }} />
        <h3 style={styles.title}>Assistente Inteligente SGA</h3>
      </div>

      <div style={styles.inputWrapper}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre seus ativos..."
          style={styles.input}
          disabled={isLoading}
        />
        <button
          onClick={handleQuery}
          disabled={isLoading}
          style={{ ...styles.sendButton, opacity: isLoading ? 0.5 : 1 }}
        >
          <SendIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>
      
      <div style={styles.contentArea}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <span>Analisando dados...</span>
          </div>
        ) : error ? (
          <p style={styles.errorText}>{error}</p>
        ) : response ? (
          <div style={styles.responseContainer}>
              <p>{response}</p>
          </div>
        ) : (
          <div style={styles.sampleQueriesContainer}>
              <p style={{ fontSize: ds.typography.fontSizes.sm }}>Experimente uma destas perguntas:</p>
              <div style={styles.sampleQueriesGrid}>
                  {sampleQueries.map(q => (
                      <button key={q} onClick={() => setQuery(q)} style={styles.sampleQueryButton}>
                          {q}
                      </button>
                  ))}
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
