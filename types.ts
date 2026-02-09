export interface Person {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  totalQuantity: number; // How many are needed in total
  assignedTo: Record<string, number>; // Map of personId -> quantity they are bringing
  isPacked: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  payerId: string;
  sharedBy: string[]; // List of person IDs. If empty, assumed shared by all.
  date: number;
}

export interface Settlement {
  from: string; // Person ID
  to: string;   // Person ID
  amount: number;
}

// Initial Data Constants for the Demo
export const INITIAL_PEOPLE: Person[] = [
  { id: '1', name: 'Juancho' },
  { id: '2', name: 'Lucas' },
  { id: '3', name: 'Biaggio' },
  { id: '4', name: 'Rulo' },
  { id: '5', name: 'Peñas' },
  { id: '6', name: 'Peter' },
  { id: '7', name: 'Santi' },
  { id: '8', name: 'Trapo' },
];

export const INITIAL_ITEMS: Item[] = [
  { id: '101', name: 'Heladerita varias para carne', totalQuantity: 2, assignedTo: { '3': 1, '4': 1 }, isPacked: false }, // Biaggio, Rulo
  { id: '102', name: 'Hielo', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '103', name: 'Anafe', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '104', name: 'Carpas', totalQuantity: 2, assignedTo: {}, isPacked: false },
  { id: '105', name: 'Bolsas de dormir', totalQuantity: 8, assignedTo: {}, isPacked: false },
  { id: '106', name: 'Colchón inflable', totalQuantity: 2, assignedTo: {}, isPacked: false }, // "si entran"
  { id: '107', name: 'Reposeras', totalQuantity: 6, assignedTo: { '4': 2, '3': 2, '1': 2 }, isPacked: false }, // Rulo x2, Biaggio x2, Juancho x2
  { id: '108', name: 'Mesa', totalQuantity: 1, assignedTo: { '3': 1 }, isPacked: false }, // Biaggio
  { id: '109', name: 'Sacacorcho', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '110', name: 'Encendedor / Fósforos', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '111', name: 'Parrilla + palita', totalQuantity: 1, assignedTo: { '4': 1 }, isPacked: false }, // Rulo
  { id: '112', name: 'Disco', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '113', name: 'Leña mucha', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '114', name: 'Carne', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '115', name: 'Bebidas', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '116', name: 'Papel higiénico', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '117', name: 'Desayuno', totalQuantity: 3, assignedTo: {}, isPacked: false },
  { id: '118', name: 'Almuerzos', totalQuantity: 3, assignedTo: {}, isPacked: false },
  { id: '119', name: 'Cenas', totalQuantity: 2, assignedTo: {}, isPacked: false },
  { id: '120', name: 'Media tarde', totalQuantity: 3, assignedTo: {}, isPacked: false },
  { id: '121', name: 'Lámparas / Linterna', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '122', name: 'Abrigo', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '123', name: 'Malla para la laguna', totalQuantity: 1, assignedTo: {}, isPacked: false },
  { id: '124', name: 'Mucha agua', totalQuantity: 1, assignedTo: {}, isPacked: false },
];