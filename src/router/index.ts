import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebase/config';
import { useAuthStore } from '../stores/auth';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue')
    },
    {
        path: '/jobs',
        name: 'Jobs',
        component: () => import('../views/Jobs.vue')
    },
    {
        path: '/jobs/:id',
        name: 'JobDetails',
        component: () => import('../views/JobDetails.vue')
    },
    {
        path: '/developers',
        name: 'Developers',
        component: () => import('../views/Developers.vue')
    },
    {
        path: '/developers/:id',
        name: 'DeveloperProfile',
        component: () => import('../views/DeveloperProfile.vue')
    },
    {
        path: '/pricing',
        name: 'Pricing',
        component: () => import('../views/Pricing.vue')
    },
    {
        path: '/tests',
        name: 'Tests',
        component: () => import('../views/Tests.vue')
    },
    {
        path: '/test/:id',
        name: 'TestTaking',
        component: () => import('../views/TestTaking.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/test/:id/review',
        name: 'TestReview',
        component: () => import('../views/account/TestReview.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/community',
        name: 'Community',
        component: () => import('../views/Community.vue')
    },
    // Admin Routes
    {
        path: '/admin',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboard.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    // Profile redirect
    {
        path: '/profile',
        name: 'Profile',
        redirect: to => {
            const authStore = useAuthStore();
            if (authStore.isAdmin) return '/admin';
            return authStore.isDeveloper ? '/developer' : '/company';
        },
        meta: { requiresAuth: true }
    },
    // Developer Account Routes
    {
        path: '/developer',
        component: () => import('../layouts/DeveloperLayout.vue'),
        meta: { requiresAuth: true, requiresType: 'developer' },
        children: [
            {
                path: '',
                redirect: '/developer/saved-jobs'
            },
            {
                path: 'saved-jobs',
                name: 'DeveloperSavedJobs',
                component: () => import('../views/account/SavedJobs.vue')
            },
            {
                path: 'resume',
                name: 'DeveloperResume',
                component: () => import('../views/account/Resume.vue')
            },
            {
                path: 'test-results',
                name: 'DeveloperTestResults',
                component: () => import('../views/account/TestResults.vue')
            },
            {
                path: 'subscription',
                name: 'DeveloperSubscription',
                component: () => import('../views/account/Subscription.vue')
            }
        ]
    },
    // Company Account Routes
    {
        path: '/company',
        component: () => import('../layouts/CompanyLayout.vue'),
        meta: { requiresAuth: true, requiresType: 'company' },
        children: [
            {
                path: '',
                redirect: '/company/jobs'
            },
            {
                path: 'jobs',
                name: 'CompanyJobs',
                component: () => import('../views/account/CompanyJobs.vue')
            },
            {
                path: 'jobs-create',
                name: 'CreateJob',
                component: () => import('../views/account/CreateJob.vue')
            },
            {
                path: 'jobs/:id/edit',
                name: 'EditJob',
                component: () => import('../views/account/EditJob.vue')
            },
            {
                path: 'jobs/:id/applicants',
                name: 'JobApplicants',
                component: () => import('../views/account/JobApplicants.vue')
            },
            {
                path: 'saved-developers',
                name: 'CompanySavedDevelopers',
                component: () => import('../views/account/SavedDevelopers.vue')
            },
            {
                path: 'tests',
                name: 'CompanyTests',
                component: () => import('../views/account/CompanyTests.vue')
            },
            {
                path: 'create-test',
                name: 'CreateTest',
                component: () => import('../views/account/CreateTest.vue')
            },
            {
                path: 'profile',
                name: 'CompanyProfile',
                component: () => import('../views/account/CompanyProfile.vue')
            },
            {
                path: 'subscription',
                name: 'CompanySubscription',
                component: () => import('../views/account/Subscription.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0 };
    }
});

router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
    const requiresType = to.matched.some(record => record.meta.requiresType);
    const isAuthenticated = auth.currentUser;
    const authStore = useAuthStore();

    if (requiresAuth && !isAuthenticated) {
        next('/login');
        return;
    }

    if (requiresAdmin && !authStore.isAdmin) {
        next('/');
        return;
    }

    if (requiresType && !requiresAdmin) {
        const requiredType = to.matched.find(record => record.meta.requiresType)?.meta.requiresType;
        if (authStore.userType !== requiredType) {
            next(authStore.isDeveloper ? '/developer' : '/company');
            return;
        }
    }

    next();
});

export default router;