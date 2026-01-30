import { db } from '@/core/db';
import { demo, demoFlowNode, demoFlowEdge, demoPanelConfig } from '@/config/db/schema';
import { eq, desc } from 'drizzle-orm';
import { respData, respErr } from '@/shared/lib/resp';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';

    const demos = await db()
      .select({
        id: demo.id,
        title: demo.title,
        slug: demo.slug,
        description: demo.description,
        valueProp: demo.valueProp,
        coverImage: demo.coverImage,
        category: demo.category,
        config: demo.config,
        sort: demo.sort,
      })
      .from(demo)
      .where(eq(demo.status, status))
      .orderBy(desc(demo.sort));

    // 获取所有 Demo 的工作流数据
    const demoIds = demos.map(d => d.id);
    
    // 获取所有节点
    const allNodes = demoIds.length > 0 
      ? await db()
          .select()
          .from(demoFlowNode)
          .where(eq(demoFlowNode.demoId, demoIds[0])) // 简化处理，实际应该用 in
      : [];
    
    // 获取所有连接线
    const allEdges = demoIds.length > 0
      ? await db()
          .select()
          .from(demoFlowEdge)
          .where(eq(demoFlowEdge.demoId, demoIds[0]))
      : [];
    
    // 获取所有面板配置
    const allPanelConfigs = demoIds.length > 0
      ? await db()
          .select()
          .from(demoPanelConfig)
          .where(eq(demoPanelConfig.demoId, demoIds[0]))
      : [];

    const parsedDemos = await Promise.all(demos.map(async (d: any) => {
      // 为每个 Demo 获取其工作流数据
      const nodes = await db()
        .select()
        .from(demoFlowNode)
        .where(eq(demoFlowNode.demoId, d.id))
        .orderBy(demoFlowNode.sort);
      
      const edges = await db()
        .select()
        .from(demoFlowEdge)
        .where(eq(demoFlowEdge.demoId, d.id));
      
      const [panelConfig] = await db()
        .select()
        .from(demoPanelConfig)
        .where(eq(demoPanelConfig.demoId, d.id));

      return {
        ...d,
        config: d.config ? JSON.parse(d.config) : null,
        flowNodes: nodes,
        flowEdges: edges,
        panelConfig: panelConfig
          ? {
              ...panelConfig,
              keyNodes: panelConfig.keyNodes ? JSON.parse(panelConfig.keyNodes) : [],
            }
          : null,
      };
    }));

    return respData(parsedDemos);
  } catch (e: any) {
    console.error('get demo list failed:', e);
    return respErr(`获取 Demo 列表失败: ${e.message}`);
  }
}
