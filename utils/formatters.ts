
/**
 * Formats a number into a BRL currency string.
 * @param value The number to format.
 * @returns A string like "R$ 1.234,56".
 */
export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

/**
 * Formats a date string into a DD/MM/YYYY format.
 * @param dateString The date string (e.g., "2023-10-27").
 * @returns A formatted date string or "N/A" if the input is invalid.
 */
export const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    // Use UTC to prevent timezone shifts from changing the date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data Inválida";
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return utcDate.toLocaleDateString('pt-BR', {});
};

/**
 * Formats a string into a CEP format (00000-000).
 * @param value The raw CEP string.
 * @returns Formatted CEP.
 */
export const formatCep = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .substr(0, 9);
};
