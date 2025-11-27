
import React from 'react';
import * as ds from '../../styles/designSystem';

type Style = React.CSSProperties;

interface CardProps {
  children: React.ReactNode;
  style?: Style;
  className?: string; 
}

const Card: React.FC<CardProps> = ({ children, style, className }) => {
  const cardStyle: Style = {
    ...ds.componentStyles.card,
    backgroundColor: ds.colors.dark.card,
    border: `1px solid ${ds.colors.dark.border}`,
    ...style,
  };

  return (
    <div style={cardStyle} className={className}>
      {children}
    </div>
  );
};

export default Card;
