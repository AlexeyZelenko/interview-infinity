import { defineStore } from 'pinia';

export interface Company {
  id: string;
  name: string;
  description: string;
  location: string;
  industry: string;
  size: string;
  website: string;
  logo?: string;
  subscription: {
    plan: string;
    status: string;
    nextBilling: string;
  };
}

export const useCompanyStore = defineStore('companies', {
  state: () => ({
    companies: [
      {
        id: 'tech-innovators',
        name: 'Tech Innovators Inc.',
        description: 'Leading software development company specializing in AI and machine learning solutions',
        location: 'San Francisco, CA',
        industry: 'Technology',
        size: '50-200 employees',
        website: 'techinnovators.com',
        subscription: {
          plan: 'business',
          status: 'active',
          nextBilling: '2024-03-15'
        }
      },
      {
        id: 'digital-dynamics',
        name: 'Digital Dynamics',
        description: 'Full-service digital agency delivering cutting-edge web and mobile solutions',
        location: 'New York, NY',
        industry: 'Digital Agency',
        size: '10-50 employees',
        website: 'digitaldynamics.io',
        subscription: {
          plan: 'pro',
          status: 'active',
          nextBilling: '2024-03-20'
        }
      }
    ]
  })
});