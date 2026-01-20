
export const ExportService = {
  saveAndOpenFile: async (base64: string, filename: string, mimeType: string) => {
      const link = document.createElement('a');
      link.href = `data:${mimeType};base64,${base64}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  },

  // Legacy support for VehicleDetailView
  exportToCSV: async (data: any[], headers: string[], filename: string) => {
      const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(fieldName => {
              const val = row[fieldName] || '';
              // Escape quotes and wrap in quotes
              return `"${String(val).replace(/"/g, '""')}"`; 
          }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }
};
