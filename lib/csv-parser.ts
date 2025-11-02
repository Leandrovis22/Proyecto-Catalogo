import Papa from 'papaparse';

export interface TiendaNubeRow {
  'Identificador de URL': string;
  Nombre: string;
  Categorías: string;
  'Nombre de propiedad 1'?: string;
  'Valor de propiedad 1'?: string;
  'Nombre de propiedad 2'?: string;
  'Valor de propiedad 2'?: string;
  Precio: string;
  Stock: string;
}

export interface ParsedProduct {
  slug: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  variantName?: string;
  variantValue?: string;
}

/**
 * Parsea un archivo CSV de TiendaNube con encoding ANSI y delimiter ;
 * Agrupa productos por slug y maneja variantes
 */
export async function parseTiendaNubeCSV(
  fileContent: string
): Promise<{ products: ParsedProduct[]; errors: string[] }> {
  const errors: string[] = [];
  const products: ParsedProduct[] = [];

  return new Promise((resolve) => {
    Papa.parse<TiendaNubeRow>(fileContent, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      encoding: 'ANSI',
      complete: (results) => {
        // Agrupar filas por slug
        const productMap = new Map<string, TiendaNubeRow[]>();

        results.data.forEach((row, index) => {
          const slug = row['Identificador de URL']?.trim();

          if (!slug) {
            errors.push(`Fila ${index + 2}: Falta 'Identificador de URL'`);
            return;
          }

          if (!productMap.has(slug)) {
            productMap.set(slug, []);
          }
          productMap.get(slug)!.push(row);
        });

        // Procesar cada producto
        productMap.forEach((rows, slug) => {
          const baseRow = rows[0]; // Primera fila = producto base

          // Validar campos requeridos
          if (!baseRow.Nombre?.trim()) {
            errors.push(`Producto "${slug}": Falta nombre`);
            return;
          }

          if (!baseRow.Categorías?.trim()) {
            errors.push(`Producto "${slug}": Falta categoría`);
            return;
          }

          // Procesar cada variante (o producto simple si solo hay 1 fila)
          rows.forEach((row, variantIndex) => {
            try {
              // Parsear precio (puede venir como "2,400.00" o "2400.00")
              const priceStr = row.Precio?.trim().replace(',', '');
              const price = parseFloat(priceStr);

              if (isNaN(price) || price < 0) {
                errors.push(
                  `Producto "${slug}" variante ${variantIndex + 1}: Precio inválido "${row.Precio}"`
                );
                return;
              }

              // Parsear stock
              const stock = parseInt(row.Stock?.trim() || '0', 10);
              if (isNaN(stock) || stock < 0) {
                errors.push(
                  `Producto "${slug}" variante ${variantIndex + 1}: Stock inválido "${row.Stock}"`
                );
                return;
              }

              // Determinar nombre y valor de variante
              let variantName: string | undefined;
              let variantValue: string | undefined;

              // Si es la primera fila Y tiene propiedades, o si es fila secundaria
              if (row['Nombre de propiedad 1']?.trim()) {
                variantName = row['Nombre de propiedad 1'].trim();
                variantValue = row['Valor de propiedad 1']?.trim();
              } else if (row['Nombre de propiedad 2']?.trim()) {
                variantName = row['Nombre de propiedad 2'].trim();
                variantValue = row['Valor de propiedad 2']?.trim();
              }

              products.push({
                slug,
                name: baseRow.Nombre.trim(),
                category: baseRow.Categorías.trim(),
                price,
                stock,
                variantName,
                variantValue,
              });
            } catch (error) {
              errors.push(
                `Producto "${slug}" variante ${variantIndex + 1}: Error al procesar - ${error}`
              );
            }
          });
        });

        resolve({ products, errors });
      },
      error: (error: Error) => {
        errors.push(`Error al parsear CSV: ${error.message}`);
        resolve({ products, errors });
      },
    });
  });
}

/**
 * Convierte un string a ANSI/Windows-1252 para parseo correcto
 */
export function convertToANSI(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder('windows-1252');
  return decoder.decode(buffer);
}
