export class CommonUtils {
  static isEmpty(obj: any): boolean {
    return (
      [Object, Array].includes((obj || {}).constructor) &&
      !Object.entries(obj || {}).length
    );
  }

  static isNullOrUndefined(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    return false;
  }

  static isDefined(value: unknown): boolean {
    return !CommonUtils.isNullOrUndefined(value);
  }

  static hasContent(obj: unknown): boolean {
    return !this.isEmpty(obj);
  }

  static isNullishOrEmpty(value: unknown) {
    return this.isNullOrUndefined(value) || this.isEmpty(value);
  }

  // static hydrateObject<T, U>(
  //   object: T,
  //   prop: string,
  //   value: U
  // ): (T & { [key: string]: U }) | T {
  //   if (this.isDefined(value)) {
  //     object[prop] = value;
  //   }
  //   return object;
  // }
}
