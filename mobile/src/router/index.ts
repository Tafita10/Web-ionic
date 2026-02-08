import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/tabs',
    component: () => import('@/views/TabsPage.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/HomePage.vue')
      },
      {
        path: 'map',
        name: 'Map',
        component: () => import('@/views/MapPage.vue')
      },
      {
        path: 'signalements',
        name: 'Signalements',
        component: () => import('@/views/signalements/SignalementListPage.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfilePage.vue')
      }
    ]
  },
  {
    path: '/signalements/create',
    name: 'CreateSignalement',
    component: () => import('@/views/signalements/CreateSignalementPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/signalements/:id',
    name: 'SignalementDetail',
    component: () => import('@/views/signalements/SignalementDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/signalements/:id/edit',
    name: 'EditSignalement',
    component: () => import('@/views/signalements/EditSignalementPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications/settings',
    name: 'NotificationSettings',
    component: () => import('@/views/NotificationSettingsPage.vue'),
    meta: { requiresAuth: true }
  }
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (!requiresAuth && authStore.isAuthenticated && to.path === '/login') {
    next('/tabs/home');
  } else {
    next();
  }
});
export default router;