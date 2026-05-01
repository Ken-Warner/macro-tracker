export class InvalidPropertyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPropertyException";
  }
}
