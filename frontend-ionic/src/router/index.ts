import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token');

  // Si ya tiene sesión activa e intenta ir al login, redirigir a la vista principal
  if (to.name === 'Login' && token) {
    return next({ name: 'Home' });
  }

  // Si la ruta requiere autenticación y no hay token, redirigir a login
  if (to.meta.requiresAuth && !token) {
    return next({ name: 'Login' });
  }

  next();
});

export default router;
