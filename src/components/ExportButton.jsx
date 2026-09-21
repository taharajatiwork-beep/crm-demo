import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import Button from '../ui/Button';

/**
 * ExportButton — Excel export for CRM data
 *
 * Props:
 *   data       — array of objects to export
 *   columns    — [{ key, header }] mapping object keys to column titles
 *   filename   — base name for the downloaded file (default: 'export')
 *   variant    — Button variant (default: 'secondary')
 *   size       — Button size (default: 'sm')
 *   className  — extra Tailwind classes
 *   label      — button text override (default: 'خروجی اکسل')
 */
export default function ExportButton({
  data = [],
  columns = [],
  filename = 'export',
  variant = 'secondary',
  size = 'sm',
  className = '',
  label = 'خروجی اکسل',
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!data.length) return;
    setExporting(true);

    try {
      // Small delay so the spinner is visible
      await new Promise((r) => setTimeout(r, 300));

      // Build the rows using column definitions
      const rows = data.map((row) => {
        const obj = {};
        columns.forEach((col) => {
          const val = row?.[col.key];
          // Handle arrays (e.g. tags) by joining
          obj[col.header] = Array.isArray(val) ? val.join('، ') : val ?? '';
        });
        return obj;
      });

      const ws = XLSX.utils.json_to_sheet(rows);

      // Right-to-left: set sheet direction
      ws['!cols'] = columns.map(() => ({ wch: 20 }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filename);

      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `${filename}_${today}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      icon={exporting ? undefined : FileSpreadsheet}
      loading={exporting}
      disabled={!data.length}
      onClick={handleExport}
      className={className}
    >
      {label}
    </Button>
  );
}
