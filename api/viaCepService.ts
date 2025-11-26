
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export const searchCep = async (cep: string): Promise<ViaCepResponse | null> => {
  // Remove non-digits
  const cleanCep = cep.replace(/\D/g, '');

  // Validation: CEP must have 8 digits
  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data: ViaCepResponse = await response.json();
    
    if (data.erro) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching CEP:", error);
    return null;
  }
};
