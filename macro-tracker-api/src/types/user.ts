export class User {
  public id: number;
  public username: string;
  public emailAddress: string | undefined;

  public constructor(id: number, username: string) {
    this.id = id;
    this.username = username;
  }

  public setEmailAddress(emailAddress: string) {
    this.emailAddress = emailAddress;
  }

  public getEmailAddress(): string | undefined {
    return this.emailAddress;
  }

  public static fromJson(json: string): User {
    const data = JSON.parse(json);

    const user = new User(data.id, data.username);
    user.setEmailAddress(data.emailAddress);

    return user;
  }

  public toJson(): string {
    return JSON.stringify(this);
  }
}