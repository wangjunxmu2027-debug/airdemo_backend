import { db } from '@/core/db';
import { demo, demoFlowNode, demoFlowEdge, demoPanelConfig } from '@/config/db/schema';
import { eq, desc } from 'drizzle-orm';
import { respData, respErr } from '@/shared/lib/resp';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 获取 Demo 基本信息
    const [demoData] = await db()
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
      .where(eq(demo.slug, slug));

    if (!demoData) {
      return respErr('Demo not found', 404);
    }

    // 获取工作流节点
    const nodes = await db()
      .select({
        id: demoFlowNode.id,
        nodeKey: demoFlowNode.nodeKey,
        title: demoFlowNode.title,
        description: demoFlowNode.description,
        icon: demoFlowNode.icon,
        color: demoFlowNode.color,
        posX: demoFlowNode.posX,
        posY: demoFlowNode.posY,
        sort: demoFlowNode.sort,
      })
      .from(demoFlowNode)
      .where(eq(demoFlowNode.demoId, demoData.id))
      .orderBy(demoFlowNode.sort);

    // 获取连接线
    const edges = await db()
      .select({
        id: demoFlowEdge.id,
        sourceNodeKey: demoFlowEdge.sourceNodeKey,
        targetNodeKey: demoFlowEdge.targetNodeKey,
      })
      .from(demoFlowEdge)
      .where(eq(demoFlowEdge.demoId, demoData.id));

    // 获取面板配置
    const [panelConfig] = await db()
      .select({
        videoUrl: demoPanelConfig.videoUrl,
        docUrl: demoPanelConfig.docUrl,
        description: demoPanelConfig.description,
        keyNodes: demoPanelConfig.keyNodes,
      })
      .from(demoPanelConfig)
      .where(eq(demoPanelConfig.demoId, demoData.id));

    const result = {
      ...demoData,
      config: demoData.config ? JSON.parse(demoData.config) : null,
      flowNodes: nodes,
      flowEdges: edges,
      panelConfig: panelConfig
        ? {
            ...panelConfig,
            keyNodes: panelConfig.keyNodes ? JSON.parse(panelConfig.keyNodes) : [],
          }
        : null,
    };

    return respData(result);
  } catch (e: any) {
    console.error('get demo detail failed:', e);
    return respErr(`获取 Demo 详情失败: ${e.message}`);
  }
}
