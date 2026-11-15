import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WorkCard from '../WorkCard.vue';

describe('WorkCard.vue', () => {
  const sampleWork = {
    id: 'w-100',
    title: 'Matrix',
    type: 'movie',
    genre: 'Ciencia Ficción',
    release_year: 1999,
    duration: '136 min',
    synopsis: 'Un hacker descubre la verdadera naturaleza de su realidad.'
  };

  const createWrapper = (work = sampleWork) => {
    return mount(WorkCard, {
      props: { work },
      global: {
        stubs: {
          Card: {
            template: `
              <div class="p-card">
                <slot name="title"></slot>
                <slot name="subtitle"></slot>
                <slot name="content"></slot>
                <slot name="footer"></slot>
              </div>
            `
          },
          Tag: {
            props: ['value', 'severity', 'icon'],
            template: '<span class="p-tag" :class="severity">{{ value }}</span>'
          },
          Button: {
            props: ['label'],
            template: '<button>{{ label }}</button>'
          },
          'router-link': {
            props: ['to'],
            template: '<a :href="to"><slot></slot></a>'
          }
        }
      }
    });
  };

  it('renderiza la información principal de la obra', () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Matrix');
    expect(wrapper.text()).toContain('Película');
    expect(wrapper.text()).toContain('Ciencia Ficción');
    expect(wrapper.text()).toContain('1999');
    expect(wrapper.text()).toContain('136 min');
    expect(wrapper.text()).toContain('Un hacker descubre la verdadera naturaleza');
  });

  it('asigna la etiqueta correcta según el tipo de obra', () => {
    const seriesWork = { ...sampleWork, type: 'series' };
    const wrapperSeries = createWrapper(seriesWork);
    expect(wrapperSeries.text()).toContain('Serie');

    const bookWork = { ...sampleWork, type: 'book' };
    const wrapperBook = createWrapper(bookWork);
    expect(wrapperBook.text()).toContain('Libro');
  });

  it('el botón de detalles enlaza correctamente a la URL de la obra', () => {
    const wrapper = createWrapper();
    const link = wrapper.find('a');
    expect(link.attributes('href')).toBe('/works/w-100');
    expect(wrapper.text()).toContain('Ver detalles y debates');
  });
});

