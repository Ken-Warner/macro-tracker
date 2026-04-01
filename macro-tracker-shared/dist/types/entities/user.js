/** Authenticated user entity; safe to use on client and server. */
export class User {
    id;
    username;
    constructor(id, username) {
        this.id = id;
        this.username = username;
    }
    static fromLoginRow(row) {
        return new User(row.id, row.username);
    }
    /** Shape used by login / create session responses (`userId` as string). */
    toJSON() {
        return { userId: String(this.id), username: this.username };
    }
}
//# sourceMappingURL=user.js.map