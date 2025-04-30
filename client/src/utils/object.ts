export const removeNullsDeep = <T extends Record<string, any>>(obj: T): Partial<T> => {
    for (let key in obj) {
        if (obj[key] === null) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          removeNullsDeep(obj[key]);
        }
      }
    return obj;
}