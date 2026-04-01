/** Authenticated user entity; safe to use on client and server. */
export class User {
  constructor(
    public readonly id: number,
    public readonly username: string,
  ) {}

  static fromLoginRow(row: { id: number; username: string }): User {
    return new User(row.id, row.username);
  }

  /** Shape used by login / create session responses (`userId` as string). */
  toJSON(): { userId: string; username: string } {
    return { userId: String(this.id), username: this.username };
  }
}
