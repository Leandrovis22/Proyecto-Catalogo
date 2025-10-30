// Parser base para CSV TiendaNube con Papa Parse
import Papa from 'papaparse';

export function parseTiendaNubeCSV(csvString: string) {
  return Papa.parse(csvString, {
    delimiter: ';',
    header: true,
    skipEmptyLines: true,
    encoding: 'ANSI'
  });
}
