
import React, { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { CompanyDocument } from '../types';
import DocumentGrid from '../components/documents/DocumentGrid';
import AddDocumentModal from '../components/documents/AddDocumentModal';
import EditDocumentModal from '../components/documents/EditDocumentModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { PlusIcon, ListBulletIcon, Squares2X2Icon } from '../components/common/icons';

const DocumentsPage: React.FC = () => {
  const { companyDocuments, addCompanyDocument, updateCompanyDocument, deleteCompanyDocument } = useApp();
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'expiring' | 'expired'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<CompanyDocument | null>(null);

  // Derived Data
  const uniqueCategories = useMemo(() => Array.from(new Set(companyDocuments.map(d => d.category))).sort(), [companyDocuments]);

  const filteredDocuments = useMemo(() => {
    const today = new Date();
    return companyDocuments.filter(doc => {
      // 1. Search
      const bySearch = searchQuery === '' || 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // 2. Category
      const byCategory = categoryFilter === '' || doc.category === categoryFilter;

      // 3. Status (Expiry)
      let byStatus = true;
      if (statusFilter !== 'all') {
          if (!doc.expiryDate) {
              byStatus = statusFilter === 'valid'; // No expiry = valid
          } else {
              const expiry = new Date(doc.expiryDate);
              const diffTime = expiry.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (statusFilter === 'expired') byStatus = diffDays < 0;
              else if (statusFilter === 'expiring') byStatus = diffDays >= 0 && diffDays <= 30;
              else if (statusFilter === 'valid') byStatus = diffDays > 0;
          }
      }

      return bySearch && byCategory && byStatus;
    });
  }, [companyDocuments, searchQuery, categoryFilter, statusFilter]);
  
  const handleOpenEdit = (doc: CompanyDocument) => {
    setSelectedDocument(doc);
    setIsEditModalOpen(true);
  };
  
  const handleOpenDelete = (doc: CompanyDocument) => {
    setSelectedDocument(doc);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedDocument) {
      await deleteCompanyDocument(selectedDocument.id);
      setIsDeleteModalOpen(false);
      setSelectedDocument(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Documentos Corporativos</h1>
            <p className="text-gray-500 dark:text-gray-400">Centralize contratos, manuais e certidões da empresa.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary flex items-center shrink-0">
            <PlusIcon className="w-5 h-5 mr-2" />
            Adicionar Documento
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {/* Toolbar & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <input 
                    type="text" 
                    placeholder="Buscar por nome ou tag..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    className="input-style" 
                />
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input-style">
                    <option value="">Todas as Categorias</option>
                    {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="input-style">
                    <option value="all">Todos os Status</option>
                    <option value="valid">Válidos</option>
                    <option value="expiring">A Vencer (30 dias)</option>
                    <option value="expired">Vencidos</option>
                </select>
            </div>
            
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border dark:border-gray-600 shrink-0">
                <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-primary-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    title="Visualização em Grade"
                >
                    <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-primary-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    title="Visualização em Lista"
                >
                    <ListBulletIcon className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Content Grid/List */}
        <DocumentGrid 
            documents={filteredDocuments} 
            onEdit={handleOpenEdit} 
            onDelete={handleOpenDelete} 
            viewMode={viewMode}
        />
      </div>

      <AddDocumentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={addCompanyDocument} />
      {selectedDocument && <EditDocumentModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={updateCompanyDocument} document={selectedDocument} />}
      {selectedDocument && <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Excluir Documento" message={`Tem certeza que deseja excluir "${selectedDocument.name}"?`} />}
      
      <style>{`.btn{display:inline-flex;align-items:center;justify-content:center;padding:0.5rem 1rem;border-radius:0.5rem;font-weight:500;transition:background-color 0.2s;}.btn-primary{background-color:rgb(var(--color-primary-600));color:white;}.btn-primary:hover{background-color:rgb(var(--color-primary-700))}.input-style{width:100%;padding:0.625rem;border-radius:0.5rem;border:1px solid #D1D5DB;background-color:#F9FAFB;color:#111827;font-size:0.875rem;}.dark .input-style{background-color:#374151;border-color:#4B5563;color:white;}`}</style>
    </div>
  );
};

export default DocumentsPage;
