export class User {
    id;
    username;
    emailAddress;
    constructor(id, username) {
        this.id = id;
        this.username = username;
    }
    setEmailAddress(emailAddress) {
        this.emailAddress = emailAddress;
    }
    getEmailAddress() {
        return this.emailAddress;
    }
    static fromJson(json) {
        const data = JSON.parse(json);
        const user = new User(data.id, data.username);
        user.setEmailAddress(data.emailAddress);
        return user;
    }
    toJson() {
        return JSON.stringify(this);
    }
}
//# sourceMappingURL=user.js.map