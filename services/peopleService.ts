import { db } from "../firebase";
import { collection, onSnapshot, getDocs, doc, setDoc } from "firebase/firestore";
import { Person, INITIAL_PEOPLE } from "../types";

const COLLECTION_NAME = "people";

// One-time initialization function (can be called if collection is empty or missing people)
export const initializePeople = async () => {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const existingIds = new Set(querySnapshot.docs.map(doc => doc.id));
    const missingPeople = INITIAL_PEOPLE.some(p => !existingIds.has(p.id));

    if (querySnapshot.empty || missingPeople) {
        console.log("Initializing/Updating people collection...");
        await seedPeople();
    }
};

export const seedPeople = async () => {
    const batchPromises = INITIAL_PEOPLE.map((person) =>
        setDoc(doc(db, COLLECTION_NAME, person.id), person)
    );
    await Promise.all(batchPromises);
    console.log("People seeded.");
};

export const subscribeToPeople = (callback: (people: Person[]) => void, onError?: (error: any) => void) => {
    return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
        const people = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() } as Person));
        // Sort safely in case IDs are numeric strings
        people.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
        callback(people);
    }, (error) => {
        console.error("Error subscribing to people:", error);
        if (onError) onError(error);
    });
};
