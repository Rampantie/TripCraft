import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import UserProfile from '../components/UserProfile.vue';
import TripPlanning from '../components/TripPlanning.vue';

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
    component: UserProfile
  },
  {
    path: '/planning',
    name: 'TripPlanning',
    component: TripPlanning
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
