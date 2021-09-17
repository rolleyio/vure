import { getDoc, DocumentReference } from 'firebase/firestore';

export function getAll(...docs: DocumentReference[]) {
  return Promise.all(docs.map((doc) => getDoc(doc)));
}
