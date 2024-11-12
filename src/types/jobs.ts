export interface Job {
    id: string;
    title: string;
    company: string;
    companyId: string;
    location: string;
    type: string;
    salary: Salary;
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    skills: string[];
    postedAt: string;
    remote: boolean;
    experience?: string;
    tests?: JobTest[];
    companyInfo?: {
        industry: string;
        size: string;
        description: string;
        logo: string;
    };
}

export interface JobTest {
    id: string;
    testId: string;
    title: string;
    description: string;
    duration: number;
    isRequired: boolean;
}

export interface Salary {
    min: number;
    max: number;
    currency: string;
    period: string;
}