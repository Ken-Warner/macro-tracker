/** Authenticated user entity; safe to use on client and server. */
export declare class User {
    readonly id: number;
    readonly username: string;
    constructor(id: number, username: string);
    static fromLoginRow(row: {
        id: number;
        username: string;
    }): User;
    /** Shape used by login / create session responses (`userId` as string). */
    toJSON(): {
        userId: string;
        username: string;
    };
}
//# sourceMappingURL=user.d.ts.map