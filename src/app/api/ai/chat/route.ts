import { respData, respErr } from '@/shared/lib/resp';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return respErr('缺少 message 参数');
    }

    const AILY_CHAT_ENDPOINT = process.env.AILY_CHAT_ENDPOINT;

    if (!AILY_CHAT_ENDPOINT) {
      const fallbacks: Record<string, string> = {
        '探探': '探探适合做互动式客户调研，自动生成调研总结',
        '睿睿': '睿睿适合做汇报复盘：金句、干系人洞察、故事线',
        '巡检': '可以直接点击首页里的「AI 智能巡检」卡片进入演示',
      };

      const lower = message.toLowerCase();
      let answer = '收到。如果你想了解更多，可以直接从首页卡片进入 Demo';

      for (const [key, value] of Object.entries(fallbacks)) {
        if (message.includes(key) || lower.includes(key.toLowerCase())) {
          answer = value;
          break;
        }
      }

      return respData({ answer });
    }

    const response = await fetch(AILY_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return respData(data);
  } catch (error: any) {
    console.error('AI Chat API Error:', error);
    return respData({ answer: '抱歉，我现在无法回答你的问题。请稍后再试。' });
  }
}
