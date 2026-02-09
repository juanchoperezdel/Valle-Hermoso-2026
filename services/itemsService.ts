import { db } from "../firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, writeBatch } from "firebase/firestore";
import { Item, INITIAL_ITEMS } from "../types";

const COLLECTION_NAME = "items";

export const initializeItems = async () => {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    if (querySnapshot.empty) {
        console.log("Initializing items collection...");
        await seedItems();
    }
}

export const seedItems = async () => {
    const batch = writeBatch(db);
    INITIAL_ITEMS.forEach((item) => {
        const docRef = doc(db, COLLECTION_NAME, item.id);
        // Ensure no undefined values
        const cleanItem = JSON.parse(JSON.stringify(item));
        batch.set(docRef, cleanItem);
    });
    await batch.commit();
    console.log("Items seeded.");
};

export const subscribeToItems = (callback: (items: Item[]) => void, onError?: (error: any) => void) => {
    return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Item));
        callback(items);
    }, (error) => {
        console.error("Error subscribing to items:", error);
        if (onError) onError(error);
    });
};

export const addItem = async (item: Omit<Item, 'id'>) => {
    await addDoc(collection(db, COLLECTION_NAME), item);
};

export const updateItem = async (id: string, updates: Partial<Item>) => {
    await updateDoc(doc(db, COLLECTION_NAME, id), updates);
};

export const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
};
