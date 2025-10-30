/**
 * 认证状态管理 Store
 * 使用 Pinia 管理用户登录状态和用户信息
 */

import { defineStore } from 'pinia';
import { auth, userProfile } from '../utils/supabase.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userProfile: null,
    isAuthenticated: false,
    isLoading: false
  }),

  getters: {
    // 获取用户显示名称
    displayName: (state) => {
      if (state.userProfile?.username) {
        return state.userProfile.username;
      }
      if (state.user?.email) {
        return state.user.email.split('@')[0];
      }
      return '用户';
    },

    // 获取用户邮箱
    userEmail: (state) => {
      return state.user?.email || '';
    },

    // 获取用户头像URL
    avatarUrl: (state) => {
      return state.userProfile?.avatar_url || null;
    },

    // 检查是否为管理员
    isAdmin: (state) => {
      return state.userProfile?.role === 'admin';
    }
  },

  actions: {
    /**
     * 初始化认证状态
     */
    initAuth() {
      // 异步初始化，不阻塞渲染
      this._initAuthAsync();
    },
    
    async _initAuthAsync() {
      this.isLoading = true;
      try {
        const { data: { user } } = await auth.getCurrentUser();
        
        if (user) {
          this.user = user;
          this.isAuthenticated = true;
          
          // 异步加载用户档案，不阻塞
          this.loadUserProfile();
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        this.logout();
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 用户登录
     * @param {Object} user - 用户信息
     */
    async login(user) {
      this.user = user;
      this.isAuthenticated = true;
      
      // 加载用户档案
      await this.loadUserProfile();
    },

    /**
     * 用户登出
     */
    async logout() {
      try {
        await auth.signOut();
      } catch (error) {
        console.error('登出失败:', error);
      } finally {
        this.user = null;
        this.userProfile = null;
        this.isAuthenticated = false;
      }
    },

    /**
     * 加载用户档案
     */
    async loadUserProfile() {
      if (!this.user?.id) return;

      try {
        const result = await userProfile.getProfile(this.user.id);
        
        if (result.success) {
          this.userProfile = result.data;
        } else {
          // 如果档案不存在，创建一个
          await this.createUserProfile();
        }
      } catch (error) {
        console.error('加载用户档案失败:', error);
      }
    },

    /**
     * 创建用户档案
     */
    async createUserProfile() {
      if (!this.user?.id) return;

      try {
        const username = this.user.email.split('@')[0];
        const result = await userProfile.createProfile({
          user_id: this.user.id,
          username: username,
          email: this.user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (result.success) {
          this.userProfile = result.data;
        }
      } catch (error) {
        console.error('创建用户档案失败:', error);
      }
    },

    /**
     * 更新用户档案
     * @param {Object} updateData - 更新数据
     */
    async updateUserProfile(updateData) {
      if (!this.user?.id) return;

      try {
        const result = await userProfile.updateProfile(this.user.id, updateData);
        
        if (result.success) {
          // 重新加载用户档案
          await this.loadUserProfile();
        }
        
        return result;
      } catch (error) {
        console.error('更新用户档案失败:', error);
        return { success: false, error: error.message };
      }
    },

    /**
     * 监听认证状态变化
     */
    setupAuthListener() {
      // 使用防抖避免频繁触发
      let timeoutId = null;
      
      auth.onAuthStateChange((event, session) => {
        // 清除之前的定时器
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        
        // 防抖处理
        timeoutId = setTimeout(() => {
          if (event === 'SIGNED_IN' && session?.user) {
            this.login(session.user);
          } else if (event === 'SIGNED_OUT') {
            this.logout();
          }
        }, 100);
      });
    }
  }
});
