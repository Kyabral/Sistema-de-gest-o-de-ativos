import { Asset, StockItem, BrandingSettings } from '../types';

function escapeCsvField(field: any): string {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (/[",\n\r]/.test(stringField)) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

function createReportHeader(reportTitle: string, branding: BrandingSettings): string {
    let header = `${escapeCsvField(branding.companyName)}\n`;
    if (branding.slogan) {
        header += `${escapeCsvField(branding.slogan)}\n`;
    }
    header += `${escapeCsvField(reportTitle)}\n`;
    header += `${escapeCsvField(`Exportado em: ${new Date().toLocaleString('pt-BR')}`)}\n`;
    if (branding.institutionalMessage) {
        header += `${escapeCsvField(branding.institutionalMessage)}\n`;
    }
    header += '\n'; // Blank line for separation
    return header;
}

function convertAssetsToCSV(assets: Asset[], branding: BrandingSettings): string {
    const reportHeader = createReportHeader('Relatório de Ativos', branding);
    
    const headers = [
        'ID', 'Nome', 'Tipo', 'Localizacao', 'Data de Compra', 'Data de Expiracao',
        'Valor de Compra', 'Status', 'Score de Saude', 'Custo Total de Manutencao'
    ];

    const rows = assets.map(asset => {
        const totalMaintenanceCost = asset.maintenanceHistory.reduce((sum, m) => sum + m.cost, 0);
        return [
            asset.id, asset.name, asset.type, asset.location, asset.purchaseDate,
            asset.expirationDate, asset.purchaseValue, asset.status, asset.healthScore,
            totalMaintenanceCost
        ].map(escapeCsvField).join(',');
    });

    return reportHeader + [headers.join(','), ...rows].join('\n');
}

export const exportAssetsToCSV = (assets: Asset[], branding: BrandingSettings) => {
    if (!assets || assets.length === 0) {
        alert('Nenhum ativo para exportar.');
        return;
    }

    const csvString = convertAssetsToCSV(assets, branding);
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    const safeCompanyName = (branding.companyName || 'sga').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('href', url);
    link.setAttribute('download', `${safeCompanyName}_export_ativos.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// --- Stock Export ---

function convertStockToCSV(stockItems: StockItem[], branding: BrandingSettings): string {
    const reportHeader = createReportHeader('Relatório de Estoque', branding);

    const headers = [
        'ID', 'Nome do Item', 'SKU', 'Quantidade', 'Localização', 'Limite Mínimo', 'Última Atualização', 'Nº do Lote', 'Data de Validade'
    ];

    const rows = stockItems.map(item => {
        return [
            item.id, item.name, item.sku, item.quantity, item.location, item.threshold, 
            new Date(item.lastUpdated).toLocaleString('pt-BR'), item.lotNumber || '', item.expiryDate || ''
        ].map(escapeCsvField).join(',');
    });

    return reportHeader + [headers.join(','), ...rows].join('\n');
}

export const exportStockToCSV = (stockItems: StockItem[], branding: BrandingSettings) => {
    if (!stockItems || stockItems.length === 0) {
        alert('Nenhum item de estoque para exportar.');
        return;
    }

    const csvString = convertStockToCSV(stockItems, branding);
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    const url = URL.createObjectURL(blob);
    const safeCompanyName = (branding.companyName || 'sga').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('href', url);
    link.setAttribute('download', `${safeCompanyName}_export_estoque.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
