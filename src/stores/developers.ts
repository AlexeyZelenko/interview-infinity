import { defineStore } from 'pinia';

export interface Developer {
  id: string;
  name: string;
  title: string;
  location: string;
  bio: string;
  experience: string;
  status: 'searching' | 'paused' | 'not_searching';
  technologies: string[];
  github?: string;
  linkedin?: string;
  website?: string;
  avatar?: string;
  subscription: {
    plan: string;
    status: string;
    nextBilling: string;
  };
  testResults: {
    testId: string;
    score: number;
    completedAt: string;
  }[];
}

export const useDeveloperStore = defineStore('developers', {
  state: () => ({
    developers: [
      {
        id: 'sarah-chen',
        name: 'Sarah Chen',
        title: 'Senior Full Stack Developer',
        location: 'Seattle, WA',
        bio: 'Full stack developer with 6 years of experience specializing in Vue.js and Node.js',
        experience: '6 years',
        status: 'searching',
        technologies: ['Vue.js', 'Node.js', 'TypeScript', 'MongoDB', 'Docker'],
        github: 'github.com/sarahchen',
        linkedin: 'linkedin.com/in/sarahchen',
        subscription: {
          plan: 'pro',
          status: 'active',
          nextBilling: '2024-03-10'
        },
        testResults: [
          { testId: 'vue-test', score: 95, completedAt: '2024-02-01' },
          { testId: 'node-test', score: 88, completedAt: '2024-02-05' }
        ]
      },
      {
        id: 'marcus-rodriguez',
        name: 'Marcus Rodriguez',
        title: 'Frontend Developer',
        location: 'Miami, FL',
        bio: 'React specialist with a passion for creating beautiful user interfaces',
        experience: '3 years',
        status: 'searching',
        technologies: ['React', 'JavaScript', 'Tailwind CSS', 'Redux'],
        github: 'github.com/marcusdev',
        subscription: {
          plan: 'basic',
          status: 'active',
          nextBilling: '2024-03-15'
        },
        testResults: [
          { testId: 'react-test', score: 92, completedAt: '2024-02-10' },
          { testId: 'js-test', score: 85, completedAt: '2024-02-12' }
        ]
      },
      {
        id: 'emily-parker',
        name: 'Emily Parker',
        title: 'Backend Developer',
        location: 'London, UK',
        bio: 'Backend developer focused on building scalable applications',
        experience: '4 years',
        status: 'paused',
        technologies: ['Laravel', 'PHP', 'MySQL', 'Redis', 'AWS'],
        linkedin: 'linkedin.com/in/emilyparker',
        subscription: {
          plan: 'basic',
          status: 'active',
          nextBilling: '2024-03-20'
        },
        testResults: [
          { testId: 'laravel-test', score: 90, completedAt: '2024-01-25' }
        ]
      },
      {
        id: 'alex-kumar',
        name: 'Alex Kumar',
        title: 'Full Stack Developer',
        location: 'Toronto, Canada',
        bio: 'Full stack developer with expertise in MERN stack',
        experience: '5 years',
        status: 'not_searching',
        technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
        github: 'github.com/alexkumar',
        linkedin: 'linkedin.com/in/alexkumar',
        subscription: {
          plan: 'pro',
          status: 'active',
          nextBilling: '2024-03-25'
        },
        testResults: [
          { testId: 'react-test', score: 88, completedAt: '2024-01-15' },
          { testId: 'node-test', score: 94, completedAt: '2024-01-20' }
        ]
      },
      {
        id: 'julia-novak',
        name: 'Julia Novak',
        title: 'Frontend Developer',
        location: 'Berlin, Germany',
        bio: 'Frontend specialist with a focus on Vue.js and modern JavaScript',
        experience: '2 years',
        status: 'searching',
        technologies: ['Vue.js', 'JavaScript', 'Sass', 'Webpack'],
        github: 'github.com/julianovak',
        subscription: {
          plan: 'basic',
          status: 'active',
          nextBilling: '2024-03-30'
        },
        testResults: [
          { testId: 'vue-test', score: 85, completedAt: '2024-02-15' },
          { testId: 'js-test', score: 82, completedAt: '2024-02-18' }
        ]
      }
    ]
  })
});