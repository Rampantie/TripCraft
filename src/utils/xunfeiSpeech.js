/**
 * 科大讯飞语音识别 WebAPI 工具类
 * 支持批量音频识别功能
 */

import CryptoJS from 'crypto-js';

class XunfeiSpeechRecognition {
  constructor() {
    // 尝试从环境变量获取，如果没有则使用默认值
    this.appId = process.env.VUE_APP_XUNFEI_APP_ID;
    this.apiSecret = process.env.VUE_APP_XUNFEI_API_SECRET;
    this.apiKey = process.env.VUE_APP_XUNFEI_API_KEY;
    
    // 调试：输出环境变量状态
    console.log('科大讯飞API配置状态:');
    console.log('APP_ID:', this.appId ? `${this.appId.substring(0, 8)}...` : '未配置');
    console.log('API_SECRET:', this.apiSecret ? `${this.apiSecret.substring(0, 8)}...` : '未配置');
    console.log('API_KEY:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : '未配置');
    console.log('环境变量来源:', process.env.VUE_APP_XUNFEI_APP_ID ? '环境变量' : '默认值');
    
    // 回调函数
    this.onResult = null;
    this.onError = null;
  }

  /**
   * 生成WebSocket认证URL
   * 根据科大讯飞官方文档：https://www.xfyun.cn/doc/spark/spark_zh_iat.html
   */
  generateAuthUrl() {
    // 检查API密钥配置
    if (!this.appId || !this.apiSecret || !this.apiKey) {
      console.error('科大讯飞API配置检查:');
      console.error('APP_ID:', this.appId ? '已配置' : '未配置');
      console.error('API_SECRET:', this.apiSecret ? '已配置' : '未配置');
      console.error('API_KEY:', this.apiKey ? '已配置' : '未配置');
      throw new Error('科大讯飞API密钥未正确配置，请检查环境变量');
    }

    const host = 'iat-api.xfyun.cn';
    const path = '/v2/iat';
    const method = 'GET';
    
    // 生成时间戳
    const date = new Date().toUTCString();
    
    // 生成签名字符串
    const signatureOrigin = `host: ${host}\ndate: ${date}\n${method} ${path} HTTP/1.1`;
    
    try {
      // 使用HMAC-SHA256生成签名
      const signature = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret);
      if (!signature) {
        throw new Error('HMAC签名生成失败');
      }
      
      const signatureBase64 = CryptoJS.enc.Base64.stringify(signature);
      
      // 生成authorization
      const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureBase64}"`;
      const authorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));
      
      // 构建WebSocket URL
      const params = new URLSearchParams({
        authorization: authorization,
        date: date,
        host: host
      });
      
      const wsUrl = `wss://${host}${path}?${params.toString()}`;
      console.log('生成的WebSocket URL长度:', wsUrl.length);
      console.log('URL参数:', {
        host: host,
        date: date,
        authorization: authorization.substring(0, 50) + '...'
      });
      
      return wsUrl;
    } catch (error) {
      console.error('生成认证URL失败:', error);
      throw new Error('生成认证URL失败: ' + error.message);
    }
  }

  /**
   * 识别音频文件
   * @param {Blob} audioBlob 音频数据
   */
  async recognizeAudio(audioBlob) {
    try {
      console.log('开始识别音频，大小:', audioBlob.size);
      
      // 转换音频格式为PCM
      const pcmData = await this.convertToPCM(audioBlob);
      
      // 连接WebSocket并发送音频
      await this.sendAudioToAPI(pcmData);
      
    } catch (error) {
      console.error('音频识别失败:', error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }

  /**
   * 将音频转换为PCM格式
   */
  async convertToPCM(audioBlob) {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // 重采样到16kHz
          const targetSampleRate = 16000;
          const resampledBuffer = this.resampleAudio(audioBuffer, targetSampleRate);
          
          // 转换为PCM格式
          const pcmData = this.audioBufferToPCM(resampledBuffer);
          resolve(pcmData);
        } catch (error) {
          reject(new Error('音频格式转换失败: ' + error.message));
        }
      };
      
      fileReader.onerror = () => reject(new Error('读取音频文件失败'));
      fileReader.readAsArrayBuffer(audioBlob);
    });
  }

  /**
   * 重采样音频到指定采样率
   */
  resampleAudio(audioBuffer, targetSampleRate) {
    const sourceSampleRate = audioBuffer.sampleRate;
    const sourceLength = audioBuffer.length;
    const targetLength = Math.round(sourceLength * targetSampleRate / sourceSampleRate);
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const resampledBuffer = audioContext.createBuffer(1, targetLength, targetSampleRate);
    
    const sourceData = audioBuffer.getChannelData(0);
    const targetData = resampledBuffer.getChannelData(0);
    
    for (let i = 0; i < targetLength; i++) {
      const sourceIndex = i * sourceSampleRate / targetSampleRate;
      const index = Math.floor(sourceIndex);
      const fraction = sourceIndex - index;
      
      if (index + 1 < sourceLength) {
        targetData[i] = sourceData[index] * (1 - fraction) + sourceData[index + 1] * fraction;
      } else {
        targetData[i] = sourceData[index] || 0;
      }
    }
    
    return resampledBuffer;
  }

  /**
   * 将AudioBuffer转换为PCM数据
   */
  audioBufferToPCM(audioBuffer) {
    const channelData = audioBuffer.getChannelData(0);
    const pcmData = new Int16Array(channelData.length);
    
    for (let i = 0; i < channelData.length; i++) {
      // 将浮点数转换为16位整数
      pcmData[i] = Math.max(-32768, Math.min(32767, Math.floor(channelData[i] * 32768)));
    }
    
    return pcmData;
  }

  /**
   * 发送音频到API进行识别
   */
  async sendAudioToAPI(pcmData) {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.generateAuthUrl();
        const ws = new WebSocket(wsUrl);
        let resultText = '';
        let timeoutId = null;
        
        // 设置超时机制（30秒）
        const setupTimeout = () => {
          timeoutId = setTimeout(() => {
            console.log('识别超时，返回当前结果:', resultText);
            ws.close();
            if (resultText) {
              if (this.onResult) {
                this.onResult(resultText);
              }
              resolve(resultText);
            } else {
              reject(new Error('识别超时且无结果'));
            }
          }, 30000);
        };
        
        const clearTimeoutIfExists = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        };

        ws.onopen = () => {
          console.log('WebSocket连接已建立');
          
          // 发送开始帧
          const startFrame = {
            common: {
              app_id: this.appId
            },
            business: {
              language: "zh_cn",
              domain: "iat",
              accent: "mandarin",
              vinfo: 1,
              vad_eos: 10000
            },
            data: {
              status: 0,
              format: "audio/L16;rate=16000",
              encoding: "raw",
              audio: ""
            }
          };
          
          console.log('发送开始帧:', JSON.stringify(startFrame, null, 2));
          
          ws.send(JSON.stringify(startFrame));
          
          // 启动超时计时器
          setupTimeout();
          
          // 分块发送音频数据
          this.sendAudioInChunks(ws, pcmData);
        };

        ws.onmessage = (event) => {
          const response = JSON.parse(event.data);
          console.log('收到响应:', response);
          
          // 检查API错误 - v2版本直接使用code字段
          if (response.code !== 0) {
            console.error('API错误详情:');
            console.error('错误代码:', response.code);
            console.error('错误消息:', response.message);
            console.error('完整响应:', response);
            reject(new Error(`API错误 ${response.code}: ${response.message || '识别失败'}`));
            return;
          }

          // 处理识别结果 - v2版本使用data字段
          if (response.data && response.data.result) {
            const result = response.data.result;
            console.log('收到识别数据:', result);
            
            if (result.ws) {
              let text = '';
              for (const ws of result.ws) {
                for (const cw of ws.cw) {
                  text += cw.w;
                }
              }
              
              if (text) {
                resultText += text;
                console.log('当前识别结果:', text);
                console.log('累计识别结果:', resultText);
              }
            }
            
            // 检查是否是最终结果 - v2版本使用data.status
            if (response.data.status === 2) {
              console.log('识别完成，最终结果:', resultText);
              clearTimeoutIfExists();
              if (this.onResult) {
                this.onResult(resultText);
              }
              resolve(resultText);
            }
          } else {
            // 处理非识别数据的响应（如连接确认等）
            console.log('收到非识别数据响应:', response);
            
            // 如果是连接成功的响应，继续等待识别结果
            if (response.code === 0 && response.message === 'success') {
              console.log('连接成功，等待识别结果...');
            }
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket错误:', error);
          clearTimeoutIfExists();
          reject(new Error('WebSocket连接失败'));
        };

        ws.onclose = () => {
          console.log('WebSocket连接已关闭');
          clearTimeoutIfExists();
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 分块发送音频数据
   */
  sendAudioInChunks(ws, pcmData) {
    const chunkSize = 1280; // 每次发送1280字节 (约40ms的音频)
    let offset = 0;
    
    console.log('开始分块发送音频，总大小:', pcmData.length, '字节');
    
    const sendChunk = () => {
      if (offset >= pcmData.length) {
        // 发送结束帧
        const endFrame = {
          data: {
            status: 2,
            format: "audio/L16;rate=16000",
            encoding: "raw",
            audio: ""
          }
        };
        console.log('发送结束帧');
        ws.send(JSON.stringify(endFrame));
        return;
      }
      
      const chunk = pcmData.slice(offset, offset + chunkSize);
      const base64Audio = this.pcmToBase64(chunk);
      
      const audioFrame = {
        data: {
          status: 1,
          format: "audio/L16;rate=16000",
          encoding: "raw",
          audio: base64Audio
        }
      };
      
      console.log(`发送音频块 ${Math.floor(offset / chunkSize) + 1}/${Math.ceil(pcmData.length / chunkSize)}, 大小: ${chunk.length} 字节`);
      ws.send(JSON.stringify(audioFrame));
      offset += chunkSize;
      
      // 延迟发送下一块，模拟实时音频流
      setTimeout(sendChunk, 40);
    };
    
    // 开始发送
    setTimeout(sendChunk, 100);
  }

  /**
   * PCM数据转Base64
   */
  pcmToBase64(pcmData) {
    // 将Int16Array转换为ArrayBuffer
    const buffer = new ArrayBuffer(pcmData.length * 2);
    const view = new DataView(buffer);
    
    for (let i = 0; i < pcmData.length; i++) {
      view.setInt16(i * 2, pcmData[i], true); // little-endian
    }
    
    // 转换为Base64
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * 设置回调函数
   */
  setCallbacks({ onResult, onError }) {
    this.onResult = onResult;
    this.onError = onError;
  }
}

// 创建单例实例
const xunfeiSpeech = new XunfeiSpeechRecognition();

export default xunfeiSpeech;
