'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface FlowNode {
  id?: string;
  nodeKey: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  posX: number;
  posY: number;
  sort: number;
}

interface FlowEdge {
  id?: string;
  sourceNodeKey: string;
  targetNodeKey: string;
}

interface PanelConfig {
  videoUrl: string;
  docUrl: string;
  description: string;
  keyNodes: string[];
}

const ICON_OPTIONS = [
  'Brain', 'Camera', 'CheckSquare', 'MessageSquare', 'Monitor', 'Play',
  'Eye', 'Edit', 'Trash', 'Plus', 'ArrowRight', 'Zap', 'Clock', 'Home'
];

const COLOR_OPTIONS = [
  'bg-blue-500', 'bg-purple-500', 'bg-indigo-500', 'bg-pink-500',
  'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500',
  'bg-cyan-500', 'bg-teal-500'
];

export default function DemoFlowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const demoId = params.id as string;

  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [panelConfig, setPanelConfig] = useState<PanelConfig>({
    videoUrl: '',
    docUrl: '',
    description: '',
    keyNodes: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 加载数据
  useEffect(() => {
    if (demoId) {
      loadFlowData();
    }
  }, [demoId]);

  const loadFlowData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/demo/${demoId}/flow`);
      const json = await res.json();
      console.log('API response:', json);
      if (json.code === 0) {
        const nodesData = json.data.nodes || [];
        const edgesData = json.data.edges || [];
        console.log('Setting nodes:', nodesData.length, nodesData);
        console.log('Setting edges:', edgesData.length, edgesData);
        setNodes(nodesData);
        setEdges(edgesData);
        if (json.data.panelConfig) {
          const keyNodesData = json.data.panelConfig.keyNodes
            ? JSON.parse(json.data.panelConfig.keyNodes)
            : [];
          setPanelConfig({
            videoUrl: json.data.panelConfig.videoUrl || '',
            docUrl: json.data.panelConfig.docUrl || '',
            description: json.data.panelConfig.description || '',
            keyNodes: keyNodesData,
          });
        }
      } else {
        toast.error(json.message || '加载失败');
      }
    } catch (e) {
      console.error('Load error:', e);
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加节点
  const addNode = () => {
    const newNode: FlowNode = {
      nodeKey: `node-${Date.now()}`,
      title: '新节点',
      description: '',
      icon: 'Brain',
      color: 'bg-blue-500',
      posX: 0,
      posY: 0,
      sort: nodes.length,
    };
    setNodes([...nodes, newNode]);
  };

  // 删除节点
  const removeNode = (index: number) => {
    const nodeKey = nodes[index].nodeKey;
    setNodes(nodes.filter((_, i) => i !== index));
    // 同时删除相关的连接线
    setEdges(edges.filter(e => e.sourceNodeKey !== nodeKey && e.targetNodeKey !== nodeKey));
  };

  // 更新节点
  const updateNode = (index: number, field: keyof FlowNode, value: any) => {
    const newNodes = [...nodes];
    newNodes[index] = { ...newNodes[index], [field]: value };
    setNodes(newNodes);
  };

  // 添加连接线
  const addEdge = () => {
    if (nodes.length < 2) {
      toast.error('至少需要两个节点才能创建连接');
      return;
    }
    setEdges([...edges, { sourceNodeKey: nodes[0].nodeKey, targetNodeKey: nodes[1].nodeKey }]);
  };

  // 删除连接线
  const removeEdge = (index: number) => {
    setEdges(edges.filter((_, i) => i !== index));
  };

  // 更新连接线
  const updateEdge = (index: number, field: keyof FlowEdge, value: string) => {
    const newEdges = [...edges];
    newEdges[index] = { ...newEdges[index], [field]: value };
    setEdges(newEdges);
  };

  // 保存
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/demo/${demoId}/flow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          panelConfig: {
            ...panelConfig,
            keyNodes: panelConfig.keyNodes,
          },
        }),
      });
      const json = await res.json();
      if (json.code === 0) {
        toast.success('保存成功');
      } else {
        toast.error(json.message || '保存失败');
      }
    } catch (e) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 添加关键节点
  const addKeyNode = () => {
    setPanelConfig({
      ...panelConfig,
      keyNodes: [...panelConfig.keyNodes, ''],
    });
  };

  // 更新关键节点
  const updateKeyNode = (index: number, value: string) => {
    const newKeyNodes = [...panelConfig.keyNodes];
    newKeyNodes[index] = value;
    setPanelConfig({ ...panelConfig, keyNodes: newKeyNodes });
  };

  // 删除关键节点
  const removeKeyNode = (index: number) => {
    setPanelConfig({
      ...panelConfig,
      keyNodes: panelConfig.keyNodes.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">工作流配置</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 左侧：节点和连接线 */}
        <div className="space-y-6">
          {/* 节点配置 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>流程节点 ({nodes.length})</CardTitle>
              <Button size="sm" onClick={addNode}>
                <Plus className="w-4 h-4 mr-1" />
                添加节点
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {nodes.map((node, index) => (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: node.color.replace('bg-', '#') }}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">节点 {index + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeNode(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">标识符</Label>
                        <Input
                          value={node.nodeKey}
                          onChange={(e) => updateNode(index, 'nodeKey', e.target.value)}
                          placeholder="如: camera-input"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">标题</Label>
                        <Input
                          value={node.title}
                          onChange={(e) => updateNode(index, 'title', e.target.value)}
                          placeholder="节点标题"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">描述</Label>
                      <Textarea
                        value={node.description}
                        onChange={(e) => updateNode(index, 'description', e.target.value)}
                        placeholder="节点描述"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">图标</Label>
                        <select
                          value={node.icon}
                          onChange={(e) => updateNode(index, 'icon', e.target.value)}
                          className="w-full h-9 px-2 border rounded-md text-sm"
                        >
                          {ICON_OPTIONS.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">颜色</Label>
                        <select
                          value={node.color}
                          onChange={(e) => updateNode(index, 'color', e.target.value)}
                          className="w-full h-9 px-2 border rounded-md text-sm"
                        >
                          {COLOR_OPTIONS.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">排序</Label>
                        <Input
                          type="number"
                          value={node.sort}
                          onChange={(e) => updateNode(index, 'sort', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">X 坐标</Label>
                        <Input
                          type="number"
                          value={node.posX}
                          onChange={(e) => updateNode(index, 'posX', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Y 坐标</Label>
                        <Input
                          type="number"
                          value={node.posY}
                          onChange={(e) => updateNode(index, 'posY', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {nodes.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  暂无节点，点击上方按钮添加
                </div>
              )}
            </CardContent>
          </Card>

          {/* 连接线配置 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>连接线</CardTitle>
              <Button size="sm" onClick={addEdge}>
                <Plus className="w-4 h-4 mr-1" />
                添加连接
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {edges.map((edge, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <select
                    value={edge.sourceNodeKey}
                    onChange={(e) => updateEdge(index, 'sourceNodeKey', e.target.value)}
                    className="flex-1 h-9 px-2 border rounded-md text-sm"
                  >
                    {nodes.map(node => (
                      <option key={node.nodeKey} value={node.nodeKey}>{node.title}</option>
                    ))}
                  </select>
                  <span className="text-muted-foreground">→</span>
                  <select
                    value={edge.targetNodeKey}
                    onChange={(e) => updateEdge(index, 'targetNodeKey', e.target.value)}
                    className="flex-1 h-9 px-2 border rounded-md text-sm"
                  >
                    {nodes.map(node => (
                      <option key={node.nodeKey} value={node.nodeKey}>{node.title}</option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeEdge(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {edges.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  暂无连接线
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：面板配置 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>右侧面板配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>演示视频 URL</Label>
                <Input
                  value={panelConfig.videoUrl}
                  onChange={(e) => setPanelConfig({ ...panelConfig, videoUrl: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              <div className="space-y-2">
                <Label>说明文档链接</Label>
                <Input
                  value={panelConfig.docUrl}
                  onChange={(e) => setPanelConfig({ ...panelConfig, docUrl: e.target.value })}
                  placeholder="https://example.com/doc"
                />
              </div>
              <div className="space-y-2">
                <Label>流程说明</Label>
                <Textarea
                  value={panelConfig.description}
                  onChange={(e) => setPanelConfig({ ...panelConfig, description: e.target.value })}
                  placeholder="输入流程说明文字..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>关键节点</Label>
                  <Button size="sm" variant="outline" onClick={addKeyNode}>
                    <Plus className="w-4 h-4 mr-1" />
                    添加
                  </Button>
                </div>
                <div className="space-y-2">
                  {panelConfig.keyNodes.map((node, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <Input
                        value={node}
                        onChange={(e) => updateKeyNode(index, e.target.value)}
                        placeholder="节点标题"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeKeyNode(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
