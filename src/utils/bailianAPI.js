/**
 * 阿里云百炼大模型API工具
 * 用于生成旅行计划
 * 
 * 通过后端代理服务器调用阿里云百炼API
 */

class BailianAPI {
  constructor() {
    this.apiKey = process.env.VUE_APP_BAILIAN_API_KEY;
    this.baseURL = 'https://dashscope.aliyuncs.com/api/v1';
    this.model = 'qwen-plus'; // 使用通义千问模型
  }

  /**
   * 生成旅行计划
   * @param {string} userRequest 用户需求描述
   * @param {Object} userPreferences 用户偏好设置
   * @returns {Promise<Object>} 旅行计划数据
   */
  async generateTripPlan(userRequest, userPreferences = null) {
    try {
      console.log('🤖 [阿里云百炼API] 开始生成旅行计划');
      console.log('📝 [阿里云百炼API] 用户需求:', userRequest);
      console.log('👤 [阿里云百炼API] 用户偏好:', userPreferences);

      // 调用后端代理服务器
      const response = await fetch('http://localhost:3001/api/generate-trip-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userRequest,
          userPreferences: userPreferences || {
            attractionType: 'mixed',
            travelPace: 'moderate',
            accommodation: 'comfortable',
            transportation: 'mixed'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`后端API调用失败: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '旅行计划生成失败');
      }

      console.log('✅ [阿里云百炼API] 旅行计划生成成功:', result.data);
      return result.data;

    } catch (error) {
      console.error('❌ [阿里云百炼API] 生成旅行计划失败:', error);
      throw error;
    }
  }




}

// 创建单例实例
const bailianAPI = new BailianAPI();

export default bailianAPI;
