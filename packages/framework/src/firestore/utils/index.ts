import { DocumentSnapshot, getDoc, DocumentReference } from 'firebase/firestore';

export function getDocMeta(snapshot: DocumentSnapshot) {
  return {
    fromCache: snapshot.metadata.fromCache,
    hasPendingWrites: snapshot.metadata.hasPendingWrites,
  };
}

export function getAll(...docs: DocumentReference[]) {
  return Promise.all(docs.map((doc) => getDoc(doc)));
}
