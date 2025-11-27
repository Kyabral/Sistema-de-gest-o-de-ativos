
import React, { useMemo } from 'react';
import { FailurePrediction } from '../../types';
import { formatDate } from '../../utils/formatters';
import { LightBulbIcon } from '../common/icons';
import { useApp } from '../../hooks/useApp';
import * as ds from '../../styles/designSystem';

type Style = React.CSSProperties;

interface PredictionListProps {
  predictions: FailurePrediction[];
}

const PredictionList: React.FC<PredictionListProps> = ({ predictions }) => {
  const { isLoading } = useApp();

  const getProbabilityStyle = (prob: number): Style => {
    let backgroundColor, color;
    if (prob > 0.75) {
      backgroundColor = ds.colors.error.light;
      color = ds.colors.error.main;
    } else if (prob > 0.5) {
      backgroundColor = ds.colors.warning.light;
      color = ds.colors.warning.main;
    } else {
      backgroundColor = ds.colors.success.light;
      color = ds.colors.success.main;
    }
    return {
      backgroundColor,
      color,
      padding: `${ds.spacing[1]} ${ds.spacing[2]}`,
      borderRadius: ds.borders.radius.full,
      fontSize: ds.typography.fontSizes.xs,
      fontWeight: ds.typography.fontWeights.semibold,
    };
  };

  const styles: { [key: string]: Style } = useMemo(() => ({
    container: {
      ...ds.componentStyles.card,
      backgroundColor: ds.colors.dark.card,
      height: '400px', // Altura fixa como no design original
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${ds.colors.dark.border}`,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: ds.spacing[4],
    },
    title: {
      fontSize: ds.typography.fontSizes.lg,
      fontWeight: ds.typography.fontWeights.semibold,
      color: ds.colors.dark.text_primary,
      marginLeft: ds.spacing[3],
    },
    listContainer: {
      flex: 1,
      overflowY: 'auto',
      paddingRight: ds.spacing[2], // Espaço para a barra de rolagem
    },
    listItem: {
      padding: `${ds.spacing[3]} 0`,
      borderBottom: `1px solid ${ds.colors.dark.border}`,
    },
    itemTopRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: ds.spacing[1],
    },
    assetName: {
      fontSize: ds.typography.fontSizes.sm,
      fontWeight: ds.typography.fontWeights.medium,
      color: ds.colors.dark.text_primary,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    itemBottomRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: ds.typography.fontSizes.xs,
      color: ds.colors.dark.text_secondary,
    },
    scheduleButton: {
      background: 'none',
      border: 'none',
      color: ds.colors.primary.main,
      fontWeight: ds.typography.fontWeights.semibold,
      cursor: 'pointer',
      padding: 0,
      fontSize: ds.typography.fontSizes.xs,
      transition: 'text-decoration 0.2s',
    },
    emptyStateContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: ds.colors.dark.text_secondary,
    },
    spinner: { 
        width: ds.spacing[8], 
        height: ds.spacing[8], 
        borderTop: `2px solid ${ds.colors.primary.main}`,
        borderRight: `2px solid ${ds.colors.primary.main}`,
        borderBottom: '2px solid transparent',
        borderLeft: '2px solid transparent',
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
    },
  }), [ds]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <LightBulbIcon style={{ width: 24, height: 24, color: ds.colors.warning.main }} />
        <h3 style={styles.title}>Previsões de Falha (IA)</h3>
      </div>
      
      {isLoading ? (
        <div style={styles.emptyStateContainer}><div style={styles.spinner}></div></div>
      ) : predictions.length > 0 ? (
        <div style={styles.listContainer}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {predictions.sort((a, b) => b.probability - a.probability).map((pred, index) => (
              <li key={pred.assetId} style={{...styles.listItem, borderBottom: index === predictions.length - 1 ? 'none' : styles.listItem.borderBottom}}>
                <div style={styles.itemTopRow}>
                  <p style={styles.assetName}>{pred.assetName}</p>
                  <span style={getProbabilityStyle(pred.probability)}>
                    {(pred.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={styles.itemBottomRow}>
                  <span>
                    Data Prevista: {formatDate(pred.predictedDate)}
                  </span>
                  <button style={styles.scheduleButton} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                    Agendar Inspeção
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={styles.emptyStateContainer}>
          <p style={{ fontSize: ds.typography.fontSizes.sm }}>Nenhuma predição crítica.</p>
          <p style={{ marginTop: ds.spacing[1], fontSize: ds.typography.fontSizes.xs }}>A IA está monitorando seus ativos.</p>
        </div>
      )}
    </div>
  );
};

export default PredictionList;
