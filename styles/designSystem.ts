
// styles/designSystem.ts

// =======================================================================
// DESIGN SYSTEM - Sistema Inteligente de Gestão de Ativos (SGA) 2.0
// =======================================================================

// -----------------------------------------------------------------------
// ** PALETA DE CORES **
// Uma paleta moderna, profissional e energética.
// Base: Tons de azul escuro e cinza, com um verde vibrante para ações.
// -----------------------------------------------------------------------

export const colors = {
  // Cores Primárias
  primary: {
    main: '#0A7AFF',      // Azul vibrante para botões principais, links e foco
    light: '#E6F2FF',     // Fundo para itens selecionados ou hover leve
    dark: '#0056B3',      // Hover para botões primários
    contrastText: '#FFFFFF',
  },
  // Cores Secundárias
  secondary: {
    main: '#4A5568',      // Cinza escuro para texto secundário, ícones
    light: '#F7FAFC',     // Fundo de páginas, cards
    dark: '#2D3748',      // Cor de texto principal
    contrastText: '#FFFFFF', 
  },
  // Cores de Feedback
  success: {
    main: '#38A169',      // Verde para sucesso, confirmações
    light: '#E6F4EA',
  },
  error: {
    main: '#E53E3E',      // Vermelho para erros, alertas
    light: '#FFF5F5',
  },
  warning: {
    main: '#DD6B20',      // Laranja para avisos
    light: '#FEFCE0',
  },
  // Cores Neutras
  neutral: {
    100: '#FFFFFF', // Branco puro
    200: '#F7FAFC', // Fundo de página (light mode)
    300: '#EDF2F7', // Bordas, divisores
    400: '#E2E8F0', // Input borders
    500: '#CBD5E0', // Placeholders
    600: '#A0AEC0', // Texto de parágrafo, ícones inativos
    700: '#718096', // Texto de subtítulo
    800: '#4A5568', // Texto secundário
    900: '#1A202C', // Texto principal, cabeçalhos (light mode)
  },
  // Cores para o Dark Mode
  dark: {
    background: '#1A202C', // Fundo principal
    card: '#2D3748',       // Fundo de cards, modais
    text_primary: '#F7FAFC', // Texto principal
    text_secondary: '#A0AEC0', // Texto secundário
    border: '#4A5568',      // Bordas e divisores
  },
  // Extras
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadow_dark: 'rgba(0, 0, 0, 0.4)',
};

// -----------------------------------------------------------------------
// ** TIPOGRAFIA **
// Fontes limpas e modernas para máxima legibilidade.
// -----------------------------------------------------------------------

export const typography = {
  fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,

  fontSizes: {
    xs: '0.75rem',  // 12px
    sm: '0.875rem', // 14px
    md: '1rem',     // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem',  // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },

  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// -----------------------------------------------------------------------
// ** LAYOUT E ESPAÇAMENTO **
// Um sistema de espaçamento consistente baseado em uma unidade de 8px.
// -----------------------------------------------------------------------

export const spacing = {
  '1': '0.25rem', // 4px
  '2': '0.5rem',  // 8px
  '3': '0.75rem', // 12px
  '4': '1rem',    // 16px
  '5': '1.25rem', // 20px
  '6': '1.5rem',  // 24px
  '8': '2rem',    // 32px
  '10': '2.5rem', // 40px
  '12': '3rem',  // 48px
  '16': '4rem',  // 64px
};

// -----------------------------------------------------------------------
// ** BORDAS E SOMBRAS **
// -----------------------------------------------------------------------

export const borders = {
  radius: {
    sm: '0.25rem', // 4px
    md: '0.5rem',  // 8px
    lg: '1rem',    // 16px
    full: '9999px',
  },
  width: {
    sm: '1px',
    md: '2px',
  },
};

export const shadows = {
  sm: `0 1px 2px 0 ${colors.shadow}`,
  md: `0 4px 6px -1px ${colors.shadow}, 0 2px 4px -1px ${colors.shadow}`,
  lg: `0 10px 15px -3px ${colors.shadow}, 0 4px 6px -2px ${colors.shadow}`,
  xl: `0 20px 25px -5px ${colors.shadow}, 0 10px 10px -5px ${colors.shadow}`,
  none: 'none',
  // Dark mode shadows
  dark_sm: `0 1px 2px 0 ${colors.shadow_dark}`,
  dark_md: `0 4px 6px -1px ${colors.shadow_dark}, 0 2px 4px -1px ${colors.shadow_dark}`,
};

// -----------------------------------------------------------------------
// ** ESTILOS DE COMPONENTES (EXEMPLOS) **
// Como usar o Design System para estilizar componentes.
// -----------------------------------------------------------------------

export const componentStyles = {
  button: {
    primary: {
      backgroundColor: colors.primary.main,
      color: colors.primary.contrastText,
      padding: `${spacing[3]} ${spacing[5]}`,
      borderRadius: borders.radius.md,
      fontWeight: typography.fontWeights.semibold,
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: colors.primary.dark,
      }
    },
    secondary: {
      backgroundColor: colors.secondary.light,
      color: colors.secondary.dark,
      padding: `${spacing[3]} ${spacing[5]}`,
      borderRadius: borders.radius.md,
      fontWeight: typography.fontWeights.medium,
      border: `1px solid ${colors.neutral[400]}`,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: colors.neutral[300],
      }
    }
  },
  card: {
    backgroundColor: colors.neutral[100],
    borderRadius: borders.radius.lg,
    boxShadow: shadows.md,
    padding: spacing[6],
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: shadows.lg,
    }
  },
  input: {
    backgroundColor: colors.neutral[100],
    border: `1px solid ${colors.neutral[400]}`,
    borderRadius: borders.radius.md,
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: typography.fontSizes.md,
    color: colors.neutral[900],
    '&::placeholder': {
      color: colors.neutral[500],
    },
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary.main,
      boxShadow: `0 0 0 2px ${colors.primary.light}`,
    }
  }
};

// =======================================================================
// FIM DO DESIGN SYSTEM
// =======================================================================
