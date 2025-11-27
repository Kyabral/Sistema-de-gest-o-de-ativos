
import React from 'react';
import * as ds from '../../styles/designSystem';

type Style = React.CSSProperties;

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  style?: Style;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ style, children, ...props }) => {

  const selectContainerStyle: Style = {
    position: 'relative',
    width: '100%',
  };
  
  const selectStyle: Style = {
    ...ds.componentStyles.input, // Reusing input styles for consistency
    backgroundColor: ds.colors.dark.background,
    color: ds.colors.dark.text_primary,
    border: `1px solid ${ds.colors.dark.border}`,
    width: '100%',
    appearance: 'none', // Remove default arrow
    ...style,
  };

  const arrowStyle: Style = {
      position: 'absolute',
      right: ds.spacing[3],
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: ds.colors.dark.text_secondary,
  }

  return (
    <div style={selectContainerStyle}>
      <select style={selectStyle} {...props}>
        {children}
      </select>
      <div style={arrowStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default Select;
