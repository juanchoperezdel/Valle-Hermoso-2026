import { db } from "../firebase";
import { collection, writeBatch, doc, getDocs } from "firebase/firestore";
import { Item, Person, Expense } from "../types";

export const migrateFromLocalStorage = async () => {
    const batch = writeBatch(db);
    let count = 0;

    // Migrate People
    const savedPeople = localStorage.getItem('ts_people');
    if (savedPeople) {
        const people: Person[] = JSON.parse(savedPeople);
        people.forEach(p => {
            const ref = doc(db, 'people', p.id);
            batch.set(ref, p);
            count++;
        });
    }

    // Migrate Items
    const savedItems = localStorage.getItem('ts_items');
    if (savedItems) {
        const items: Item[] = JSON.parse(savedItems);
        items.forEach(i => {
            // Clean undefined values
            const cleanItem = JSON.parse(JSON.stringify(i));
            const ref = doc(db, 'items', i.id);
            batch.set(ref, cleanItem);
            count++;
        });
    }

    // Migrate Expenses
    const savedExpenses = localStorage.getItem('ts_expenses');
    if (savedExpenses) {
        const expenses: Expense[] = JSON.parse(savedExpenses);
        expenses.forEach(e => {
            const cleanExpense = JSON.parse(JSON.stringify(e));
            const ref = doc(db, 'expenses', e.id);
            batch.set(ref, cleanExpense);
            count++;
        });
    }

    if (count > 0) {
        await batch.commit();
        console.log(`Migrated ${count} documents.`);
        return count;
    } else {
        console.log("No local data found to migrate.");
        return 0;
    }
};
