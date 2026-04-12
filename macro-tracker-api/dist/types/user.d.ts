export declare class User {
    id: number;
    username: string;
    emailAddress: string | undefined;
    constructor(id: number, username: string);
    setEmailAddress(emailAddress: string): void;
    getEmailAddress(): string | undefined;
    static fromJson(json: string): User;
    toJson(): string;
}
//# sourceMappingURL=user.d.ts.map