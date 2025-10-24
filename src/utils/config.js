/**
 * 配置管理工具
 * 用于读取和管理项目配置信息
 */

class ConfigManager {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  /**
   * 加载配置文件
   */
  loadConfig() {
    // 在浏览器环境中，我们使用 import.meta.env 来获取环境变量
    // 在 Node.js 环境中，我们使用 process.env
    if (typeof window !== 'undefined') {
      // 浏览器环境
      this.config = {
        // 应用配置
        APP_TITLE: import.meta.env.VUE_APP_TITLE || 'TripCraft',
        APP_VERSION: import.meta.env.VUE_APP_VERSION || '1.0.0',
        APP_ENVIRONMENT: import.meta.env.VUE_APP_ENVIRONMENT || 'development',
        
        // API 配置
        OPENAI_API_KEY: import.meta.env.VUE_APP_OPENAI_API_KEY,
        GOOGLE_MAPS_API_KEY: import.meta.env.VUE_APP_GOOGLE_MAPS_API_KEY,
        WEATHER_API_KEY: import.meta.env.VUE_APP_WEATHER_API_KEY,
        
        // 第三方服务配置
        EMAIL_SERVICE_API_KEY: import.meta.env.VUE_APP_EMAIL_SERVICE_API_KEY,
        SMS_SERVICE_API_KEY: import.meta.env.VUE_APP_SMS_SERVICE_API_KEY,
        
        // 文件上传配置
        MAX_FILE_SIZE: parseInt(import.meta.env.VUE_APP_MAX_FILE_SIZE) || 10485760,
        ALLOWED_FILE_TYPES: (import.meta.env.VUE_APP_ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf').split(','),
        
        // 日志配置
        LOG_LEVEL: import.meta.env.VUE_APP_LOG_LEVEL || 'info',
      };
    } else {
      // Node.js 环境
      this.config = {
        // 应用配置
        APP_TITLE: process.env.VUE_APP_TITLE || 'TripCraft',
        APP_VERSION: process.env.VUE_APP_VERSION || '1.0.0',
        APP_ENVIRONMENT: process.env.VUE_APP_ENVIRONMENT || 'development',
        
        // 数据库配置
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: parseInt(process.env.DB_PORT) || 3306,
        DB_NAME: process.env.DB_NAME || 'tripcraft',
        DB_USERNAME: process.env.DB_USERNAME || 'root',
        DB_PASSWORD: process.env.DB_PASSWORD,
        
        // API 配置
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        WEATHER_API_KEY: process.env.WEATHER_API_KEY,
        
        // 第三方服务配置
        EMAIL_SERVICE_API_KEY: process.env.EMAIL_SERVICE_API_KEY,
        SMS_SERVICE_API_KEY: process.env.SMS_SERVICE_API_KEY,
        
        // 安全配置
        JWT_SECRET: process.env.JWT_SECRET,
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
        
        // 文件上传配置
        MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
        ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf').split(','),
        
        // 日志配置
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log',
      };
    }
  }

  /**
   * 获取配置值
   * @param {string} key - 配置键
   * @param {*} defaultValue - 默认值
   * @returns {*} 配置值
   */
  get(key, defaultValue = null) {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  /**
   * 设置配置值
   * @param {string} key - 配置键
   * @param {*} value - 配置值
   */
  set(key, value) {
    this.config[key] = value;
  }

  /**
   * 获取所有配置
   * @returns {Object} 所有配置
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * 检查配置是否存在
   * @param {string} key - 配置键
   * @returns {boolean} 是否存在
   */
  has(key) {
    return this.config[key] !== undefined;
  }

  /**
   * 获取数据库配置
   * @returns {Object} 数据库配置
   */
  getDatabaseConfig() {
    return {
      host: this.get('DB_HOST'),
      port: this.get('DB_PORT'),
      database: this.get('DB_NAME'),
      username: this.get('DB_USERNAME'),
      password: this.get('DB_PASSWORD'),
    };
  }

  /**
   * 获取API配置
   * @returns {Object} API配置
   */
  getApiConfig() {
    return {
      openai: this.get('OPENAI_API_KEY'),
      googleMaps: this.get('GOOGLE_MAPS_API_KEY'),
      weather: this.get('WEATHER_API_KEY'),
    };
  }

  /**
   * 获取安全配置
   * @returns {Object} 安全配置
   */
  getSecurityConfig() {
    return {
      jwtSecret: this.get('JWT_SECRET'),
      encryptionKey: this.get('ENCRYPTION_KEY'),
    };
  }

  /**
   * 验证必需的配置是否存在
   * @param {string[]} requiredKeys - 必需的配置键数组
   * @returns {Object} 验证结果
   */
  validateRequired(requiredKeys) {
    const missing = [];
    const present = [];

    requiredKeys.forEach(key => {
      if (this.has(key) && this.get(key)) {
        present.push(key);
      } else {
        missing.push(key);
      }
    });

    return {
      isValid: missing.length === 0,
      missing,
      present,
    };
  }

  /**
   * 获取环境信息
   * @returns {Object} 环境信息
   */
  getEnvironmentInfo() {
    return {
      environment: this.get('APP_ENVIRONMENT'),
      version: this.get('APP_VERSION'),
      title: this.get('APP_TITLE'),
      isDevelopment: this.get('APP_ENVIRONMENT') === 'development',
      isProduction: this.get('APP_ENVIRONMENT') === 'production',
    };
  }
}

// 创建单例实例
const configManager = new ConfigManager();

// 导出配置管理器
export default configManager;

// 导出便捷方法
export const getConfig = (key, defaultValue) => configManager.get(key, defaultValue);
export const setConfig = (key, value) => configManager.set(key, value);
export const getDatabaseConfig = () => configManager.getDatabaseConfig();
export const getApiConfig = () => configManager.getApiConfig();
export const getSecurityConfig = () => configManager.getSecurityConfig();
export const validateRequired = (keys) => configManager.validateRequired(keys);
export const getEnvironmentInfo = () => configManager.getEnvironmentInfo();
