<script setup>
import { computed } from 'vue';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const props = defineProps({
  work: {
    type: Object,
    required: true
  }
});

const typeConfig = computed(() => {
  const t = (props.work.type || '').toLowerCase();
  switch (t) {
    case 'movie':
    case 'película':
    case 'pelicula':
      return { label: 'Película', severity: 'info', icon: 'pi pi-video' };
    case 'series':
    case 'serie':
      return { label: 'Serie', severity: 'warn', icon: 'pi pi-desktop' };
    case 'book':
    case 'libro':
      return { label: 'Libro', severity: 'success', icon: 'pi pi-book' };
    default:
      return { label: props.work.type || 'Obra', severity: 'secondary', icon: 'pi pi-tag' };
  }
});
</script>

<template>
  <Card class="work-card">
    <template #title>
      <div class="card-header">
        <h3 class="work-title" :title="work.title">{{ work.title }}</h3>
        <Tag
          :value="typeConfig.label"
          :severity="typeConfig.severity"
          :icon="typeConfig.icon"
          class="type-tag"
        />
      </div>
    </template>

    <template #subtitle>
      <div class="meta-info">
        <span class="genre-badge">
          <i class="pi pi-bookmark"></i> {{ work.genre }}
        </span>
        <span class="meta-item">
          <i class="pi pi-calendar"></i> {{ work.release_year }}
        </span>
        <span class="meta-item" v-if="work.duration">
          <i class="pi pi-clock"></i> {{ work.duration }}
        </span>
      </div>
    </template>

    <template #content>
      <p class="synopsis" :title="work.synopsis">
        {{ work.synopsis }}
      </p>
    </template>

    <template #footer>
      <div class="card-footer">
        <router-link :to="`/works/${work.id}`" class="details-link">
          <Button
            label="Ver detalles y debates"
            icon="pi pi-arrow-right"
            iconPos="right"
            size="small"
            class="w-full"
            outlined
          />
        </router-link>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.work-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: #ffffff;
}

.work-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.work-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.type-tag {
  flex-shrink: 0;
  font-size: 0.75rem;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.genre-badge,
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.synopsis {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0.5rem 0 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: auto;
  padding-top: 0.75rem;
}

.details-link {
  text-decoration: none;
  display: block;
}

.w-full {
  width: 100%;
}
</style>

