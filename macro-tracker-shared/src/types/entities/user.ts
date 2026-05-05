export class User {
  public readonly id: number;
  public readonly username: string;
  public readonly emailAddress: string | undefined;

  constructor(id: number, username: string, emailAddress?: string) {
    this.id = id;
    this.username = username;
    this.emailAddress = emailAddress;
  }

  static fromModel(id: number, username: string): User {
    return new User(id, username);
  }

  static fromJson(data: any): User {
    if (
      data == null ||
      typeof data !== "object" ||
      !("id" in data) ||
      !("username" in data)
    ) {
      throw new Error("Invalid user data");
    }

    return new User(data.id, data.username);
  }

  toJSON(): { id: string; username: string } {
    return { id: String(this.id), username: this.username };
  }
}
