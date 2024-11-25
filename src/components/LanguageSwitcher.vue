<template>
  <div class="relative inline-block text-left">
    <div class="relative">
      <!-- Кнопка, отображающая текущий язык -->
      <button
          type="button"
          class="relative w-full cursor-default rounded-md bg-gray-800 text-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:ring-gray-500"
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="listbox-label"
          @click="toggleMenu">
        <span class="flex items-center">
          <span class="ml-3 block truncate">
            {{ currentLanguage === 'en' ? 'EN' : currentLanguage === 'uk' ? 'UA' : 'RU' }}
          </span>
        </span>
        <!-- Иконка стрелки -->
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg class="w-5 h-5 text-gray-400 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z" clip-rule="evenodd" />
          </svg>
        </span>
      </button>

      <!-- Список языков -->
      <ul
          v-show="isMenuOpen"
          @click="closeMenu"
          class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-800 text-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm dark:bg-gray-700 dark:ring-gray-500"
          tabindex="-1"
          role="listbox"
          aria-labelledby="listbox-label"
          aria-activedescendant="listbox-option-0">
        <!-- English Option -->
        <li @click="changeLanguage('en')" class="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white" role="option">
          <span class="ml-3 block truncate text-white">EN</span>
        </li>
        <!-- Ukrainian Option -->
        <li @click="changeLanguage('uk')" class="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white" role="option">
          <span class="ml-3 block truncate text-white">UA</span>
        </li>
        <!-- Russian Option -->
        <li @click="changeLanguage('ru')" class="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white" role="option">
          <span class="ml-3 block truncate text-white">RU</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

const { locale } = useI18n();

// Текущий язык, привязанный к select
const currentLanguage = computed(() => locale.value);

// Состояние для открытия/закрытия меню
const isMenuOpen = ref(false);

// Функция для переключения языка
const changeLanguage = (localeValue: string) => {
  // Меняем язык
  locale.value = localeValue;
  localStorage.setItem('preferredLanguage', localeValue); // Сохраняем язык в localStorage
  closeMenu(); // Закрываем меню после выбора языка
};

// Функция для открытия/закрытия меню
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Функция для закрытия меню
const closeMenu = () => {
  isMenuOpen.value = false;
};

onMounted(() => {
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'uk' || savedLanguage === 'ru')) {
    locale.value = savedLanguage;
  }
});
</script>

<style scoped>
/* Стили для темного фона */
.dark .bg-gray-800 {
  background-color: #2d3748;
}

.dark .text-white {
  color: #fff;
}

.dark .text-gray-900 {
  color: #1a202c;
}

.language-selector select {
  background-color: #333;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #444;
}
</style>
