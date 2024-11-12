<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { doc, getDoc, getDocs, collection, where, query, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config'; // Подключаем конфиг Firebase
import { useAuthStore } from '@/stores/auth'; // Подключаем хранилище пользователя для получения текущего пользователя
import Swal from 'sweetalert2'; // Импортируем библиотеку SweetAlert2

interface SavedDeveloper {
  id: string;
  name: string;
  title: string;
  location: string;
  skills: string[];
  experience: string;
  savedAt: string;
  status: 'available' | 'interviewing' | 'hired';
  testScores: {
    testName: string;
    score: number;
  }[];
  notes?: string; // Заметки, которые могут быть добавлены к разработчику
  todos?: { id: string; title: string; done: boolean }[]; // To-do список для работы с разработчиком
}

const savedDevelopers = ref<SavedDeveloper[]>([]); // Реактивная переменная для хранения данных разработчиков

const authStore = useAuthStore();
const currentUser = ref(authStore.user);
const router = useRouter();

// Функция получения сохраненных разработчиков из Firebase
const fetchSavedDevelopers = async () => {
  if (!currentUser.value) {
    console.error('No authenticated user found');
    return;
  }

  try {
    // Получаем данные компании из коллекции users по ID пользователя
    const companyRef = doc(db, 'users', currentUser.value.uid);
    const companySnap = await getDoc(companyRef);

    if (companySnap.exists()) {
      const savedUsers = companySnap.data().savedUsers || [];

      if (savedUsers.length === 0) {
        console.log('No saved developers found');
        return;
      }

      // Получаем данные сохраненных разработчиков
      const developersRef = collection(db, 'users');
      const developersQuery = query(developersRef, where('__name__', 'in', savedUsers.map((user: any) => user.id)));
      const querySnapshot = await getDocs(developersQuery);

      savedDevelopers.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        title: doc.data().title || 'No title',
        location: doc.data().location || 'Not specified',
        skills: doc.data().technologies || [],
        experience: doc.data().experience || 'Not specified',
        savedAt: savedUsers.find((user: any) => user.id === doc.id)?.savedAt || 'Unknown date',
        status: doc.data().status || 'available',
        testScores: doc.data().testScores || [],
        notes: savedUsers.find((user: any) => user.id === doc.id)?.notes || '',
        todos: savedUsers.find((user: any) => user.id === doc.id)?.todos || []
      }));

      console.log('Saved Developers fetched:', savedDevelopers.value);
    } else {
      console.error('No such company found');
    }
  } catch (error) {
    console.error('Error fetching saved developers:', error);
  }
};

// Функция удаления сохраненного разработчика из списка и базы данных Firebase
const removeSavedDeveloper = async (developerId: string) => {
  if (!currentUser.value) {
    console.error('No authenticated user found');
    return;
  }

  try {
    // Показываем диалог подтверждения с использованием SweetAlert2
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this developer from saved?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      // Удаление разработчика из списка UI
      savedDevelopers.value = savedDevelopers.value.filter(dev => dev.id !== developerId);

      // Обновление документа компании в Firebase, удаление разработчика из массива savedUsers
      const companyRef = doc(db, 'users', currentUser.value.uid);
      const companySnap = await getDoc(companyRef);

      if (companySnap.exists()) {
        const savedUsers = companySnap.data().savedUsers || [];
        const updatedSavedUsers = savedUsers.filter((user: any) => user.id !== developerId);

        // Обновляем данные в Firestore
        await updateDoc(companyRef, {
          savedUsers: updatedSavedUsers
        });

        Swal.fire('Deleted!', 'The developer has been removed from saved.', 'success');
      } else {
        console.error('Company document does not exist');
      }
    }
  } catch (error) {
    console.error('Error removing saved developer:', error);
    Swal.fire('Error', 'Something went wrong while removing the developer.', 'error');
  }
};

// Функция добавления заметки для разработчика
const addNoteToDeveloper = async (developerId: string) => {
  const developer = savedDevelopers.value.find(dev => dev.id === developerId);
  if (!developer) return;

  try {
    // Показываем модальное окно для добавления заметки
    const { value: note } = await Swal.fire({
      title: 'Add Note',
      input: 'textarea',
      inputLabel: 'Developer Notes',
      inputPlaceholder: 'Enter your note here...',
      inputValue: developer.notes,
      showCancelButton: true
    });

    if (note !== undefined) {
      developer.notes = note;

      // Обновляем данные разработчика в Firestore
      const companyRef = doc(db, 'users', currentUser.value.uid);
      const companySnap = await getDoc(companyRef);
      if (companySnap.exists()) {
        let savedUsers = companySnap.data().savedUsers || [];
        savedUsers = savedUsers.map((user: any) =>
            user.id === developerId ? { ...user, notes: note } : user
        );

        await updateDoc(companyRef, { savedUsers });

        Swal.fire('Success', 'Note has been updated successfully.', 'success');
      }
    }
  } catch (error) {
    console.error('Error adding note to developer:', error);
    Swal.fire('Error', 'Something went wrong while adding the note.', 'error');
  }
};

// Функция добавления задачи в to-do список
const addTodoToDeveloper = async (developerId: string) => {
  const developer = savedDevelopers.value.find(dev => dev.id === developerId);
  if (!developer) return;

  try {
    const { value: title } = await Swal.fire({
      title: 'Add To-Do',
      input: 'text',
      inputLabel: 'To-Do Title',
      inputPlaceholder: 'Enter your task here...',
      showCancelButton: true
    });

    if (title) {
      const newTodo = { id: Date.now().toString(), title, done: false };
      developer.todos?.push(newTodo);

      const companyRef = doc(db, 'users', currentUser.value.uid);
      const companySnap = await getDoc(companyRef);
      if (companySnap.exists()) {
        let savedUsers = companySnap.data().savedUsers || [];
        savedUsers = savedUsers.map((user: any) =>
            user.id === developerId ? { ...user, todos: developer.todos } : user
        );

        await updateDoc(companyRef, { savedUsers });
        Swal.fire('Success', 'To-do has been added successfully.', 'success');
      }
    }
  } catch (error) {
    console.error('Error adding to-do to developer:', error);
    Swal.fire('Error', 'Something went wrong while adding the to-do.', 'error');
  }
};

// Функция изменения состояния to-do задачи (выполнена/не выполнена)
const toggleTodoStatus = async (developerId: string, todoId: string) => {
  const developer = savedDevelopers.value.find(dev => dev.id === developerId);
  if (!developer) return;

  const todo = developer.todos?.find(todo => todo.id === todoId);
  if (!todo) return;

  todo.done = !todo.done;

  try {
    const companyRef = doc(db, 'users', currentUser.value.uid);
    const companySnap = await getDoc(companyRef);
    if (companySnap.exists()) {
      let savedUsers = companySnap.data().savedUsers || [];
      savedUsers = savedUsers.map((user: any) =>
          user.id === developerId ? { ...user, todos: developer.todos } : user
      );

      await updateDoc(companyRef, { savedUsers });
    }
  } catch (error) {
    console.error('Error updating to-do status:', error);
  }
};

// Функция получения цвета статуса
const getStatusColor = (status: string) => {
  switch (status) {
    case 'searching': return 'bg-green-500/10 text-green-400';
    case 'paused': return 'bg-yellow-500/10 text-yellow-400';
    case 'not_searching': return 'bg-blue-500/10 text-blue-400';
    default: return 'bg-gray-500/10 text-gray-400';
  }
};

// Выполнение функции получения сохраненных разработчиков при монтировании компонента
onMounted(() => {
  fetchSavedDevelopers();
});
</script>

<template>
  <div class="max-w-4xl">
    <h2 class="text-2xl font-bold mb-6">Saved Developers</h2>

    <div v-if="savedDevelopers.length === 0" class="bg-gray-800 rounded-lg p-6 text-center">
      <p class="text-gray-300">You haven't saved any developers yet.</p>
      <router-link
          to="/developers"
          class="inline-block mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
      >
        Browse Developers
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
          v-for="developer in savedDevelopers"
          :key="developer.id"
          class="bg-gray-800 rounded-lg p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold mb-2">{{ developer.name }}</h3>
            <p class="text-gray-300">{{ developer.about }}</p>
            <p class="text-gray-400 text-sm">{{ developer.location }} • {{ developer.experience }} experience</p>
          </div>
          <div class="flex items-center space-x-4">
            <span
                :class="[getStatusColor(developer.status), 'px-3 py-1 rounded-full text-sm']"
            >
              {{ developer.status.charAt(0).toUpperCase() + developer.status.slice(1) }}
            </span>
            <button
                @click="removeSavedDeveloper(developer.id)"
                class="text-gray-400 hover:text-red-400"
                title="Remove from saved"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
                @click="addNoteToDeveloper(developer.id)"
                class="text-gray-400 hover:text-blue-400"
                title="Add Note"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20v-8m0 0V4m0 8h8m-8 0H4" />
              </svg>
            </button>
          </div>
        </div>

        <!-- To-Do Section -->
        <div class="mb-4">
          <h4 class="text-lg font-medium mb-2">To-Do List</h4>
          <div class="space-y-2">
            <div v-for="todo in developer.todos" :key="todo.id" class="flex items-center">
              <input
                  type="checkbox"
                  :checked="todo.done"
                  @change="toggleTodoStatus(developer.id, todo.id)"
                  class="mr-2"
              >
              <span :class="{ 'line-through text-gray-500': todo.done }">{{ todo.title }}</span>
            </div>
          </div>
          <button
              @click="addTodoToDeveloper(developer.id)"
              class="mt-2 text-primary-400 hover:text-primary-300 text-sm"
          >
            Add To-Do
          </button>
        </div>

        <div class="mb-4">
          <div class="flex flex-wrap gap-2">
            <span
                v-for="skill in developer.skills"
                :key="skill"
                class="bg-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <div class="flex justify-between items-center mt-4 text-sm">
          <div class="flex items-center space-x-4">
            <router-link
                :to="`/developers/${developer.id}`"
                class="text-primary-400 hover:text-primary-300"
            >
              View Profile
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
