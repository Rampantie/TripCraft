import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
  }),
  actions: {
    login(user) {
      this.isAuthenticated = true;
      this.user = user;
      console.log('User logged in:', user);
    },
    logout() {
      this.isAuthenticated = false;
      this.user = null;
      console.log('User logged out:', user);
    },
  },
});
