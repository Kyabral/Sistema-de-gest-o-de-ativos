
import { Invoice, BrandingSettings } from '../types';
import { formatCurrency } from './formatters';

export const printInvoice = (invoice: Invoice, branding: BrandingSettings) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const formatDate = (dateStr: string) => {
     if(!dateStr) return '';
     const date = new Date(dateStr);
     // Adjust for timezone to ensure date doesn't shift
     const userTimezoneOffset = date.getTimezoneOffset() * 60000;
     const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
     return adjustedDate.toLocaleDateString('pt-BR');
  }

  const address = branding.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' };
  const bank = branding.bankInfo || { bankName: '', agency: '', accountNumber: '', pixKey: '' };

  const logoHtml = branding.logoUrl 
    ? `<img src="${branding.logoUrl}" style="max-width: 180px; max-height: 80px; margin-bottom: 10px; object-fit: contain;" alt="Logo" />` 
    : `<h2 style="font-size: 16px; font-weight: bold; margin-bottom: 2px;">${branding.companyName.toUpperCase()}</h2>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nota Fatura - ${invoice.invoiceNumber}</title>
      <style>
        @page { size: A4; margin: 10mm; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; -webkit-print-color-adjust: exact; color: #000; }
        .container { width: 100%; max-width: 800px; margin: 0 auto; border: 2px solid #000; box-sizing: border-box; }
        .row { display: flex; border-bottom: 1px solid #000; width: 100%; }
        .col { padding: 5px; box-sizing: border-box; }
        .border-right { border-right: 1px solid #000; }
        .header-left { flex: 6; padding: 10px; }
        .header-right { flex: 4; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; }
        h1, h2, h3, p { margin: 0; }
        .label { font-weight: bold; font-size: 10px; margin-right: 4px; }
        .value { font-size: 11px; }
        .table-header { font-weight: bold; font-size: 10px; border-bottom: 1px solid #000; background-color: #f0f0f0; }
        .table-row { font-size: 11px; }
        .table-cell { padding: 4px; border-right: 1px solid #000; }
        .last-cell { border-right: none; }
        .footer-stub { padding: 10px; font-size: 11px; width: 100%; box-sizing: border-box; }
        .signature-line { border-top: 1px solid #000; margin-top: 30px; padding-top: 2px; font-size: 10px; text-align: center; }
        
        .info-row { display: flex; align-items: center; margin-bottom: 2px; font-size: 11px; }
        .info-col { display: flex; align-items: center; margin-right: 10px; }
        
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="row">
          <div class="header-left border-right">
            ${logoHtml}
            <h3 style="font-size: 14px; margin-bottom: 8px; font-weight: normal;">${branding.companyName.toUpperCase()} SERVIÇOS E CONSULTORIA</h3>
            
            <div class="info-row">
                <span class="label">CNPJ:</span> <span class="value">${branding.cnpj || '00.000.000/0000-00'}</span>
                <span class="label" style="margin-left: 10px;">INSC. EST.:</span> <span class="value">${branding.stateRegistration || 'ISENTO'}</span>
            </div>
            <div class="info-row">
                <span class="label">INSCRIÇÃO MUNICIPAL:</span> <span class="value">${branding.municipalRegistration || '-'}</span>
            </div>
            
            <div style="margin-top: 8px;">
                <p class="value" style="font-weight: bold;">${address.street}, ${address.number} ${address.neighborhood ? '- ' + address.neighborhood : ''}</p>
                <p class="value" style="font-weight: bold;">CEP: ${address.zipCode} - ${address.city.toUpperCase()} - ${address.state.toUpperCase()}</p>
            </div>
          </div>
          <div class="header-right">
            <h3 style="font-size: 14px; font-weight: bold;">NOTA FATURA DE LOCAÇÃO</h3>
            <h2 style="font-size: 24px; margin: 5px 0;">Nº ${String(invoice.invoiceNumber).padStart(6, '0')}</h2>
            <div style="text-align: left; font-size: 11px; width: 100%;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span><strong>DATA DE EMISSÃO:</strong></span>
                    <span>${formatDate(invoice.issueDate)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span><strong>DATA LIMITE:</strong></span>
                    <span>${formatDate(invoice.dueDate)}</span>
                </div>
            </div>
          </div>
        </div>

        <!-- Client -->
        <div class="row" style="display: block; padding: 5px;">
            <div class="info-row">
                <span class="label" style="width: 60px;">CLIENTE:</span>
                <span class="value" style="border-bottom: 1px solid #ccc; flex: 1;">${invoice.clientName}</span>
            </div>
            <div class="info-row">
                <span class="label" style="width: 60px;">ENDEREÇO:</span>
                <span class="value" style="border-bottom: 1px solid #ccc; flex: 1;"> - </span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <div style="display: flex; align-items: center; flex: 2;">
                    <span class="label" style="width: 60px;">MUNICÍPIO:</span>
                    <span class="value" style="border-bottom: 1px solid #ccc; flex: 1;"> - </span>
                </div>
                <div style="display: flex; align-items: center; flex: 1; margin-left: 10px;">
                    <span class="label">CEP:</span>
                    <span class="value" style="border-bottom: 1px solid #ccc; flex: 1;"> - </span>
                </div>
                 <div style="display: flex; align-items: center; margin-left: 10px;">
                    <span class="label">EST:</span>
                    <span class="value" style="border-bottom: 1px solid #ccc; width: 30px;"> - </span>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
                 <div style="display: flex; align-items: center; flex: 1;">
                    <span class="label" style="width: 60px;">CNPJ/CPF:</span>
                    <span class="value" style="border-bottom: 1px solid #ccc; flex: 1;"> - </span>
                </div>
            </div>
        </div>

        <!-- Contract & Payment -->
        <div class="row">
            <div class="col border-right" style="flex: 1;">
                <span class="label">NÚMERO DO CONTRATO:</span>
            </div>
            <div class="col" style="flex: 1;">
                <span class="label">FORMA DE PAGAMENTO:</span>
            </div>
        </div>

        <!-- Observations -->
        <div class="row" style="height: 100px; display: block; position: relative;">
             <span class="label" style="position: absolute; top: 5px; left: 5px;">OBS</span>
             <div style="display: flex; justify-content: space-between; padding: 15px 40px 5px 40px; font-size: 12px;">
                <div>
                    <p style="margin-bottom: 15px;">REF. ${new Date(invoice.issueDate).toLocaleString('pt-BR', { month: 'long' })}</p>
                    ${bank.pixKey ? `<p>Pagamento via PIX: ${bank.pixKey}</p>` : ''}
                </div>
                <div>
                    <p>${bank.bankName ? bank.bankName : 'Banco: -'}</p>
                    <p>Agência: ${bank.agency || '-'}</p>
                    <p style="margin-top: 15px;">C. C: ${bank.accountNumber || '-'}</p>
                </div>
             </div>
        </div>

        <!-- Items -->
        <div class="row" style="display: block; border-bottom: none;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr class="table-header">
                        <th class="table-cell" style="width: 50px; text-align: center;">CÓDIGO</th>
                        <th class="table-cell" style="text-align: left;">DESCRIÇÃO</th>
                        <th class="table-cell" style="width: 60px; text-align: center;">QUANT.</th>
                        <th class="table-cell" style="width: 100px; text-align: right;">VALOR UNIT.</th>
                        <th class="table-cell last-cell" style="width: 100px; text-align: right;">VALOR TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map((item, index) => `
                        <tr class="table-row" style="border-bottom: 1px solid #ccc;">
                            <td class="table-cell" style="text-align: center;">${index + 1}</td>
                            <td class="table-cell">${item.description}</td>
                            <td class="table-cell" style="text-align: center;">${item.quantity}</td>
                            <td class="table-cell" style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
                            <td class="table-cell last-cell" style="text-align: right;">${formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                    <!-- Minimum Height Filler -->
                    <tr style="height: 120px;">
                        <td class="table-cell"></td>
                        <td class="table-cell"></td>
                        <td class="table-cell"></td>
                        <td class="table-cell"></td>
                        <td class="table-cell last-cell"></td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr style="border-top: 2px solid #000; font-weight: bold; font-size: 14px;">
                        <td colspan="4" class="table-cell" style="text-align: right; padding: 8px;">TOTAL</td>
                        <td class="table-cell last-cell" style="text-align: right; padding: 8px;">${formatCurrency(invoice.total)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Footer -->
        <div class="row" style="border-top: 2px solid #000; border-bottom: none; display: block;">
            <div class="footer-stub">
                <p style="margin-bottom: 25px;">Recebi(emos) de ${branding.companyName.toUpperCase()} os serviços constantes desta Nota Fatura de Locação</p>
                <div style="display: flex; gap: 20px; align-items: flex-end;">
                    <div style="flex: 1;">
                        <div class="signature-line">Data de Recebimento</div>
                    </div>
                    <div style="flex: 2;">
                         <div class="signature-line">Identificação e Assinatura do Recebedor</div>
                    </div>
                </div>
            </div>
        </div>

      </div>
      <script>
        window.onload = function() { setTimeout(function(){ window.print(); }, 500); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
