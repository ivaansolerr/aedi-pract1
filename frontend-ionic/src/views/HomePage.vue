<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-title>Debates de Ficción</ion-title>
        <ion-buttons slot="end">
          <template v-if="authStore.isAuthenticated">
            <ion-button data-testid="btn-user-profile">
              <ion-icon slot="start" :icon="personCircleOutline"></ion-icon>
              {{ authStore.user?.username || 'Mi Perfil' }}
            </ion-button>
            <ion-button data-testid="btn-logout" @click="handleLogout">
              <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
            </ion-button>
          </template>
          <template v-else>
            <ion-button router-link="/login" data-testid="btn-go-login">
              <ion-icon slot="start" :icon="logInOutline"></ion-icon>
              Entrar
            </ion-button>
          </template>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="welcome-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              {{ authStore.isAuthenticated ? `¡Hola, ${authStore.user?.username || 'amigo'}!` : 'Bienvenido a Debates de Ficción' }}
            </ion-card-title>
            <ion-card-subtitle>
              {{ authStore.isAuthenticated ? 'Sesión activa' : 'Modo visitante' }}
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p v-if="authStore.isAuthenticated">
              Estás conectado con el correo <strong>{{ authStore.user?.email }}</strong>. En la próxima iteración podrás explorar el catálogo completo de obras con desplazamiento infinito.
            </p>
            <p v-else>
              Inicia sesión para poder crear y debatir sobre tus obras de ficción favoritas.
            </p>
            <div class="ion-margin-top" v-if="!authStore.isAuthenticated">
              <ion-button router-link="/login" expand="block">
                Iniciar sesión ahora
              </ion-button>
            </div>
            <div class="ion-margin-top" v-else>
              <ion-button color="danger" fill="outline" expand="block" @click="handleLogout">
                Cerrar sesión
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  toastController,
} from '@ionic/vue';
import { personCircleOutline, logOutOutline, logInOutline } from 'ionicons/icons';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  authStore.logout();
  const toast = await toastController.create({
    message: 'Has cerrado sesión con éxito.',
    duration: 3000,
    position: 'bottom',
    color: 'dark',
  });
  await toast.present();
  router.replace('/login');
};
</script>

<style scoped>
.welcome-container {
  max-width: 500px;
  margin: 2rem auto;
}
</style>
