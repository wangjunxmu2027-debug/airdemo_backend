import { db } from '@/core/db';
import { efficiencyTool } from '@/config/db/schema';
import { eq, desc } from 'drizzle-orm';
import { respData, respErr } from '@/shared/lib/resp';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    const status = searchParams.get('status') || 'published';

    const rows = await db()
      .select()
      .from(efficiencyTool)
      .where(eq(efficiencyTool.status, status))
      .orderBy(desc(efficiencyTool.sort));

    const origin = url.origin;
    const tools = rows.map((tool) => {
      if (tool.avatarUrl && tool.avatarUrl.startsWith('/')) {
        return { ...tool, avatarUrl: `${origin}${tool.avatarUrl}` };
      }
      return tool;
    });

    return respData(tools);
  } catch (e: any) {
    console.error('get tools failed:', e);
    return respErr(`获取工具列表失败: ${e.message}`);
  }
}
