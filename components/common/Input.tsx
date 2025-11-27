
import React from 'react';
import * as ds from '../../styles/designSystem';

type Style = React.CSSProperties;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  style?: Style;
}

const Input: React.FC<InputProps> = ({ style, ...props }) => {

  const inputStyle: Style = {
    ...ds.componentStyles.input,
    backgroundColor: ds.colors.dark.background,
    color: ds.colors.dark.text_primary,
    border: `1px solid ${ds.colors.dark.border}`,
    width: '100%',
    ...style,
  };

  return (
    <input style={inputStyle} {...props} />
  );
};

export default Input;
