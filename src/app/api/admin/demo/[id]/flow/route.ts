import { NextResponse } from 'next/server';
import { db } from '@/core/db';
import { demoFlowNode, demoFlowEdge, demoPanelConfig } from '@/config/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/admin/demo/[id]/flow - 获取 Demo 工作流配置
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取节点
    const nodes = await db()
      .select()
      .from(demoFlowNode)
      .where(eq(demoFlowNode.demoId, id))
      .orderBy(demoFlowNode.sort);

    // 获取连接线
    const edges = await db()
      .select()
      .from(demoFlowEdge)
      .where(eq(demoFlowEdge.demoId, id));

    // 获取面板配置
    const [panelConfig] = await db()
      .select()
      .from(demoPanelConfig)
      .where(eq(demoPanelConfig.demoId, id));

    return NextResponse.json({
      code: 0,
      data: {
        nodes,
        edges,
        panelConfig: panelConfig || null,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { code: 1, message: e.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/demo/[id]/flow - 保存 Demo 工作流配置
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 保存节点
    if (body.nodes && Array.isArray(body.nodes)) {
      // 先删除旧节点
      await db()
        .delete(demoFlowNode)
        .where(eq(demoFlowNode.demoId, id));

      // 插入新节点
      for (const node of body.nodes) {
        await db().insert(demoFlowNode).values({
          id: node.id || `${id}-node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          demoId: id,
          nodeKey: node.nodeKey,
          title: node.title,
          description: node.description || '',
          icon: node.icon || 'Brain',
          color: node.color || 'bg-blue-500',
          posX: node.posX || 0,
          posY: node.posY || 0,
          sort: node.sort || 0,
        });
      }
    }

    // 保存连接线
    if (body.edges && Array.isArray(body.edges)) {
      await db()
        .delete(demoFlowEdge)
        .where(eq(demoFlowEdge.demoId, id));

      for (const edge of body.edges) {
        await db().insert(demoFlowEdge).values({
          id: edge.id || `${id}-edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          demoId: id,
          sourceNodeKey: edge.sourceNodeKey,
          targetNodeKey: edge.targetNodeKey,
        });
      }
    }

    // 保存面板配置
    if (body.panelConfig) {
      const existing = await db()
        .select()
        .from(demoPanelConfig)
        .where(eq(demoPanelConfig.demoId, id));

      const configData = {
        demoId: id,
        videoUrl: body.panelConfig.videoUrl || '',
        docUrl: body.panelConfig.docUrl || '',
        description: body.panelConfig.description || '',
        keyNodes: body.panelConfig.keyNodes
          ? JSON.stringify(body.panelConfig.keyNodes)
          : '[]',
      };

      if (existing.length > 0) {
        await db()
          .update(demoPanelConfig)
          .set(configData)
          .where(eq(demoPanelConfig.demoId, id));
      } else {
        await db().insert(demoPanelConfig).values({
          id: `${id}-panel-${Date.now()}`,
          ...configData,
        });
      }
    }

    return NextResponse.json({ code: 0, message: 'saved' });
  } catch (e: any) {
    return NextResponse.json(
      { code: 1, message: e.message },
      { status: 500 }
    );
  }
}
