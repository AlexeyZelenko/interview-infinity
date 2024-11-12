export interface Subscription {
    plan: string;
    status: 'active' | 'expired';
    startDate: string;
    endDate: string;
}

export interface User {
    uid: string;
    email: string;
    userType: 'developer' | 'company' | 'admin';
    displayName?: string;
    createdAt: string;
    subscription: Subscription;
}