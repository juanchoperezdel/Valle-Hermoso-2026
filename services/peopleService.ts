import { db } from "../firebase";
import { collection, onSnapshot, getDocs, doc, setDoc } from "firebase/firestore";
import { Person, INITIAL_PEOPLE } from "../types";

const COLLECTION_NAME = "people";

// One-time initialization function (can be called if collection is empty)
export const initializePeople = async () => {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    if (querySnapshot.empty || querySnapshot.size < INITIAL_PEOPLE.length) {
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
            .map((doc) => ({ id: doc.id, ...doc.data() } as Person))
            .filter(p => p.name !== 'Trapo'); // Hard filter to remove Trapo
        // Sort safely in case IDs are numeric strings
        people.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
        callback(people);
    }, (error) => {
        console.error("Error subscribing to people:", error);
        if (onError) onError(error);
    });
};
