import { createRouter, createWebHistory } from 'vue-router';
import WorksListView from '../views/WorksListView.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
  {
    path: '/',
    alias: '/works',
    name: 'works',
    component: WorksListView
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
    return next({ name: 'works' });
  }

  // Soporte preparado para rutas privadas con meta.requiresAuth
  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login' });
  }

  next();
});

export default router;
