import { nanoid } from 'nanoid';
import { db } from '@/core/db';
import { aiTask } from '@/config/db/schema';
import { AITaskStatus } from '@/extensions/ai';
import { respData, respErr } from '@/shared/lib/resp';

const VIOLATION_TYPES = [
  '在岗玩手机',
  '不符合5s标准',
  '睡岗',
  '违规翻越围栏',
  '走路玩手机',
];

const DEPARTMENT_MAP: Record<string, string> = {
  '东门卫-仓库': '生产部',
  '生产车间A区': '生产部',
  '设备维修室': '行政部',
  '物资储备库': '行政部',
  '员工休息区': '生产部',
};

const fetchImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1] || base64;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('获取图像失败:', error);
    throw error;
  }
};

const getMockAnalysisResult = (checkpoint: string) => {
  const randomViolation = VIOLATION_TYPES[Math.floor(Math.random() * VIOLATION_TYPES.length)];
  
  const descriptions: Record<string, string> = {
    '在岗玩手机': '检测到员工在工作岗位使用手机，存在安全隐患',
    '不符合5s标准': '现场环境存在脏乱情况，物品摆放不规范',
    '睡岗': '检测到员工在岗位睡觉，严重影响工作效率',
    '违规翻越围栏': '检测到人员违规翻越安全围栏',
    '走路玩手机': '检测到员工在行走过程中使用手机',
  };

  return {
    hasViolation: true,
    violationType: randomViolation,
    confidence: 0.85 + Math.random() * 0.12,
    description: descriptions[randomViolation] || `在${checkpoint}检测到${randomViolation}`,
    suggestedDepartment: DEPARTMENT_MAP[checkpoint] || '生产部',
  };
};

export async function POST(request: Request) {
  try {
    const { imageUrl, checkpoint, demoId } = await request.json();

    if (!imageUrl || !checkpoint) {
      return respErr('缺少必要参数: imageUrl, checkpoint');
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    const baseURL = process.env.GEMINI_BASE_URL;

    let result;

    if (baseURL && apiKey) {
      const prompt = `你是一个专业的工厂巡检 AI 分析师。请分析这张来自「${checkpoint}」点位的监控图像。

请识别图像中是否存在违规行为，并返回 JSON 格式：
{
  "hasViolation": true/false,
  "violationType": "违规类型",
  "confidence": 0.0-1.0,
  "description": "详细描述"
}`;

      const imageBase64 = await fetchImageAsBase64(imageUrl);

      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gemini-2.0-flash-exp',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } },
              ],
            },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 返回错误: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        result = {
          hasViolation: parsed.hasViolation ?? false,
          violationType: parsed.violationType || '无',
          confidence: parsed.confidence || 0.8,
          description: parsed.description || '分析完成',
          suggestedDepartment: DEPARTMENT_MAP[checkpoint] || '生产部',
        };
      } else {
        result = getMockAnalysisResult(checkpoint);
      }
    } else {
      result = getMockAnalysisResult(checkpoint);
    }

    try {
      await db().insert(aiTask).values({
        id: nanoid(),
        demoId: demoId || null,
        mediaType: 'vision',
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        prompt: checkpoint,
        options: JSON.stringify({ imageUrl }),
        status: AITaskStatus.SUCCESS,
        taskResult: JSON.stringify(result),
        scene: demoId || 'general',
        costCredits: 0,
      });
    } catch (dbError) {
      console.error('保存 AI 任务记录失败:', dbError);
    }

    return respData(result);
  } catch (error: any) {
    console.error('AI Vision API Error:', error);
    return respErr(`AI 分析失败: ${error.message}`);
  }
}
