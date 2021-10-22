import { DocumentSnapshot, DocumentReference } from 'firebase/firestore';
export declare function getDocMeta(snapshot: DocumentSnapshot): {
    fromCache: boolean;
    hasPendingWrites: boolean;
};
export declare function getAll(...docs: DocumentReference[]): Promise<DocumentSnapshot<import("firebase/firestore").DocumentData>[]>;
