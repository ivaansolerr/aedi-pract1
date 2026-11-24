<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home" text="Atrás"></ion-back-button>
        </ion-buttons>
        <ion-title>Iniciar Sesión</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding login-content">
      <div class="login-container">
        <ion-card class="login-card">
          <ion-card-header class="ion-text-center">
            <ion-card-title>Bienvenido</ion-card-title>
            <ion-card-subtitle>Accede con tu cuenta a Debates de Ficción</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <form @submit.prevent="handleLogin" novalidate>
              <ion-list lines="inset" class="ion-no-padding">
                <ion-item
                  :class="{ 'ion-invalid': !!validationErrors.email, 'ion-touched': !!validationErrors.email }"
                  class="ion-margin-bottom"
                >
                  <ion-input
                    v-model="email"
                    type="email"
                    inputmode="email"
                    label="Correo electrónico"
                    label-placement="floating"
                    placeholder="usuario@ejemplo.com"
                    :clear-input="true"
                    autocomplete="email"
                    data-testid="login-email"
                    @ion-input="clearFieldError('email')"
                  ></ion-input>
                  <ion-note v-if="validationErrors.email" slot="error" color="danger" data-testid="error-email">
                    {{ validationErrors.email }}
                  </ion-note>
                </ion-item>

                <ion-item
                  :class="{ 'ion-invalid': !!validationErrors.password, 'ion-touched': !!validationErrors.password }"
                  class="ion-margin-bottom"
                >
                  <ion-input
                    v-model="password"
                    type="password"
                    label="Contraseña"
                    label-placement="floating"
                    placeholder="Introduce tu contraseña"
                    :clear-input="true"
                    autocomplete="current-password"
                    data-testid="login-password"
                    @ion-input="clearFieldError('password')"
                  ></ion-input>
                  <ion-note v-if="validationErrors.password" slot="error" color="danger" data-testid="error-password">
                    {{ validationErrors.password }}
                  </ion-note>
                </ion-item>
              </ion-list>

              <div class="ion-margin-top">
                <ion-button
                  expand="block"
                  type="submit"
                  :disabled="authStore.isLoading"
                  data-testid="login-submit"
                >
                  <ion-spinner v-if="authStore.isLoading" name="crescent" slot="start"></ion-spinner>
                  {{ authStore.isLoading ? 'Iniciando sesión...' : 'Entrar' }}
                </ion-button>
              </div>
            </form>
          </ion-card-content>
        </ion-card>

        <!-- Tarjeta de ayuda con credenciales de prueba -->
        <ion-card class="demo-card ion-margin-top">
          <ion-card-header>
            <ion-card-subtitle>Credenciales de prueba</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p><strong>Email:</strong> <code>ana@test.com</code></p>
            <p><strong>Contraseña:</strong> <code>12345678</code></p>
            <ion-button
              fill="outline"
              size="small"
              expand="block"
              class="ion-margin-top"
              data-testid="btn-demo-credentials"
              @click="fillDemoCredentials"
            >
              Autocompletar credenciales demo
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonInput,
  IonNote,
  IonButton,
  IonSpinner,
  IonButtons,
  IonBackButton,
  toastController,
} from '@ionic/vue';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const validationErrors = ref<{ email?: string; password?: string }>({});

const validateForm = (): boolean => {
  const errors: { email?: string; password?: string } = {};
  const trimmedEmail = email.value.trim();

  if (!trimmedEmail) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'El formato del correo electrónico no es válido.';
  }

  if (!password.value) {
    errors.password = 'La contraseña es obligatoria.';
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const clearFieldError = (field: 'email' | 'password') => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field];
  }
};

const showToast = async (message: string, color: 'success' | 'danger') => {
  const toast = await toastController.create({
    message,
    duration: 3500,
    position: 'bottom',
    color,
  });
  await toast.present();
};

const handleLogin = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await authStore.login({
      email: email.value.trim(),
      password: password.value,
    });

    const username = authStore.user?.username || authStore.user?.name || 'usuario';
    await showToast(`Bienvenido de nuevo, ${username}.`, 'success');

    router.replace('/home');
  } catch (error: any) {
    const errorMsg =
      error.response?.data?.message ||
      authStore.errorMessage ||
      'Error al iniciar sesión. Comprueba tus credenciales.';

    await showToast(errorMsg, 'danger');
  }
};

const fillDemoCredentials = () => {
  email.value = 'ana@test.com';
  password.value = '12345678';
  validationErrors.value = {};
};
</script>

<style scoped>
.login-container {
  max-width: 450px;
  margin: 0 auto;
  padding-top: 1rem;
}

.login-card {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.demo-card {
  border-radius: 12px;
  background-color: var(--ion-color-light);
}

.demo-card code {
  background: var(--ion-color-light-shade);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}
</style>
