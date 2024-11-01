<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

const props = defineProps<{
  discussion: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    createdAt: string;
    type: 'discussion' | 'submission';
    status?: 'pending' | 'approved' | 'rejected';
    replies: Array<{
      id: string;
      content: string;
      author: {
        id: string;
        name: string;
        avatar?: string;
      };
      createdAt: string;
    }>;
  };
}>();

const authStore = useAuthStore();
const showReplies = ref(false);
const newReply = ref('');

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const submitReply = async () => {
  // Implementation for submitting replies
};
</script>

<template>
  <div class="bg-light-card dark:bg-dark-card rounded-lg p-6">
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-xl font-semibold">{{ discussion.title }}</h3>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-light-text-secondary dark:text-dark-text-secondary">
            by {{ discussion.author.name }}
          </span>
          <span class="text-light-text-secondary dark:text-dark-text-secondary">
            • {{ formatDate(discussion.createdAt) }}
          </span>
          <span
              v-if="discussion.type === 'submission'"
              :class="[
              'px-2 py-0.5 rounded-full text-sm',
              discussion.status === 'approved' ? 'bg-green-500/10 text-green-400' :
              discussion.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
              'bg-yellow-500/10 text-yellow-400'
            ]"
          >
            {{ discussion.status }}
          </span>
        </div>
      </div>
    </div>

    <div class="prose prose-invert max-w-none mb-4">
      {{ discussion.content }}
    </div>

    <div class="border-t border-light-border dark:border-dark-border pt-4">
      <button
          @click="showReplies = !showReplies"
          class="text-primary-400 hover:text-primary-300"
      >
        {{ showReplies ? 'Hide' : 'Show' }} {{ discussion.replies.length }} replies
      </button>

      <div v-if="showReplies" class="mt-4 space-y-4">
        <!-- Replies -->
        <div
            v-for="reply in discussion.replies"
            :key="reply.id"
            class="bg-light-hover dark:bg-dark-hover rounded-lg p-4"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="font-medium">{{ reply.author.name }}</span>
            <span class="text-light-text-secondary dark:text-dark-text-secondary text-sm">
              {{ formatDate(reply.createdAt) }}
            </span>
          </div>
          <p>{{ reply.content }}</p>
        </div>

        <!-- Reply Form -->
        <div v-if="authStore.user" class="mt-4">
          <textarea
              v-model="newReply"
              rows="3"
              class="w-full px-3 py-2 bg-light-card dark:bg-dark-card rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Write a reply..."
          ></textarea>
          <button
              @click="submitReply"
              class="mt-2 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Submit Reply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>