import { Expense, Person, Settlement } from "../types";

export const calculateSettlements = (expenses: Expense[], people: Person[]): Settlement[] => {
  const balances: Record<string, number> = {};

  // Initialize balances
  people.forEach(p => balances[p.id] = 0);

  // Calculate net balances
  expenses.forEach(expense => {
    const payerId = expense.payerId;
    const amount = expense.amount;
    
    // Who is splitting this?
    const splitAmongIds = expense.sharedBy.length > 0 
      ? expense.sharedBy 
      : people.map(p => p.id); // All if empty

    const splitAmount = amount / splitAmongIds.length;

    // Payer gets positive balance (they are owed)
    if (balances[payerId] !== undefined) {
      balances[payerId] += amount;
    }

    // Consumers get negative balance (they owe)
    splitAmongIds.forEach(id => {
      if (balances[id] !== undefined) {
        balances[id] -= splitAmount;
      }
    });
  });

  // Separate into debtors and creditors
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  Object.entries(balances).forEach(([id, amount]) => {
    // Floating point correction
    const val = Math.round(amount * 100) / 100;
    if (val < -0.01) debtors.push({ id, amount: val });
    if (val > 0.01) creditors.push({ id, amount: val });
  });

  // Sort by magnitude to minimize transactions (Greedy approach)
  debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
  creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

  const settlements: Settlement[] = [];
  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // The amount to settle is the minimum of what debtor owes and creditor is owed
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

    if (amount > 0) {
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(amount * 100) / 100
      });
    }

    // Adjust remaining balances
    debtor.amount += amount;
    creditor.amount -= amount;

    // Move indices if settled
    if (Math.abs(debtor.amount) < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
};

export const getPersonBalance = (personId: string, expenses: Expense[], allPeopleIds: string[]): number => {
    let balance = 0;
    expenses.forEach(expense => {
        if (expense.payerId === personId) {
            balance += expense.amount;
        }
        const splitIds = expense.sharedBy.length > 0 ? expense.sharedBy : allPeopleIds;
        if (splitIds.includes(personId)) {
            balance -= (expense.amount / splitIds.length);
        }
    });
    return balance;
}