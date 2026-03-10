export interface BlogArticle {
  slug: string;
  titleKey: string;
  descriptionKey: string;
  contentKey: string;
  date: string;
  authorKey: string;
  categoryKey: string;
  image?: string;
  readTime: number;
}

export const blogArticles: BlogArticle[] = [
  {
    slug: 'how-to-prepare-for-tech-interview',
    titleKey: 'blog.articles.techInterview.title',
    descriptionKey: 'blog.articles.techInterview.description',
    contentKey: 'blog.articles.techInterview.content',
    date: '2026-03-01',
    authorKey: 'blog.authors.team',
    categoryKey: 'blog.categories.interviews',
    readTime: 8,
  },
  {
    slug: 'top-skills-2026',
    titleKey: 'blog.articles.topSkills.title',
    descriptionKey: 'blog.articles.topSkills.description',
    contentKey: 'blog.articles.topSkills.content',
    date: '2026-02-20',
    authorKey: 'blog.authors.team',
    categoryKey: 'blog.categories.career',
    readTime: 6,
  },
  {
    slug: 'ai-in-hiring',
    titleKey: 'blog.articles.aiHiring.title',
    descriptionKey: 'blog.articles.aiHiring.description',
    contentKey: 'blog.articles.aiHiring.content',
    date: '2026-02-10',
    authorKey: 'blog.authors.team',
    categoryKey: 'blog.categories.technology',
    readTime: 7,
  },
  {
    slug: 'building-perfect-resume',
    titleKey: 'blog.articles.perfectResume.title',
    descriptionKey: 'blog.articles.perfectResume.description',
    contentKey: 'blog.articles.perfectResume.content',
    date: '2026-01-28',
    authorKey: 'blog.authors.team',
    categoryKey: 'blog.categories.career',
    readTime: 5,
  },
  {
    slug: 'interview-skills-employers-want',
    titleKey: 'blog.articles.interviewSkills.title',
    descriptionKey: 'blog.articles.interviewSkills.description',
    contentKey: 'blog.articles.interviewSkills.content',
    date: '2026-03-05',
    authorKey: 'blog.authors.team',
    categoryKey: 'blog.categories.interviews',
    readTime: 7,
  },
  {
    slug: 'remote-vs-office-interviews',
    titleKey: 'blog.articles.remoteVsOffice.title',
    descriptionKey: 'blog.articles.remoteVsOffice.description',
    contentKey: 'blog.articles.remoteVsOffice.content',
    date: '2026-03-08',
    authorKey: 'blog.authors.team',
    categoryKey: 'blog.categories.interviews',
    readTime: 6,
  },
  {
    slug: 'coding-interview-best-practices',
    titleKey: 'blog.articles.codingInterview.title',
    descriptionKey: 'blog.articles.codingInterview.description',
    contentKey: 'blog.articles.codingInterview.content',
    date: '2026-03-10',
    authorKey: 'blog.authors.team',
    categoryKey: 'blog.categories.interviews',
    readTime: 8,
  },
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find(a => a.slug === slug);
}
