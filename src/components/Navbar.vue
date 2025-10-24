<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <h1>{{ brandName }}</h1>
      </div>
        <div class="nav-user">
          <router-link to="/profile" class="profile-link">
            <span class="profile-text">我的主页</span>
          </router-link>
          <div class="user-avatar" @click="handleAvatarClick">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#6366F1"/>
              <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#6366F1"/>
            </svg>
          </div>
        </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  props: {
    brandName: {
      type: String,
      default: 'TripCraft'
    }
  },
  methods: {
    handleAvatarClick() {
      this.$emit('avatar-click');
    }
  }
};
</script>

<style scoped>
/* 导航栏样式 */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav-brand h1 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-link {
  text-decoration: none;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.profile-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #5a67d8;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }
}
</style>
