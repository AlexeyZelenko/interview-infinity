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
