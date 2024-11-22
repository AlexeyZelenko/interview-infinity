export interface JobApplication {
    id?: string;
    jobId: string;
    userId: string;
    companyId: string;
    appliedAt: string;
    status: JobApplicationStatus;
    applicantName?: string;
    applicantEmail?: string;
    coverLetter?: string;
    resume?: string;
    resumeId?: string;
    matchScore?: number | null;
}

export enum JobApplicationStatus {
    Pending = 'pending',
    Reviewing = 'reviewing',
    Interviewing = 'interviewing',
    Rejected = 'rejected',
    Hired = 'hired',
    None = ''
}