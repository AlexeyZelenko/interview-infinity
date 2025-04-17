<script lang="ts" setup>
import { onMounted, reactive } from 'vue'

const arrayArticles = reactive([
  {
    id: 1,
    title: 'Find Your Next Tech Opportunity',
    description: 'Learn how to navigate through job opportunities and find your perfect tech role',
    link: 'https://www.linkedin.com/pulse/find-your-next-tech-opportunity-oleksii-zelenko-zkoee/?trackingId=33Q46f9MRaS84hedZHJDrQ%3D%3D',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    lang: 'en'
  },
  {
    id: 2,
    title: 'Navigating the DevHire Platform: Test Review and Job Application Process',
    description: 'A comprehensive guide to reviewing tests and applying for jobs on DevHire',
    link: 'https://app.tango.us/app/workflow/Navigating-the-DevHire-Platform--Test-Review-and-Job-Application-Process-5b3e6256f87a4f959c0740b87eee8416',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    lang: 'en'
  },
  {
    id: 3,
    title: 'DevHire Platform Test Navigation Guide',
    description: 'Learn how to navigate and take tests effectively on our platform',
    link: 'https://app.tango.us/app/workflow/DevHire-Platform-Test-Navigation-Guide-94439e19e9cb42ffa8f5fcac85573040',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    lang: 'en'
  },
  {
    id: 4,
    title: 'Відео: Як працює DevHire - тести для зареєстрованих користувачів та незареєстрованих. В чьому різниця?',
    description: 'Детальний огляд відмінностей між можливостями зареєстрованих та незареєстрованих користувачів',
    link: 'https://www.loom.com/share/752f7fe1b59247aabbeb77e4233a7985?sid=d3c492ba-73ef-40d4-b1ef-33ca206d7c8c',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    lang: 'uk'
  },
  {
    id: 5,
    title: 'How to add a new vacancy and add tests to it',
    description: 'Step-by-step guide for creating new job listings and adding assessment tests',
    link: 'https://www.loom.com/share/2efcdcd49e774607a71e3d942cb9324b?sid=30f88d82-e21c-49cf-b357-b8466efff3df',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    lang: 'en'
  },
  {
    id: 6,
    title: 'How to add a new test to an existing vacancy',
    description: 'Learn how to enhance your job listings by adding assessment tests',
    link: 'https://www.loom.com/share/2efcdcd49e774607a71e3d942cb9324b?sid=30f88d82-e21c-49cf-b357-b8466efff3df',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    lang: 'en'
  },
  {
    id: 7,
    title: 'Як додати нову вакансію та додати до неї тести',
    description: 'Дізнайтеся як вибрати тестове завдання для кандидатів',
    link: 'https://www.loom.com/share/8d5af865867f4292b6a49daf29285606?sid=8a4f5bb1-98d0-4ff7-98b3-10f787605af7',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    lang: 'uk'
  },
  {
    id: 8,
    title: 'Перевірка теста та спілкування з кандидатом',
    description: 'Як перевірити тест, який відправив кандидат, та спілкуватися з ним',
    link: 'https://www.loom.com/share/facdcfe659dd49fbaef86f9cbfc222b4?sid=eb2df441-c91e-4a54-8a99-2a21b8b0a88c',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    lang: 'uk'
  }
])

const filteredArticles = reactive({
  en: arrayArticles.filter(article => article.lang === 'en'),
  uk: arrayArticles.filter(article => article.lang === 'uk')
})

onMounted(() => {
  console.log(arrayArticles)
})
</script>

<template>
  <section class="mb-12">
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t("faq.sections.articles.title") }}</h2>
      <p class="text-gray-400 text-lg">{{ $t("faq.sections.articles.description") }}</p>
    </div>

    <!-- English Articles -->
    <div class="mb-8">
      <h3 class="text-xl font-medium mb-4 flex items-center">
        <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary-600/10 text-primary-500 mr-3">
          EN
        </span>
        English Articles
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          v-for="article in filteredArticles.en"
          :key="article.id"
          :href="article.link"
          target="_blank"
          class="group bg-gray-800 rounded-xl p-6 transition-all hover:bg-gray-700 hover:shadow-lg hover:-translate-y-1"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-primary-600/10 text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="article.icon" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h4 class="text-lg font-medium text-white group-hover:text-primary-400 transition-colors">
                {{ article.title }}
              </h4>
              <p class="mt-2 text-gray-400 text-sm">{{ article.description }}</p>
            </div>
          </div>
        </a>
      </div>
    </div>

    <!-- Ukrainian Articles -->
    <div>
      <h3 class="text-xl font-medium mb-4 flex items-center">
        <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary-600/10 text-primary-500 mr-3">
          UK
        </span>
        Українські статті
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          v-for="article in filteredArticles.uk"
          :key="article.id"
          :href="article.link"
          target="_blank"
          class="group bg-gray-800 rounded-xl p-6 transition-all hover:bg-gray-700 hover:shadow-lg hover:-translate-y-1"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-primary-600/10 text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="article.icon" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h4 class="text-lg font-medium text-white group-hover:text-primary-400 transition-colors">
                {{ article.title }}
              </h4>
              <p class="mt-2 text-gray-400 text-sm">{{ article.description }}</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>
