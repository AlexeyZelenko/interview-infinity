<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-4">
        <!-- Language Selector -->
        <select
            v-model="selectedLanguage"
            :disabled="!isReady"
            class="bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option
              v-for="lang in languages"
              :key="lang"
              :value="lang"
          >
            {{ lang }}
          </option>
        </select>

        <!-- Editor Theme -->
        <select
            v-model="selectedTheme"
            :disabled="!isReady"
            class="bg-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <button
            @click="$emit('reset')"
            :disabled="!isReady"
            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Reset
        </button>
        <button
            @click="$emit('save')"
            :disabled="!isReady || isSaving"
            class="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>

    <!-- Editor Container -->
    <div
        ref="editorContainer"
        class="h-[600px] border border-gray-700 rounded-lg overflow-hidden relative"
    >
      <!-- Hidden textarea for input -->
      <textarea
          ref="textarea"
          v-model="code"
          class="absolute inset-0 w-full h-full bg-transparent text-transparent font-mono p-4 resize-none caret-white z-10"
          :style="{
          fontSize: '14px',
          lineHeight: '1.5',
          tabSize: '2'
        }"
          @input="handleInput"
          @keydown="handleKeyDown"
          @scroll="syncScroll"
      ></textarea>

      <!-- Syntax highlighted code -->
      <pre
          ref="codeDisplay"
          class="absolute inset-0 w-full h-full font-mono p-4 overflow-auto pointer-events-none"
          :style="{
          fontSize: '14px',
          lineHeight: '1.5',
          tabSize: '2'
        }"
          :class="selectedTheme === 'dark' ? 'prism-dark' : 'prism-light'"
      ><code v-html="highlightedCode"></code></pre>
    </div>

    <!-- Editor Info -->
    <div class="flex justify-between items-center mt-4 text-sm text-gray-400">
      <div>
        Lines: {{ code.split('\n').length }}, Characters: {{ code.length }}
      </div>
      <div>
        {{ selectedLanguage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import debounce from 'lodash/debounce';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';

const props = defineProps<{
  languages: string[];
  initialLanguage: string;
  initialCode: string;
  isSaving?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:language', value: string): void;
  (e: 'update:code', value: string): void;
  (e: 'save'): void;
  (e: 'reset'): void;
}>();

const editorContainer = ref<HTMLElement | null>(null);
const textarea = ref<HTMLTextAreaElement | null>(null);
const codeDisplay = ref<HTMLPreElement | null>(null);
const isReady = ref(true);
const selectedLanguage = ref(props.initialLanguage);
const selectedTheme = ref('dark');
const code = ref(props.initialCode);

// Map language names to Prism language identifiers
const languageMap: Record<string, string> = {
  'JavaScript': 'javascript',
  'TypeScript': 'typescript',
  'Python': 'python',
  'Java': 'java',
  'C++': 'cpp',
  'C': 'c'
};

const highlightedCode = computed(() => {
  const language = languageMap[selectedLanguage.value] || 'javascript';
  return Prism.highlight(
      code.value,
      Prism.languages[language],
      language
  );
});

// Debounced content update
const updateContent = debounce((content: string) => {
  emit('update:code', content);
}, 300);

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  code.value = target.value;
  updateContent(target.value);
};

const handleKeyDown = (e: KeyboardEvent) => {
  // Handle Tab key
  if (e.key === 'Tab') {
    e.preventDefault();
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    // Insert tab at cursor position
    const newValue = target.value.substring(0, start) + '  ' + target.value.substring(end);
    code.value = newValue;

    // Move cursor after tab
    setTimeout(() => {
      target.selectionStart = target.selectionEnd = start + 2;
    }, 0);

    updateContent(newValue);
  }

  // Handle auto-closing brackets and quotes
  const pairs: Record<string, string> = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`'
  };

  if (e.key in pairs && !e.ctrlKey && !e.altKey) {
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    // Only auto-close if there's a selection or we're at the end of a word
    if (start === end) {
      const nextChar = target.value.charAt(end);
      if (!nextChar || /\s/.test(nextChar)) {
        e.preventDefault();
        const newValue = target.value.substring(0, start) + e.key + pairs[e.key] + target.value.substring(end);
        code.value = newValue;

        // Move cursor between the brackets
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1;
        }, 0);

        updateContent(newValue);
      }
    }
  }
};

const syncScroll = (e: Event) => {
  if (codeDisplay.value && textarea.value) {
    codeDisplay.value.scrollTop = textarea.value.scrollTop;
    codeDisplay.value.scrollLeft = textarea.value.scrollLeft;
  }
};

// Watch for language changes
watch(selectedLanguage, (newLang) => {
  emit('update:language', newLang);
});

// Watch for external code changes
watch(() => props.initialCode, (newCode) => {
  if (code.value !== newCode) {
    code.value = newCode;
  }
});

// Apply theme
watch(selectedTheme, (newTheme) => {
  if (editorContainer.value) {
    editorContainer.value.style.backgroundColor = newTheme === 'dark' ? '#1f2937' : '#ffffff';
  }
});

onMounted(() => {
  // Focus textarea
  if (textarea.value) {
    textarea.value.focus();
  }
});
</script>

<style>
/* Editor Styles */
.prism-dark {
  background: #1f2937;
  color: #e5e7eb;
}

.prism-light {
  background: #ffffff;
  color: #1f2937;
}

/* Hide textarea visual content but keep functionality */
textarea {
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
  color: transparent !important;
  caret-color: currentColor;
  background: transparent !important;
}

pre, code {
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Custom Prism theme overrides */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #6b7280;
}

.token.function {
  color: #60a5fa;
}

.token.keyword {
  color: #f472b6;
}

.token.string {
  color: #34d399;
}

.token.number {
  color: #fbbf24;
}

.token.operator {
  color: #e5e7eb;
}

.token.punctuation {
  color: #9ca3af;
}
</style>