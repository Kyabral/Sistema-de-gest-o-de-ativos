
import React from 'react';
import * as ds from '../../styles/designSystem';

type Style = React.CSSProperties;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
  style?: Style;
}

const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    icon, 
    style, 
    ...props 
}) => {

  const baseStyle: Style = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${ds.spacing[2]} ${ds.spacing[4]}`,
    fontSize: ds.typography.fontSizes.sm,
    fontWeight: ds.typography.fontWeights.medium,
    borderRadius: ds.borders.radius.md,
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  };

  const variantStyles: { [key: string]: Style } = {
    primary: {
      backgroundColor: ds.colors.primary.main,
      color: ds.colors.primary.contrastText,
      border: `1px solid ${ds.colors.primary.main}`,
    },
    secondary: {
      backgroundColor: ds.colors.dark.card,
      color: ds.colors.dark.text_primary,
      border: `1px solid ${ds.colors.dark.border}`,
    },
    ghost: {
        backgroundColor: 'transparent',
        color: ds.colors.dark.text_secondary,
        border: '1px solid transparent',
    }
  };

  const iconStyle: Style = {
    marginRight: children ? ds.spacing[2] : 0,
  };

  // Basic hover/disabled effect management
  const [isHovered, setIsHovered] = React.useState(false);
  const finalStyle = {
      ...baseStyle, 
      ...variantStyles[variant],
      opacity: props.disabled ? 0.6 : 1,
      ...style
  };
  if (isHovered && !props.disabled) {
      if (variant === 'primary') finalStyle.backgroundColor = ds.colors.primary.dark;
      if (variant === 'secondary') finalStyle.backgroundColor = ds.colors.dark.background;
      if (variant === 'ghost') finalStyle.backgroundColor = ds.colors.dark.background;
  }

  return (
    <button 
        style={finalStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
    >
      {icon && React.cloneElement(icon as React.ReactElement, { style: iconStyle })}
      {children}
    </button>
  );
};

export default Button;
