export interface Resume {
    id: string;
    title: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
    about: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    languages?: { language: string; level: string }[];
    certifications?: { name: string; issuer: string; date: string; url?: string }[];
    projects?: {
        name: string;
        description: string;
        url?: string;
        technologies: string[];
        role?: string;
        highlights?: string[];
    }[];
    socialLinks?: {
        github?: string;
        linkedin?: string;
        portfolio?: string;
        twitter?: string;
    };
    preferences?: {
        jobTypes: string[];
        locations: string[];
        remotePreference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
        salaryExpectation?: {
            min: number;
            max: number;
            currency: string;
            period: string;
        };
        industries?: string[];
        companySize?: string[];
    };
    userId: string;
    status: 'searching' | 'paused' | 'not_searching';
}

export interface Experience {
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string;
    location?: string;
    employmentType?: string;
    achievements?: string[];
    technologies?: string[];
    teamSize?: string;
    responsibilities?: string[];
}

export interface Education {
    id: string;
    degree: string;
    school: string;
    year: string;
    field?: string;
    gpa?: string;
    courses?: string[];
    activities?: string[];
    awards?: string[];
    location?: string;
}