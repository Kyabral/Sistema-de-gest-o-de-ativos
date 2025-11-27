
import React from 'react';
import * as ds from '../../styles/designSystem';

type Style = React.CSSProperties;

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  style?: Style;
  labelStyle?: Style;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, id, style, labelStyle, ...rest }) => {

  const styles: { [key: string]: Style } = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: ds.spacing[2],
    },
    label: {
      fontSize: ds.typography.fontSizes.sm,
      fontWeight: ds.typography.fontWeights.medium,
      color: ds.colors.dark.text_secondary,
      ...labelStyle,
    },
    input: {
      ...ds.componentStyles.input,
      backgroundColor: ds.colors.dark.background,
      color: ds.colors.dark.text_primary,
      border: `1px solid ${ds.colors.dark.border}`,
      ...style,
    },
  };

  return (
    <div style={styles.container}>
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>
      <input
        type="date"
        id={id}
        style={styles.input}
        {...rest}
      />
    </div>
  );
};

export default DatePicker;
