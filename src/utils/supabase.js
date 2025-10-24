/**
 * Supabase 客户端配置
 * 用于连接和管理 Supabase 数据库
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 配置
// Vue CLI 使用 process.env 而不是 import.meta.env
const supabaseUrl = process.env.VUE_APP_SUPABASE_URL || 'https://ioqqsydayblyodbrgzmb.supabase.co';
const supabaseAnonKey = process.env.VUE_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvcXFzeWRheWJseW9kYnJnem1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjE4NzIsImV4cCI6MjA3NjczNzg3Mn0.CoIxtBTTYVMmxWpmZurv2GhfWc-3Xb8jbNn1K94kf54';

// 验证配置
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? '已配置' : '未配置');

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 用户认证相关方法
 */
export const auth = {
  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @param {Object} metadata - 用户元数据
   * @returns {Promise<Object>} 注册结果
   */
  async signUp(userData, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            ...metadata
          }
        }
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: '注册成功！用户名已自动生成，请检查您的邮箱以验证账户。'
      };
    } catch (error) {
      console.error('注册失败:', error);
      return {
        success: false,
        error: error.message,
        message: this.getErrorMessage(error)
      };
    }
  },

  /**
   * 用户登录
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @returns {Promise<Object>} 登录结果
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: '登录成功！'
      };
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        error: error.message,
        message: this.getErrorMessage(error)
      };
    }
  },

  /**
   * 用户登出
   * @returns {Promise<Object>} 登出结果
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      return {
        success: true,
        message: '已成功登出'
      };
    } catch (error) {
      console.error('登出失败:', error);
      return {
        success: false,
        error: error.message,
        message: '登出失败'
      };
    }
  },

  /**
   * 获取当前用户
   * @returns {Object|null} 当前用户信息
   */
  getCurrentUser() {
    return supabase.auth.getUser();
  },

  /**
   * 监听认证状态变化
   * @param {Function} callback - 回调函数
   * @returns {Object} 订阅对象
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * 获取错误信息的中文翻译
   * @param {Object} error - 错误对象
   * @returns {string} 中文错误信息
   */
  getErrorMessage(error) {
    const errorMessages = {
      'Invalid login credentials': '邮箱或密码错误',
      'User already registered': '该邮箱已被注册',
      'Password should be at least 6 characters': '密码至少需要6位字符',
      'Invalid email': '邮箱格式不正确',
      'Email not confirmed': '请先验证您的邮箱',
      'Too many requests': '请求过于频繁，请稍后再试',
      'User not found': '用户不存在',
      'Invalid password': '密码错误',
      'Email address is already in use': '该邮箱已被使用',
      'Password is too weak': '密码强度不够',
      'Signup is disabled': '注册功能已禁用'
    };

    return errorMessages[error.message] || error.message || '操作失败，请重试';
  }
};

/**
 * 用户数据管理
 */
export const userProfile = {
  /**
   * 创建用户档案
   * @param {Object} profileData - 用户档案数据
   * @returns {Promise<Object>} 创建结果
   */
  async createProfile(profileData) {
    try {
      // 使用服务角色密钥来绕过RLS策略
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData]);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: '用户档案创建成功'
      };
    } catch (error) {
      console.error('创建用户档案失败:', error);
      return {
        success: false,
        error: error.message,
        message: '创建用户档案失败'
      };
    }
  },

  /**
   * 获取用户档案
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 用户档案
   */
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: '获取用户档案成功'
      };
    } catch (error) {
      console.error('获取用户档案失败:', error);
      return {
        success: false,
        error: error.message,
        message: '获取用户档案失败'
      };
    }
  },

  /**
   * 更新用户档案
   * @param {string} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateProfile(userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: '用户档案更新成功'
      };
    } catch (error) {
      console.error('更新用户档案失败:', error);
      return {
        success: false,
        error: error.message,
        message: '更新用户档案失败'
      };
    }
  }
};

/**
 * 数据库连接测试
 * @returns {Promise<Object>} 测试结果
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: '数据库连接正常'
    };
  } catch (error) {
    console.error('数据库连接失败:', error);
    return {
      success: false,
      error: error.message,
      message: '数据库连接失败'
    };
  }
}

// 导出 Supabase 客户端
export default supabase;
