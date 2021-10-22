/**
 * Converts Typesaurus data to Firestore format. It deeply traverse all the data and
 * converts values to compatible format.
 *
 * @param data - the data to convert
 */
export declare function unwrapData(data: any): any;
/**
 * Converts Firestore data to Typesaurus format. It deeply traverse all the
 * data and converts values to compatible format.
 *
 * @param consts - the adaptor constants
 * @param data - the data to convert
 */
export declare function wrapData(data: unknown): unknown;
