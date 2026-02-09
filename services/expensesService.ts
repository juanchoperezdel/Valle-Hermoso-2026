import { db } from "../firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Expense } from "../types";

const COLLECTION_NAME = "expenses";

export const subscribeToExpenses = (callback: (expenses: Expense[]) => void, onError?: (error: any) => void) => {
    return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
        const expenses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Expense));
        callback(expenses);
    }, (error) => {
        console.error("Error subscribing to expenses:", error);
        if (onError) onError(error);
    });
};

export const addExpense = async (expense: Omit<Expense, 'id'>) => {
    await addDoc(collection(db, COLLECTION_NAME), expense);
};

export const deleteExpense = async (id: string) => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
};
