
import React, { useEffect } from 'react';
import * as ds from '../../styles/designSystem';
import { XMarkIcon } from './icons';

type Style = React.CSSProperties;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  style?: Style;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, style, footer }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const styles: { [key: string]: Style } = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 50,
    },
    modal: {
      ...ds.componentStyles.card,
      backgroundColor: ds.colors.dark.card,
      border: `1px solid ${ds.colors.dark.border}`,
      width: '90%',
      maxWidth: '640px', // Equivalent to max-w-2xl
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: ds.spacing[4],
      borderBottom: `1px solid ${ds.colors.dark.border}`,
      flexShrink: 0,
    },
    title: {
      fontSize: ds.typography.fontSizes.lg,
      fontWeight: ds.typography.fontWeights.bold,
      color: ds.colors.dark.text_primary,
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      color: ds.colors.dark.text_secondary,
      cursor: 'pointer',
    },
    content: {
      padding: ds.spacing[5],
      overflowY: 'auto',
      flexGrow: 1,
    },
    footer: {
      padding: ds.spacing[4],
      borderTop: `1px solid ${ds.colors.dark.border}`,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: ds.spacing[3],
      flexShrink: 0,
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button onClick={onClose} style={styles.closeButton} aria-label="Fechar modal">
            <XMarkIcon style={{ width: 24, height: 24 }} />
          </button>
        </header>
        <main style={styles.content}>
          {children}
        </main>
        {footer && (
          <footer style={styles.footer}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;
