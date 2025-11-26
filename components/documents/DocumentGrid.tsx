
import React from 'react';
import { CompanyDocument } from '../../types';
import { DocumentTextIcon, EyeIcon, ArrowDownTrayIcon, ExclamationTriangleIcon, CheckCircleIcon } from '../common/icons';
import { formatDate } from '../../utils/formatters';
import { downloadBase64File } from '../../utils/fileUtils';

interface DocumentGridProps {
  documents: CompanyDocument[];
  onEdit: (doc: CompanyDocument) => void;
  onDelete: (doc: CompanyDocument) => void;
  viewMode?: 'grid' | 'list';
}

const DocumentGrid: React.FC<DocumentGridProps> = ({ documents, onEdit, onDelete, viewMode = 'grid' }) => {
  
  const getStatusBadge = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><ExclamationTriangleIcon className="w-3 h-3 mr-1"/> Vencido</span>;
    } else if (diffDays <= 30) {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"><ExclamationTriangleIcon className="w-3 h-3 mr-1"/> Vence em {diffDays} dias</span>;
    } else {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircleIcon className="w-3 h-3 mr-1"/> Válido</span>;
    }
  };

  const handleDownload = (doc: CompanyDocument) => {
      if (doc.fileUrl) {
          downloadBase64File(doc.fileUrl, doc.fileName || doc.name);
      } else {
          alert("Este documento não possui arquivo anexado.");
      }
  };

  if (documents.length === 0) {
    return <div className="text-center text-gray-500 py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-3"/>
        <p>Nenhum documento encontrado com os filtros atuais.</p>
    </div>;
  }

  if (viewMode === 'list') {
      return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Documento</th>
                        <th scope="col" className="px-6 py-3">Categoria</th>
                        <th scope="col" className="px-6 py-3">Tags</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Upload</th>
                        <th scope="col" className="px-6 py-3 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map(doc => (
                        <tr key={doc.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded mr-3 text-primary-600">
                                    <DocumentTextIcon className="w-5 h-5"/>
                                </div>
                                <div>
                                    <p>{doc.name}</p>
                                    {doc.fileName && <p className="text-xs text-gray-400 font-normal">{doc.fileName}</p>}
                                </div>
                            </th>
                            <td className="px-6 py-4">{doc.category}</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {doc.tags.slice(0, 2).map(tag => <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">{tag}</span>)}
                                    {doc.tags.length > 2 && <span className="text-xs text-gray-500">+{doc.tags.length - 2}</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(doc.expiryDate)}</td>
                            <td className="px-6 py-4">{formatDate(doc.uploadDate)}</td>
                            <td className="px-6 py-4 text-center space-x-2">
                                <button onClick={() => handleDownload(doc)} className="text-gray-500 hover:text-primary-600" title="Baixar Arquivo"><ArrowDownTrayIcon className="w-4 h-4"/></button>
                                <button onClick={() => onDelete(doc)} className="text-gray-500 hover:text-red-600" title="Excluir">&times;</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {documents.map(doc => (
        <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between border border-gray-200 dark:border-gray-700 group">
          <div>
            <div className="flex justify-between items-start mb-3">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600">
                     <DocumentTextIcon className="w-8 h-8" />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDownload(doc)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500" title="Baixar"><ArrowDownTrayIcon className="w-4 h-4"/></button>
                    <button onClick={() => onDelete(doc)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500" title="Excluir">&times;</button>
                </div>
            </div>
            
            <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1" title={doc.name}>{doc.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{doc.category}</p>
            
            <div className="mb-3">
                {getStatusBadge(doc.expiryDate)}
            </div>

            <div className="flex flex-wrap gap-1 mb-3 h-12 overflow-hidden content-start">
              {doc.tags.map(tag => <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">{tag}</span>)}
            </div>
          </div>
          
          <div className="pt-3 border-t dark:border-gray-700 flex justify-between items-center mt-auto">
             <span className="text-xs text-gray-400">{new Date(doc.uploadDate).toLocaleDateString()}</span>
             {doc.fileUrl && <button onClick={() => handleDownload(doc)} className="text-xs font-medium text-primary-600 hover:underline">Baixar Anexo</button>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentGrid;
