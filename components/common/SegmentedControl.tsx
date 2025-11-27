
import React from 'react';
import * as ds from '../../styles/designSystem';

type Style = React.CSSProperties;

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: React.ReactNode }[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  name: string;
}

const SegmentedControl = <T extends string>({ options, selectedValue, onValueChange, name }: SegmentedControlProps<T>) => {

  const styles: { [key: string]: Style } = {
    container: {
      display: 'flex',
      padding: ds.spacing[1],
      backgroundColor: ds.colors.dark.background,
      borderRadius: ds.borders.radius.md,
      border: `1px solid ${ds.colors.dark.border}`,
    },
    option: {
      padding: `${ds.spacing[1]} ${ds.spacing[3]}`,
      fontSize: ds.typography.fontSizes.sm,
      fontWeight: ds.typography.fontWeights.medium,
      borderRadius: ds.borders.radius.sm,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: ds.spacing[2],
    },
  };

  return (
    <div style={styles.container} role="radiogroup">
      {options.map(option => {
        const isSelected = option.value === selectedValue;
        const selectedStyle: Style = isSelected ? {
          backgroundColor: ds.colors.dark.card,
          color: ds.colors.primary.main,
        } : {
            color: ds.colors.dark.text_secondary,
        };

        return (
          <div 
            key={option.value} 
            style={{ ...styles.option, ...selectedStyle }}
            onClick={() => onValueChange(option.value)}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
          >
            {option.label}
          </div>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
