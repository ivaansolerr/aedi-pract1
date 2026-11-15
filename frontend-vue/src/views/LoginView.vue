<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'primevue/usetoast';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const email = ref('');
const password = ref('');
const validationErrors = ref({});

const validateForm = () => {
  const errors = {};
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

const handleLogin = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await authStore.login({
      email: email.value.trim(),
      password: password.value
    });

    toast.add({
      severity: 'success',
      summary: 'Inicio de sesión exitoso',
      detail: `Bienvenido de nuevo, ${authStore.user?.username || authStore.user?.name || 'usuario'}.`,
      life: 3000
    });

    router.push('/');
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      authStore.errorMessage ||
      'No se pudo conectar con el servidor.';

    toast.add({
      severity: 'error',
      summary: 'Error al iniciar sesión',
      detail: errorMsg,
      life: 4000
    });
  }
};

const fillDemoCredentials = () => {
  email.value = 'ana@test.com';
  password.value = '12345678';
  validationErrors.value = {};
};
</script>

<template>
  <div class="login-page">
    <div class="login-wrapper">
      <Card class="login-card">
        <template #title>
          <div class="card-header">
            <i class="pi pi-lock lock-icon"></i>
            <h2>Iniciar Sesión</h2>
            <p class="card-subtitle">Accede con tu cuenta a Debates de Ficción</p>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleLogin" class="login-form">
            <Message
              v-if="authStore.errorMessage"
              severity="error"
              :closable="false"
              class="mb-3"
            >
              {{ authStore.errorMessage }}
            </Message>

            <div class="field-group">
              <label for="email" class="form-label">Correo electrónico</label>
              <InputText
                id="email"
                v-model="email"
                type="email"
                placeholder="ejemplo@test.com"
                :class="{ 'p-invalid': validationErrors.email }"
                class="w-full"
                autocomplete="email"
              />
              <small v-if="validationErrors.email" class="p-error">
                {{ validationErrors.email }}
              </small>
            </div>

            <div class="field-group">
              <label for="password" class="form-label">Contraseña</label>
              <Password
                id="password"
                v-model="password"
                placeholder="Tu contraseña"
                :feedback="false"
                toggleMask
                :class="{ 'p-invalid': validationErrors.password }"
                class="w-full"
                inputClass="w-full"
                autocomplete="current-password"
              />
              <small v-if="validationErrors.password" class="p-error">
                {{ validationErrors.password }}
              </small>
            </div>

            <Button
              type="submit"
              label="Entrar a la plataforma"
              icon="pi pi-sign-in"
              :loading="authStore.isLoading"
              class="w-full submit-btn"
            />
          </form>

          <div class="demo-box mt-4">
            <div class="demo-header">
              <i class="pi pi-info-circle"></i>
              <span>Credenciales de prueba</span>
            </div>
            <p class="demo-info">
              Usuario de prueba: <strong>ana@test.com</strong> / Contraseña: <strong>12345678</strong>
            </p>
            <Button
              label="Autocompletar datos de prueba"
              icon="pi pi-copy"
              severity="secondary"
              size="small"
              outlined
              @click="fillDemoCredentials"
              class="w-full"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 2rem 1rem;
}

.login-wrapper {
  width: 100%;
  max-width: 440px;
}

.login-card {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.card-header {
  text-align: center;
  margin-bottom: 1rem;
}

.lock-icon {
  font-size: 2rem;
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.75rem;
  border-radius: 50%;
  margin-bottom: 0.5rem;
}

.card-header h2 {
  font-size: 1.5rem;
  color: #0f172a;
  margin: 0;
}

.card-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.w-full {
  width: 100%;
}

.p-error {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.submit-btn {
  margin-top: 0.5rem;
}

.demo-box {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 1rem;
}

.demo-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: #475569;
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
}

.demo-info {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}
</style>

