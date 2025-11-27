import { GoogleGenAI, Type } from "@google/genai";
import { Asset, FailurePrediction } from '../types';

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.error("A chave API para o Gemini não foi encontrada. Certifique-se de que a variável de ambiente VITE_GEMINI_API_KEY está definida em seu arquivo .env");
}

const IA_SERVICE_ERROR_MESSAGE = "O serviço de IA não está configurado corretamente. Verifique se a chave da API foi fornecida.";

export async function getAIInsight(query: string, assets: Asset[]): Promise<string> {
  if (!ai) {
    return IA_SERVICE_ERROR_MESSAGE;
  }
  const model = "gemini-2.5-flash";

  const systemInstruction = `Você é um consultor sênior de gestão de ativos (SGA+) e especialista em otimização financeira. Sua tarefa é responder perguntas sobre os ativos de uma empresa com base nos dados JSON fornecidos.\nForneça respostas claras, concisas e acionáveis em português.\nSuas capacidades incluem:\n- Análise de dados: Resumir o status, custos e distribuição dos ativos.\n- Insights preditivos: Com base nos dados, estime a vida útil, identifique riscos de obsolescência e preveja custos de manutenção futuros.\n- Recomendações de otimização: Sugira ações para reduzir custos, melhorar a utilização dos ativos ou planejar substituições (ex: \"Considere substituir a Impressora HP, pois seus custos de reparo acumulados (R$750) já atingiram 41% do seu valor de compra (R$1800) e sua garantia expirou.\").\n- Geração de relatórios: Quando solicitado, formate a resposta como um relatório sucinto.\nSeja proativo em suas análises. Se um usuário perguntar \"Quais ativos estão em reparo?\", além de listar, você pode adicionar um insight como \"A Impressora HP está em reparo pela segunda vez em 6 meses, sugerindo uma análise de custo-benefício para sua substituição.\"\nEvite retornar JSON ou listas brutas. Formate a resposta de forma legível e profissional.`;

  const userContent = `
    Aqui estão os dados dos ativos atuais:
    ${JSON.stringify(assets, null, 2)}

    Pergunta do usuário: \"${query}\"

    Resposta:`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userContent,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Desculpe, ocorreu um erro ao contatar o assistente de IA. Por favor, tente novamente mais tarde.";
  }
}

export async function getAISuggestions(assetName: string): Promise<{ category: string; location: string }> {
  if (!ai) {
    console.error(IA_SERVICE_ERROR_MESSAGE);
    return { category: '', location: '' };
  }
  if (assetName.trim().length < 3) return { category: '', location: '' };
  
  const model = "gemini-2.5-flash";
  const systemInstruction = `Você é um assistente de IA especialista em categorização de ativos corporativos. Sua tarefa é analisar o nome de um ativo e retornar a categoria e um centro de custo/localização provável em formato JSON. Responda APENAS com o JSON.\n  Exemplos de Categorias: Equipamento de TI, Veículo, Mobiliário de Escritório, Infraestrutura de Rede, Equipamento Audiovisual, Ferramenta Industrial.\n  Exemplos de Localização/Centro de Custo: Departamento de TI, Garagem, Escritório 101, Data Center, Almoxarifado, Sala de Reunião Principal.`;

  const userContent = `
    Nome do Ativo: \"${assetName}\"

    Analise o nome do ativo acima e retorne a categoria e a localização mais provável no seguinte formato JSON:
    {
      \"category\": \"string\",
      \"location\": \"string\"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userContent,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });
    
    const jsonText = response.text.trim();
    if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
      const suggestions = JSON.parse(jsonText);
      return {
        category: suggestions.category || '',
        location: suggestions.location || ''
      };
    }
    return { category: '', location: '' };
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    return { category: '', location: '' };
  }
}

export async function getPreventiveMaintenanceSuggestion(newAsset: Asset, allAssets: Asset[]): Promise<string> {
    if (!ai) {
      return IA_SERVICE_ERROR_MESSAGE;
    }
    const model = "gemini-2.5-flash";
    const systemInstruction = `Você é um especialista em manutenção preditiva e gestão de ativos. Sua tarefa é analisar um novo ativo cadastrado e, com base no histórico de ativos similares existentes, sugerir um plano de manutenção preventiva. Considere tanto o **tipo** do ativo quanto sua **localização** para fornecer recomendações mais precisas. Por exemplo, equipamentos em um \"Data Center\" podem ter necessidades diferentes de equipamentos em um \"Escritório\". A resposta deve ser concisa, acionável e em português, focando em 1 ou 2 ações principais. Se nenhum padrão for encontrado, retorne uma recomendação genérica.`;

    const similarAssets = allAssets.filter(asset => asset.type === newAsset.type && asset.id !== newAsset.id);

    if (similarAssets.length === 0) {
        return `Recomendação Padrão: Para o novo ativo \"${newAsset.name}\", recomendamos registrar todas as manutenções e seguir as diretrizes de revisão do fabricante para estabelecer um histórico de confiança.`;
    }

    const userContent = `
      **Novo Ativo Adicionado:**
      - Tipo: ${newAsset.type}
      - Localização: ${newAsset.location}
      - Detalhes: ${JSON.stringify(newAsset)}

      **Histórico de Ativos Similares (mesmo tipo):**
      ${JSON.stringify(similarAssets.map(a => ({ id: a.id, name: a.name, location: a.location, maintenanceHistory: a.maintenanceHistory })), null, 2)}

      **Tarefa:**
      Analise o histórico de manutenções dos ativos similares, prestando atenção especial àqueles na mesma **localização** ou em locais parecidos. Com base nessa análise, gere uma recomendação de manutenção preventiva para o **novo ativo**. Por exemplo, se outros laptops no \"Departamento de Engenharia\" (local de uso intensivo) tiveram problemas de superaquecimento, sugira uma limpeza interna anual para o novo laptop nesse mesmo local.

      **Formato da Resposta:**
      Um parágrafo curto e direto. Comece com \"Recomendação de Manutenção Preditiva:\".
      Exemplo: \"Recomendação de Manutenção Preditiva: Com base em outros servidores ProLiant no mesmo Data Center, recomendamos agendar uma verificação da fonte de alimentação redundante a cada 12 meses para evitar falhas inesperadas.\"
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: userContent,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting preventive maintenance suggestion:", error);
        return "Não foi possível gerar uma sugestão de manutenção. Recomendamos seguir as diretrizes do fabricante.";
    }
}


export async function generateFailurePredictions(assets: Asset[]): Promise<FailurePrediction[]> {
  if (!ai) {
    console.error(IA_SERVICE_ERROR_MESSAGE);
    return [];
  }
  if (assets.length === 0) {
    return [];
  }
  const model = "gemini-2.5-flash";

  const systemInstruction = `Você é um especialista em manutenção preditiva. Analise a lista de ativos fornecida. Com base na idade do ativo (calculada a partir da data de compra), seu status atual e o histórico de manutenção, identifique até 3 ativos com maior probabilidade de falha nos próximos 90 dias. Para cada ativo identificado, forneça a probabilidade de falha (um número entre 0 e 1) e uma data prevista para a falha. Retorne os dados como um array JSON.`;
  
  // To save tokens and costs, we only send a summary of each asset
  const assetSummaries = assets.map(asset => ({
    id: asset.id,
    name: asset.name,
    purchaseDate: asset.purchaseDate,
    status: asset.status,
    maintenanceCount: asset.maintenanceHistory.length,
    totalMaintenanceCost: asset.maintenanceHistory.reduce((sum, m) => sum + m.cost, 0),
  }));

  const userContent = `
    Data de hoje: ${new Date().toISOString().split('T')[0]}
    Dados dos Ativos:
    ${JSON.stringify(assetSummaries, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userContent,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              assetId: { type: Type.STRING },
              assetName: { type: Type.STRING },
              probability: { type: Type.NUMBER },
              predictedDate: { type: Type.STRING },
            },
            required: ["assetId", "assetName", "probability", "predictedDate"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating failure predictions:", error);
    return []; // Return empty array on error
  }
}
