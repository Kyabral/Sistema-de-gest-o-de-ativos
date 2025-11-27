
import React, { useMemo } from 'react';
import * as ds from '../../styles/designSystem';

type Style = React.CSSProperties;

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorName?: keyof typeof ds.colors; // ex: 'primary', 'success', 'error'
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, colorName = 'primary' }) => {

  const [isHovered, setIsHovered] = React.useState(false);

  const colorTheme = ds.colors[colorName] || ds.colors.primary;

  // Estilos dinâmicos baseados no Design System
  const styles: { [key: string]: Style } = useMemo(() => ({
    card: {
      ...ds.componentStyles.card,
      backgroundColor: ds.colors.dark.card,
      padding: ds.spacing[6],
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${ds.colors.dark.border}`,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
      boxShadow: isHovered ? `0 10px 20px rgba(0,0,0,0.3)` : ds.shadows.dark_md,
    },
    content: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      position: 'relative',
      zIndex: 2,
    },
    textContainer: {
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
    },
    title: {
      fontSize: ds.typography.fontSizes.sm,
      fontWeight: ds.typography.fontWeights.medium,
      color: ds.colors.dark.text_secondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: ds.spacing[2],
    },
    value: {
      fontSize: ds.typography.fontSizes['3xl'],
      fontWeight: ds.typography.fontWeights.bold,
      color: ds.colors.dark.text_primary,
      lineHeight: 1.1,
    },
    iconWrapper: {
      padding: ds.spacing[3],
      borderRadius: ds.borders.radius.md,
      backgroundColor: colorTheme.main,
      color: colorTheme.contrastText || ds.colors.neutral[100],
      boxShadow: `0 4px 12px ${colorTheme.main}40`,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    },
    backgroundGlow: {
      position: 'absolute',
      top: '-50%',
      right: '-50%',
      width: '200%',
      height: '200%',
      background: `radial-gradient(circle, ${colorTheme.main}1A 0%, transparent 40%)`,
      transition: 'opacity 0.5s ease',
      opacity: isHovered ? 1 : 0,
      zIndex: 1,
    },
  }), [isHovered, colorTheme]);

  return (
    <div 
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.backgroundGlow} />
      <div style={styles.content}>
        <div style={styles.textContainer}>
          <p style={styles.title}>{title}</p>
          <h3 style={styles.value}>{value}</h3>
        </div>
        <div style={styles.iconWrapper}>
          {React.cloneElement(icon as React.ReactElement, { style: { width: 24, height: 24 } })}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
