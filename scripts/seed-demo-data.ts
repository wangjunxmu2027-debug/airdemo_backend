import { db } from '../src/core/db';
import { demo, demoStep, demoTableData, efficiencyTool } from '../src/config/db/schema';
import { nanoid } from 'nanoid';

const EXISTING_DEMOS = [
  {
    id: 'gtm',
    title: 'AI GTM | Sales Intelligence',
    slug: 'gtm',
    description: '提前发现正在流失的商机，把风险变成可执行的销售行动',
    valueProp: '提前发现正在流失的商机，把风险变成可执行的销售行动',
    coverImage: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%883.35.20.png',
    category: 'gtm',
    status: 'published' as const,
    sort: 1,
    config: JSON.stringify({
      points: ['会议纪要自动风险识别', '风险点自动同步商机表', '管理者实时风险预警'],
      audience: 'VP Sales / 销售负责人 / RevOps',
      aiInsights: {
        conclusion: '本周新增2项重大流失风险，涉及金额350万。',
        risks: ['决策人变动：关键对接人离职', '竞对接入：竞商提供低价试用', '预算缩减：Q4预算被冻结'],
        actions: ['触发高层公关', '提供竞对对比文档', '优化报价方案'],
        next: '立即召开风险对策会',
      },
    }),
    steps: [
      { stepOrder: 1, title: '获客阶段 - 探探', component: '探探', script: '可用于市场调研和客户需求分析，实现规模化调研一线用户，节省调研纪要整理时间', value: '实现规模化调研一线用户', fallback: '' },
      { stepOrder: 2, title: '商机阶段 - 参参', component: '参参', script: '提供方案金句推荐、客户干系人及业务研究洞察、汇报故事线及案例推荐，加速客户FP汇报准备', value: '加速客户FP汇报准备', fallback: '' },
      { stepOrder: 3, title: '商机阶段 - 呆呆', component: '呆呆', script: '一键生成demo所需定制化数据，提升准备汇报的效率', value: '提升准备汇报的效率', fallback: '' },
      { stepOrder: 4, title: '商机阶段 - 图图', component: '图图', script: '生成匹配飞书视觉风格的PPT配图，提升方案展示效果', value: '提升方案展示效果', fallback: '' },
      { stepOrder: 5, title: '签约阶段 - 蕊蕊', component: '蕊蕊', script: '对方案汇报进行复盘，给出改进建议，提升销售团队整体水平', value: '提升销售团队整体水平', fallback: '' },
      { stepOrder: 6, title: '用户反馈 - 探探', component: '探探', script: '可用于收集和分析用户反馈，帮助运营团队更好地了解客户需求', value: '帮助运营团队更好地了解客户需求', fallback: '' },
      { stepOrder: 7, title: '客户培训 - 参参', component: '参参', script: '为客户提供培训内容和案例推荐，提升客户满意度和忠诚度', value: '提升客户满意度和忠诚度', fallback: '' },
    ],
    tables: {
      main: [
        { id: 'OPP-001', name: '某跨国零售数字化转型', owner: '张三', stage: '需求确认', risk: '无', budget: '100w' },
        { id: 'OPP-002', name: '连锁餐饮智能供应链', owner: '李四', stage: '方案投标', risk: '高', budget: '250w' },
        { id: 'OPP-003', name: '制造企业协同办公', owner: '王五', stage: '决策层审批', risk: '无', budget: '50w' },
      ],
    },
  },
  {
    id: 'inspection',
    title: 'AI 智能巡检 | EHS & 设备管理',
    slug: 'inspection',
    description: '通过 AI 视觉分析实现巡检自动判定与闭环整改',
    valueProp: '通过 AI 视觉分析实现巡检自动判定与闭环整改',
    coverImage: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%886.50.56.png',
    category: 'inspection',
    status: 'published' as const,
    sort: 2,
    config: JSON.stringify({
      points: ['巡检任务自动分配', '照片/视频实时 AI 审计', '低合规项自动预警'],
      audience: '工厂负责人 / EHS 主管 / 设备部经理',
      aiInsights: {
        conclusion: '过去 4 天累计执行 10 项巡检任务，平均完成率 95%，2 项任务目前处于整改中。',
        risks: ['机械维修工任务积压：电气设备绝缘检测待完成', '区域性异常：配电室巡检频次低于预设值', '低效环节：电机测试耗时波动较大'],
        actions: ['针对进行中任务下发自动化催办', '优化机械维修工的任务排班', '引入视觉 AI 深度分析电机震动数据'],
        next: '设备健康度周度例会',
      },
    }),
    steps: [
      { stepOrder: 1, title: '巡检任务执行', component: '移动端', script: '"工程师根据系统指派，在巡检点位拍照上传执行记录。"', value: '流程标准化，结果数字化', fallback: '展示当前的巡检明细' },
      { stepOrder: 2, title: 'AI 视觉核验', component: 'Aily', script: '"AI 自动分析上传的视频或图片，判定设备清洁度、仪表盘状态等指标。"', value: '客观、高效、全天候核验', fallback: '显示 AI 识别结论' },
      { stepOrder: 3, title: '整改自动化', component: 'Base 表格', script: '"对于完成率低于 100% 的任务，系统自动流转到复核环节，实现闭环。"', value: '问题不过夜，整改有回响', fallback: '刷新表格查看整改状态' },
    ],
    tables: {
      main: [
        { 编号: '1', 日期: '2025/12/16', 违规情况: '在岗玩手机', 抓取时间: '2025-12-16 08:35:42', 位置: '东门卫—仓库', 部门: '生产部' },
        { 编号: '2', 日期: '2025/12/17', 违规情况: '不符合5s标准', 抓取时间: '2025-12-17 08:30:45', 位置: '设备维修室', 部门: '行政部' },
        { 编号: '3', 日期: '2025/12/17', 违规情况: '睡岗', 抓取时间: '2025-12-17 08:30:15', 位置: '设备维修室', 部门: '行政部' },
        { 编号: '4', 日期: '2025/12/17', 违规情况: '不符合5s标准', 抓取时间: '2025-12-17 08:30:45', 位置: '物资储备库', 部门: '行政部' },
        { 编号: '5', 日期: '2025/12/18', 违规情况: '不符合5s标准', 抓取时间: '2025-12-18 09:45:12', 位置: '员工休息区', 部门: '生产部' },
        { 编号: '6', 日期: '2025/12/18', 违规情况: '睡岗', 抓取时间: '2025-12-18 09:23:45', 位置: '东门卫—仓库', 部门: '生产部' },
        { 编号: '7', 日期: '2025/12/18', 违规情况: '不符合5s标准', 抓取时间: '2025-12-18 09:45:30', 位置: '东门卫—仓库', 部门: '行政部' },
        { 编号: '8', 日期: '2025/12/18', 违规情况: '不符合5s标准', 抓取时间: '2025-12-18 09:45:22', 位置: '设备维修室', 部门: '生产部' },
        { 编号: '9', 日期: '2025/12/19', 违规情况: '走路玩手机', 抓取时间: '2025-12-19 08:30:45', 位置: '生产车间A区', 部门: '生产部' },
        { 编号: '10', 日期: '2025/12/19', 违规情况: '走路玩手机', 抓取时间: '2025-12-19 08:35:42', 位置: '物资储备库', 部门: '生产部' },
      ],
      equipment: [
        { 序列号: '1', 负责人: '李四', 任务名称: '均质机6000 - 24000小时保养', 完成率: '100%', 任务完成状态: '已完成', 风险等级: 'A级', 是否延期: '延期' },
        { 序列号: '2', 负责人: '李四', 任务名称: '压缩机日常运行检查', 完成率: '30%', 任务完成状态: '进行中', 风险等级: 'B级', 是否延期: '未延期' },
        { 序列号: '3', 负责人: '李四', 任务名称: '压缩机日常运行检查', 完成率: '20%', 任务完成状态: '进行中', 风险等级: 'C级', 是否延期: '延期' },
        { 序列号: '4', 负责人: '张三', 任务名称: '均质机6000 - 24000小时保养', 完成率: '100%', 任务完成状态: '已完成', 风险等级: 'A级', 是否延期: '延期' },
        { 序列号: '5', 负责人: '王五', 任务名称: '管道密封性检测', 完成率: '100%', 任务完成状态: '已完成', 风险等级: 'A级', 是否延期: '延期' },
        { 序列号: '6', 负责人: '王五', 任务名称: '管道密封性检测', 完成率: '60%', 任务完成状态: '进行中', 风险等级: 'B级', 是否延期: '延期' },
        { 序列号: '7', 负责人: '王五', 任务名称: '管道密封性检测', 完成率: '69%', 任务完成状态: '进行中', 风险等级: 'B级', 是否延期: '未延期' },
        { 序列号: '8', 负责人: '赵六', 任务名称: '压缩机日常运行检查', 完成率: '79%', 任务完成状态: '进行中', 风险等级: 'C级', 是否延期: '延期' },
        { 序列号: '9', 负责人: '赵六', 任务名称: '压缩机日常运行检查', 完成率: '40%', 任务完成状态: '进行中', 风险等级: 'C级', 是否延期: '延期' },
        { 序列号: '10', 负责人: '孙七', 任务名称: '均质机6000 - 24000小时保养', 完成率: '100%', 任务完成状态: '已完成', 风险等级: 'A级', 是否延期: '延期' },
      ],
      factory: [
        { 序列号: '1', 岗位: '大疆 Mavic 3', 任务名称: '不安全行为', AI识别结论: 'AI', 任务完成状态: '已完成' },
        { 序列号: '2', 岗位: 'Autel Robotics EVO Lite+', 任务名称: '设备未定期维护', AI识别结论: 'AI', 任务完成状态: '已完成' },
        { 序列号: '3', 岗位: '大疆 Mavic 3', 任务名称: '设备未定期维护', AI识别结论: 'AI', 任务完成状态: '已完成' },
        { 序列号: '4', 岗位: '大疆 Mavic 3', 任务名称: '不安全行为', AI识别结论: 'AI', 任务完成状态: '已完成' },
        { 序列号: '5', 岗位: '大疆 Mavic 3', 任务名称: '不安全行为', AI识别结论: 'AI', 任务完成状态: '已完成' },
        { 序列号: '6', 岗位: '大疆 Mavic 3', 任务名称: '电气线路老化', AI识别结论: 'AI', 任务完成状态: '已完成' },
        { 序列号: '7', 岗位: '大疆 Mavic 3', 任务名称: '设备未定期维护', AI识别结论: 'AI', 任务完成状态: '已完成' },
        { 序列号: '8', 岗位: '大疆 Mavic 3', 任务名称: '废水废气违规排放', AI识别结论: 'AI', 任务完成状态: '已完成' },
        { 序列号: '9', 岗位: '大疆 Mavic 3', 任务名称: '通道堵塞', AI识别结论: 'AI', 任务完成状态: '已完成' },
        { 序列号: '10', 岗位: '大疆 Mavic 3', 任务名称: '通道堵塞', AI识别结论: 'AI', 任务完成状态: '已完成' },
      ],
    },
  },
];

const EXISTING_TOOLS = [
  {
    name: 'ruirui',
    title: 'AI汇报复盘助手',
    description: '飞书助力顺丰打造AI世界中的顺丰速度',
    avatarUrl: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%8810.07.37.png',
    url: 'https://ruirui.airdemo.cn/',
    skills: ['方案金句推荐', '客户干系人及业务研究洞察', '汇报故事线及案例推荐'],
    highlight: '飞书助力顺丰打造AI世界中的顺丰速度',
    status: 'published' as const,
    sort: 1,
  },
  {
    name: 'tantan',
    title: 'AI客户调研助手',
    description: '一位参会受访的老板这样说：前一天晚上AI就把我想要关注的事项了解了',
    avatarUrl: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%20%E4%B8%8B%E5%8D%8810.07.43.png',
    url: 'https://tantan.airdemo.cn/',
    skills: ['互动式调研', '自动生成调研总结'],
    highlight: '一位参会受访的老板这样说：前一天晚上AI就把我想要关注的事项了解了',
    status: 'published' as const,
    sort: 2,
  },
  {
    name: 'daidai',
    title: 'AI Demo素材助手',
    description: '一次PoV汇报，节省了半天时间准备demo相关数据',
    avatarUrl: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%8810.07.58.png',
    url: 'https://aily.feishu.cn/agents/agent_4j12fz05we0z7',
    skills: ['一键生成demo所需定制化数据', '模拟客户真实知识库', '模拟飞阅会战略规划文档'],
    highlight: '一次PoV汇报，节省了半天时间准备demo相关数据',
    status: 'published' as const,
    sort: 3,
  },
  {
    name: 'tutu',
    title: 'AI PPT插图助手',
    description: '生成匹配飞书视觉风格的PPT配图',
    avatarUrl: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%8810.07.58.png',
    url: 'https://bytedance.larkoffice.com/app/PwQtb3EjOa4nIOsgtnBcxeMQnud',
    skills: ['生成匹配飞书视觉风格的PPT配图'],
    highlight: '认养一头牛董事长徐晓波在AI大讲堂中只拍了三页，但都是AI生成配图的PPT',
    status: 'published' as const,
    sort: 4,
  },
  {
    name: 'cancen',
    title: 'AI故事线参谋',
    description: '发见客户讲一半电脑没电了，扣了很多分',
    avatarUrl: 'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%8810.07.37.png',
    url: 'https://bytedance.larkoffice.com/share/base/form/shrcn5qfPJUyu3YJwTmWz0idEbf',
    skills: ['方案汇报自动化给出复盘建议'],
    highlight: '发见客户讲一半电脑没电了，扣了很多分',
    status: 'published' as const,
    sort: 5,
  },
];

async function seedDemos() {
  console.log('开始导入 Demo 数据...');
  
  for (const demoData of EXISTING_DEMOS) {
    try {
      const demoId = demoData.id;
      
      console.log(`导入 Demo: ${demoData.title}`);
      
      await db().insert(demo).values({
        id: demoId,
        title: demoData.title,
        slug: demoData.slug,
        description: demoData.description,
        valueProp: demoData.valueProp,
        coverImage: demoData.coverImage,
        category: demoData.category,
        status: demoData.status,
        sort: demoData.sort,
        config: demoData.config,
      });
      
      for (const step of demoData.steps) {
        await db().insert(demoStep).values({
          id: nanoid(),
          demoId,
          stepOrder: step.stepOrder,
          title: step.title,
          component: step.component,
          script: step.script,
          value: step.value,
          fallback: step.fallback,
        });
      }
      
      for (const [tableType, tableData] of Object.entries(demoData.tables)) {
        await db().insert(demoTableData).values({
          id: nanoid(),
          demoId,
          tableType,
          data: JSON.stringify(tableData),
        });
      }
      
      console.log(`✓ Demo "${demoData.title}" 导入成功`);
    } catch (error) {
      console.error(`✗ Demo "${demoData.title}" 导入失败:`, error);
    }
  }
  
  console.log('Demo 数据导入完成！');
}

async function seedTools() {
  console.log('开始导入工具数据...');
  
  for (const toolData of EXISTING_TOOLS) {
    try {
      console.log(`导入工具: ${toolData.title}`);
      
      await db().insert(efficiencyTool).values({
        id: toolData.name,
        name: toolData.name,
        title: toolData.title,
        description: toolData.description,
        avatarUrl: toolData.avatarUrl,
        url: toolData.url,
        skills: toolData.skills as any,
        highlight: toolData.highlight,
        status: toolData.status,
        sort: toolData.sort,
      });
      
      console.log(`✓ 工具 "${toolData.title}" 导入成功`);
    } catch (error) {
      console.error(`✗ 工具 "${toolData.title}" 导入失败:`, error);
    }
  }
  
  console.log('工具数据导入完成！');
}

async function main() {
  try {
    console.log('开始初始化数据...\n');
    
    await seedDemos();
    console.log('');
    await seedTools();
    
    console.log('\n✅ 所有数据导入完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据导入失败:', error);
    process.exit(1);
  }
}

main();
