import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token');

  // Si ya tiene sesión e intenta entrar al login, redirigir al inicio
  if (to.name === 'login' && token) {
    return next({ name: 'home' });
  }

  // Soporte preparado para rutas privadas con meta.requiresAuth
  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login' });
  }

  next();
});

export default router;

