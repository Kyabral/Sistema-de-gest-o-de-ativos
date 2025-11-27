
import React from 'react';
import * as ds from '../../styles/designSystem';

type Style = React.CSSProperties;

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, id }) => {

  const styles: { [key: string]: Style } = {
    container: {
      position: 'relative',
      display: 'inline-block',
      width: 44, 
      height: 24, 
      cursor: 'pointer',
    },
    input: {
      opacity: 0,
      width: 0,
      height: 0,
    },
    slider: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: checked ? ds.colors.primary.main : ds.colors.dark.border,
      borderRadius: 34,
      transition: 'background-color 0.2s',
    },
    thumb: {
      position: 'absolute',
      height: 18,
      width: 18,
      left: 3,
      bottom: 3,
      backgroundColor: 'white',
      borderRadius: '50%',
      transition: 'transform 0.2s',
      transform: checked ? 'translateX(20px)' : 'translateX(0)',
    },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <label style={styles.container} htmlFor={id}>
      <input id={id} type="checkbox" style={styles.input} checked={checked} onChange={handleChange} />
      <span style={styles.slider}></span>
      <span style={styles.thumb}></span>
    </label>
  );
};

export default Switch;
