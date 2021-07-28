<template>
  <div class="block bg-red-400 text-red-250 checked:bg-orange">
    Orange
  </div>

  <div>{{ user }}</div>

  <form @submit.prevent="login(email, password)" v-if="!user">
    <input type="email" required v-model="email" />
    <input type="password" v-model="password" />
    <button>Login</button>
  </form>

  <button @click="logout" v-else>Logout</button>

  <div>{{ loading }}</div>
  <div v-if="result">{{ result.data.name }}</div>
  <div>{{ error }}</div>

  <router-view />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { useUser, useAuth } from '../auth';
import { usePets } from './models';

export default defineComponent({
  name: 'App',
  setup() {
    const auth = useAuth();
    const user = useUser();

    const email = ref('');
    const password = ref('');

    const { onGet } = usePets();

    const { loading, result, error } = onGet('matt');

    onMounted(async () => {});

    return {
      user,
      email,
      password,
      login(email: string, password: string) {
        return signInWithEmailAndPassword(auth, email, password);
      },
      logout() {
        return signOut(auth);
      },
      loading,
      result,
      error,
    };
  },
});
</script>
