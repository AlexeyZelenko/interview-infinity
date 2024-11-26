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
        component: () => import('../views/Jobs/index.vue')
    },
    {
        path: '/jobs/:id',
        name: 'JobDetails',
        component: () => import('../views/Jobs/JobDetails.vue')
    },
    {
        path: '/developers',
        name: 'Developers',
        component: () => import('../views/Developers.vue')
    },
    {
        path: '/all-resumes',
        name: 'Resumes',
        component: () => import('../views/Resumes.vue')
    },
    {
        path: '/all-resumes/resume/:id',
        name: 'AllResumeDetailsReview',
        component: () => import('../views/AllResumeDetailsReview.vue')
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
    {
        path: '/test-result',
        name: 'TestResult',
        component: () => import('../views/TestResult/index.vue')
    },
    {
        path: '/faq',
        name: 'FAQ',
        component: () => import('../views/FAQ/index.vue')
    },
    // Admin Routes
    {
        path: '/admin',
        component: () => import('../layouts/AdminLayout.vue'),
        meta: { requiresAdmin: true },
        children: [
            {
                path: '',
                name: 'AdminDashboard',
                component: () => import('../views/admin/AdminDashboard.vue')
            },
            {
                path: 'upload-tests',
                name: 'UploadTests',
                component: () => import('../views/admin/UploadTests.vue')
            },
            {
                path: 'create-manual-test',
                name: 'CreateManualTest',
                component: () => import('../views/admin/CreateManualTest.vue')
            },
            {
                path: 'cards-create',
                name: 'CreateTestCard',
                component: () => import('../views/admin/CreateCardTest.vue')
            },
            {
                path: 'test/:id/edit',
                name: 'EditTest',
                component: () => import('../views/admin/EditTest.vue')
            },
            {
                path: 'tests',
                name: 'TestsAdmin',
                component: () => import('../views/admin/Tests.vue')
            },
            {
                path: 'review',
                name: 'ReviewSubmissions',
                component: () => import('../views/admin/ReviewSubmissions.vue')
            },
            {
                path: 'chats',
                name: 'AdminChats',
                component: () => import('../views/admin/Chats.vue')
            }
        ]
    },
    // Profile redirect
    {
        path: '/profile',
        name: 'Profile',
        redirect: to => {
            console.log("isAdmin", useAuthStore().isAdmin);
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
                path: 'applications',
                name: 'MyApplications',
                component: () => import('../views/account/MyApplications.vue')
            },
            {
                path: 'resumes',
                name: 'DeveloperResumes',
                component: () => import('../views/account/Developer/Resumes.vue')
            },
            {
                path: '/resumes/create',
                name: 'ResumeCreate',
                component: () => import('../views/account/Developer/ResumeCreate.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: '/resumes/:id',
                name: 'ResumeDetail',
                component: () => import('../views/account/Developer/ResumeDetails.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'test-results',
                name: 'DeveloperTestResults',
                component: () => import('../views/account/TestResults/index.vue')
            },
            {
                path: 'subscription',
                name: 'DeveloperSubscription',
                component: () => import('../views/account/Subscription.vue')
            },
            {
                path: 'challenges',
                name: 'Challenges',
                component: () => import('../views/CodingChallenges.vue')
            },
            {
                path: 'challenges/:id',
                name: 'ChallengeEditor',
                component: () => import('../views/ChallengeEditor.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'settings',
                name: 'SettingsDeveloper',
                component: () => import('../views/account/Developer/Settings/index.vue'),
                meta: { requiresAuth: true }
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
                redirect: '/company/profile'
            },
            {
                path: 'profile',
                name: 'CompanyProfile',
                component: () => import('../views/account/Company/Profile.vue')
            },
            {
                path: 'jobs',
                name: 'CompanyJobs',
                component: () => import('../views/account/Company/Jobs.vue'),
                props: (route) => ({
                    companyId: route.query.companyId
                }),
            },
            {
                path: 'jobs-create',
                name: 'CreateJob',
                component: () => import('../views/account/CreateJob.vue')
            },
            {
                path: 'jobs/create',
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
                component: () => import('@views/account/Company/JobApplicants/index.vue')
            },
            {
                path: 'saved-developers',
                name: 'CompanySavedDevelopers',
                component: () => import('../views/account/Company/SavedDevelopers.vue')
            },
            {
                path: 'tests',
                name: 'CompanyTests',
                component: () => import('../views/account/Company/Tests.vue')
            },
            {
                path: 'tests/:testId/results/',
                name: 'TestResults',
                component: () => import('../views/account/Company/TestsResults/index.vue'),
                props: (route) => ({
                    testId: route.params.testId,
                    jobId: route.query.jobId
                }),
                meta: { requiresAuth: true, requiresType: 'company' }
            },
            {
                path: '/test/:testId/user-review',
                name: 'TestCompanyUserReview',
                component: () => import('../views/account/Company/TestsResults/TestReview.vue'),
                props: (route) => ({
                    testId: route.params.testId,
                    userId: route.query.userId,
                }),
            },
            {
                path: '/tests/:testId/user-details',
                name: 'TestUserDetails',
                component: () => import('../views/account/Company/TestsResults/TestDetails.vue'),
                props: (route) => ({
                    testId: route.params.testId,
                    userId: route.query.userId,
                    jobId: route.query.jobId
                }),
            },
            {
                path: 'tests/:id/edit',
                name: 'TestEdit',
                component: () => import('../views/account/Company/EditTest.vue')
            },
            {
                path: 'create-test-ai',
                name: 'CreateTestAI',
                component: () => import('../views/account/Company/CreateTestAI.vue')
            },
            {
                path: 'create-test-manual',
                name: 'CreateTestManual',
                component: () => import('../views/account/Company/CreateTestManual.vue')
            },
            {
                path: 'create-test',
                name: 'CreateTest',
                component: () => import('../views/account/CreateTest.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'subscription',
                name: 'CompanySubscription',
                component: () => import('../views/account/Subscription.vue')
            },
            {
                path: 'add-test',
                name: 'AddTestToCompany',
                component: () => import('../views/account/Company/AddTest.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'test-selected/:testId/edit',
                name: 'EditSelectedTestFromCompany',
                component: () => import('../views/account/Company/EditSelectedTest.vue'),
                params: true,
                meta: { requiresAuth: true }
            },
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

    // if (requiresAuth && !isAuthenticated) {
    //     next('/login');
    //     return;
    // }

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