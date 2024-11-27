<script lang="ts" setup>
import {onMounted, reactive} from 'vue'

const arrayArticles = reactive([
  {
    id: 1,
    title: 'Find Your Next Tech Opportunity',
    description: '',
    link: 'https://www.linkedin.com/pulse/find-your-next-tech-opportunity-oleksii-zelenko-zkoee/?trackingId=33Q46f9MRaS84hedZHJDrQ%3D%3D'
  },
  {
    id: 2,
    title: 'Navigating the DevHire Platform: Test Review and Job Application Process',
    description: '',
    link: 'https://app.tango.us/app/workflow/Navigating-the-DevHire-Platform--Test-Review-and-Job-Application-Process-5b3e6256f87a4f959c0740b87eee8416'
  },
  {
    id: 3,
    title: 'DevHire Platform Test Navigation Guide',
    description: '',
    link: 'https://app.tango.us/app/workflow/DevHire-Platform-Test-Navigation-Guide-94439e19e9cb42ffa8f5fcac85573040'
  },
  {
    id: 4,
    title: 'Відео: Як працює DevHire - тести для зареєстрованих користувачів та незареєстрованих. В чьому різниця?',
    description: '',
    link: 'https://www.loom.com/share/752f7fe1b59247aabbeb77e4233a7985?sid=d3c492ba-73ef-40d4-b1ef-33ca206d7c8c'
  },
  {
    id: 5,
    title: 'How to add a new vacancy and add tests to it',
    description: '',
    link: 'https://www.loom.com/share/2efcdcd49e774607a71e3d942cb9324b?sid=30f88d82-e21c-49cf-b357-b8466efff3df'
  },
  {
    id: 6,
    title: 'How to add a new test to an existing vacancy',
    description: '',
    link: 'https://www.loom.com/share/2efcdcd49e774607a71e3d942cb9324b?sid=30f88d82-e21c-49cf-b357-b8466efff3df'
  }
])

onMounted(() => {
  console.log(arrayArticles)
})
</script>

<template>
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">{{ $t("faq.sections.articles.title") }}</h2>
    <p>{{ $t("faq.sections.articles.description") }}</p>
    <ul
        v-for="(article, index) in arrayArticles"
        :key="index"
        class="list-disc ml-6 mt-4 text-gray-300 text-sm hover:text-blue-600"
    >
      <li>
        <a :href="article.link" target="_blank">{{ article.title }}</a>
      </li>
    </ul>
  </section>
</template>
