import Papa from 'papaparse';

export interface TiendaNubeCSVRow {
  'Identificador de URL': string;
  'Nombre': string;
  'Categorías': string;
  'Nombre de propiedad 1': string;
  'Valor de propiedad 1': string;
  'Nombre de propiedad 2': string;
  'Valor de propiedad 2': string;
  'Nombre de propiedad 3': string;
  'Valor de propiedad 3': string;
  'Precio': string;
  'Precio promocional': string;
  'Peso (kg)': string;
  'Alto (cm)': string;
  'Ancho (cm)': string;
  'Profundidad (cm)': string;
  'Stock': string;
  'SKU': string;
  'Código de barras': string;
  'Mostrar en tienda': string;
  'Envío sin cargo': string;
  'Descripción': string;
  'Tags': string;
  'Título para SEO': string;
  'Descripción para SEO': string;
  'Marca': string;
  'Producto Físico': string;
  'MPN (Número de pieza del fabricante)': string;
  'Sexo': string;
  'Rango de edad': string;
  'Costo': string;
}

export function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  // Formato: 5.900,00 -> 5900.00
  return parseFloat(priceStr.replace(/\./g, '').replace(',', '.'));
}

export async function parseTiendaNubeCSV(file: File): Promise<TiendaNubeCSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<TiendaNubeCSVRow>(file, {
      header: true,
      delimiter: ';',
      encoding: 'ISO-8859-1', // ANSI encoding
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${JSON.stringify(results.errors)}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}