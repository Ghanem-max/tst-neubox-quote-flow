
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateCBM, calculateTotalCBM } from '@/assets/js/quote';

interface Package {
  id: string;
  length: number;
  width: number;
  height: number;
  qty: number;
}

interface PackageTableProps {
  packages: Package[];
  onChange: (packages: Package[]) => void;
  className?: string;
}

export const PackageTable: React.FC<PackageTableProps> = ({
  packages,
  onChange,
  className = ''
}) => {
  const { t, isRTL } = useLanguage();

  const addPackage = () => {
    const newPackage: Package = {
      id: Date.now().toString(),
      length: 0,
      width: 0,
      height: 0,
      qty: 1
    };
    onChange([...packages, newPackage]);
  };

  const removePackage = (id: string) => {
    onChange(packages.filter(pkg => pkg.id !== id));
  };

  const updatePackage = (id: string, field: keyof Package, value: number) => {
    onChange(packages.map(pkg => 
      pkg.id === id ? { ...pkg, [field]: value } : pkg
    ));
  };

  const totalCBM = calculateTotalCBM(packages);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border border-border rounded-lg">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className={`px-3 py-2 text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('packages.length')}
              </th>
              <th className={`px-3 py-2 text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('packages.width')}
              </th>
              <th className={`px-3 py-2 text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('packages.height')}
              </th>
              <th className={`px-3 py-2 text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('packages.qty')}
              </th>
              <th className={`px-3 py-2 text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('packages.cbm')}
              </th>
              <th className="px-3 py-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg, index) => {
              const rowCBM = calculateCBM(pkg.length, pkg.width, pkg.height, pkg.qty);
              
              return (
                <tr key={pkg.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={pkg.length || ''}
                      onChange={(e) => updatePackage(pkg.id, 'length', parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={pkg.width || ''}
                      onChange={(e) => updatePackage(pkg.id, 'width', parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={pkg.height || ''}
                      onChange={(e) => updatePackage(pkg.id, 'height', parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min="1"
                      value={pkg.qty || ''}
                      onChange={(e) => updatePackage(pkg.id, 'qty', parseInt(e.target.value) || 1)}
                      className="h-8 text-sm"
                      placeholder="1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-primary">
                      {rowCBM.toFixed(3)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePackage(pkg.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={packages.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPackage}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('packages.addRow')}
        </Button>

        <div className="bg-primary/10 px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">
            {t('packages.totalCbm')}: 
            <span className="text-primary font-bold ml-2">
              {totalCBM.toFixed(3)} CBM
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
