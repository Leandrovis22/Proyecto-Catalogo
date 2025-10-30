'use client';

import { useState } from 'react';

interface Variant {
  id: number;
  property1Name?: string;
  property1Value?: string;
  property2Name?: string;
  property2Value?: string;
  property3Name?: string;
  property3Value?: string;
  price?: number;
  stock: number;
  sku: string;
}

interface VariantSelectorProps {
  variants: Variant[];
  onVariantChange: (variant: Variant) => void;
}

export default function VariantSelector({ variants, onVariantChange }: VariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(variants[0] || null);

  // Agrupar variantes por propiedades
  const properties: { [key: string]: Set<string> } = {};

  variants.forEach((variant) => {
    if (variant.property1Name && variant.property1Value) {
      if (!properties[variant.property1Name]) {
        properties[variant.property1Name] = new Set();
      }
      properties[variant.property1Name].add(variant.property1Value);
    }
    if (variant.property2Name && variant.property2Value) {
      if (!properties[variant.property2Name]) {
        properties[variant.property2Name] = new Set();
      }
      properties[variant.property2Name].add(variant.property2Value);
    }
    if (variant.property3Name && variant.property3Value) {
      if (!properties[variant.property3Name]) {
        properties[variant.property3Name] = new Set();
      }
      properties[variant.property3Name].add(variant.property3Value);
    }
  });

  const handleVariantSelect = (propertyName: string, value: string) => {
    const variant = variants.find((v) =>
      v[propertyName as keyof Variant] === value &&
      (!selectedVariant || v.id !== selectedVariant.id)
    );
    if (variant) {
      setSelectedVariant(variant);
      onVariantChange(variant);
    }
  };

  if (variants.length === 0) return null;

  return (
    <div className="space-y-4">
      {Object.entries(properties).map(([propertyName, values]) => (
        <div key={propertyName} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{propertyName}</h4>
          <div className="flex flex-wrap gap-2">
            {[...values].map((value) => (
              <button
                key={value}
                onClick={() => handleVariantSelect(propertyName, value)}
                className={`px-3 py-1.5 border rounded-md text-sm ${
                  selectedVariant && selectedVariant[propertyName as keyof Variant] === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}