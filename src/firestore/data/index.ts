import {
  increment,
  deleteField,
  arrayRemove,
  arrayUnion,
  serverTimestamp,
  Timestamp,
  DocumentReference,
} from 'firebase/firestore/lite';

import { pathToRef, Ref, refToFirestoreDocument } from '../ref';
import { UpdateValue } from '../value';

/**
 * Converts Typesaurus data to Firestore format. It deeply traverse all the data and
 * converts values to compatible format.
 *
 * @param data - the data to convert
 */
export function unwrapData(data: any): any {
  if (data && typeof data === 'object') {
    if (data.__type__ === 'ref') {
      return refToFirestoreDocument(data as Ref<any>);
    } else if (data.__type__ === 'value') {
      const fieldValue = data as UpdateValue<any>;

      switch (fieldValue.kind) {
        case 'remove':
          return deleteField();
        case 'increment':
          return increment(fieldValue.number);
        case 'arrayUnion':
          return arrayUnion(...unwrapData(fieldValue.values));
        case 'arrayRemove':
          return arrayRemove(...unwrapData(fieldValue.values));
        case 'serverDate':
          return serverTimestamp();
      }
    } else if (data instanceof Date) {
      return Timestamp.fromDate(data);
    }

    const unwrappedObject: { [key: string]: any } = Object.assign(
      Array.isArray(data) ? [] : {},
      data,
    );
    Object.keys(unwrappedObject).forEach((key) => {
      unwrappedObject[key] = unwrapData(unwrappedObject[key]);
    });
    return unwrappedObject;
  } else if (data === undefined) {
    return null;
  } else {
    return data;
  }
}

/**
 * Converts Firestore data to Typesaurus format. It deeply traverse all the
 * data and converts values to compatible format.
 *
 * @param consts - the adaptor constants
 * @param data - the data to convert
 */
export function wrapData(data: unknown) {
  if (data instanceof DocumentReference) {
    return pathToRef(data.path);
  } else if (data instanceof Timestamp) {
    return data.toDate();
  } else if (data && typeof data === 'object') {
    const wrappedData: { [key: string]: any } = Object.assign(
      Array.isArray(data) ? [] : {},
      data,
    );
    Object.keys(wrappedData).forEach((key) => {
      wrappedData[key] = wrapData(wrappedData[key]);
    });
    return wrappedData;
  } else {
    return data;
  }
}
