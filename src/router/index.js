import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import Home from '../components/Home.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import UserProfile from '../components/UserProfile.vue';
import TripPlanning from '../components/TripPlanning.vue';
import ForgotPassword from '../components/ForgotPassword.vue';
import ResetPassword from '../components/ResetPassword.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/planning',
    name: 'TripPlanning',
    component: TripPlanning
  },
  {
    path: '/planning/:id',
    name: 'TripPlanningDetail',
    component: TripPlanning,
    props: true
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // 如果认证状态还未初始化，先初始化
  if (!authStore.user && !authStore.isLoading) {
    await authStore._initAuthAsync();
  }
  
  // 如果认证状态正在加载中，等待加载完成
  if (authStore.isLoading) {
    // 等待认证状态加载完成（最多等待 3 秒）
    let waitCount = 0;
    const maxWait = 30; // 最多等待 30 次（每次 100ms，总共 3 秒）
    
    while (authStore.isLoading && waitCount < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;
    }
  }
  
  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    // 检查用户是否已登录
    if (!authStore.isAuthenticated) {
      // 未登录，重定向到登录页面
      next('/login');
      return;
    }
  }
  
  // 如果已登录用户访问登录或注册页面，重定向到主页
  if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    next('/');
    return;
  }
  
  next();
});

export default router;
