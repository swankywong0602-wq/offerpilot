// ========== OpenAI API 调用封装 ==========

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function chatCompletion(messages: ChatMessage[], temperature = 0.7): Promise<string> {
  if (!OPENAI_API_KEY) {
    // 无 API Key 时返回模拟数据，便于开发调试
    return simulateResponse(messages);
  }

  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API 调用失败 (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// 模拟 AI 响应（开发用，不需要 API Key）
function simulateResponse(messages: ChatMessage[]): string {
  const lastMsg = messages[messages.length - 1]?.content || '';

  if (lastMsg.includes('评分') || lastMsg.includes('分析')) {
    return JSON.stringify({
      score: 78,
      strengths: [
        '项目经历紧扣岗位需求，技术栈匹配度较高',
        '教育背景清晰，金融科技专业与目标行业高度吻合',
        '具备微信小程序全栈开发经验，展示出较强的动手能力',
      ],
      weaknesses: [
        '缺乏实习经历，简历中存在明显的经历空白',
        '部分技能描述过于笼统，缺少量化成果和数据支撑',
        '格式排版可以进一步优化，目前略显拥挤',
      ],
      atsScore: 65,
      suggestions: JSON.stringify([
        {
          section: '教育背景',
          original: '教育信息',
          improved: '补充GPA（如3.5以上）、相关课程成绩和学术荣誉',
          reason: '量化教育成果可以增强说服力，尤其对金融科技岗位',
        },
        {
          section: '项目经历',
          original: '项目描述',
          improved: '每个项目加入技术指标、用户数据和成果对比',
          reason: '用数据说话能让招聘官快速评估你的能力水平',
        },
        {
          section: '实习经历',
          original: '无实习经历',
          improved: '将课程项目改写为项目经历，突出商业价值和实际影响',
          reason: '没有正式实习时，把最好的项目经验前置展示',
        },
      ]),
    });
  }

  if (lastMsg.includes('优化') || lastMsg.includes('重写')) {
    return '优化后的简历内容已生成，包含以下改进：\n\n1. 量化了项目成果（如"用户留存率提升20%"）\n2. 强化了技能关键词密度（金融科技、数据分析、AI应用）\n3. 调整了排版层级，核心信息更突出\n4. 增加了动词开头的行动描述，更具冲击力\n\n（接入 OpenAI API 后将获得完整优化版本）';
  }

  if (lastMsg.includes('面试') || lastMsg.includes('问题')) {
    return JSON.stringify([
      {
        id: '1',
        category: '技术能力',
        question: '请描述你在金融科技项目中如何处理数据隐私和安全问题？',
        hint: '结合 GDPR、数据脱敏、加密算法等技术点回答',
      },
      {
        id: '2',
        category: '项目经验',
        question: '你在团队项目中遇到的的最大挑战是什么？如何解决的？',
        hint: '用 STAR 法则（情境-任务-行动-结果）组织回答',
      },
      {
        id: '3',
        category: '金融知识',
        question: '如果让你设计一个信用评分模型，你会考虑哪些变量？',
        hint: '提到 FICO 五大因素：还款历史、欠款比例、信用历史长度、新信用、信用类型',
      },
      {
        id: '4',
        category: '行为面试',
        question: '假设项目deadline临近但核心功能有bug，你会怎么决策？',
        hint: '展示优先级判断、沟通能力和抗压能力',
      },
      {
        id: '5',
        category: 'SAP相关',
        question: '你对 SAP FICO 模块了解多少？请举个例子。',
        hint: '结合课程所学，说明总账、应收应付、资产会计等核心概念',
      },
    ]);
  }

  if (lastMsg.includes('预测') || lastMsg.includes('概率')) {
    return JSON.stringify({
      matchScore: 72,
      skillGaps: [
        'SAP 实操经验（JD要求但简历未体现）',
        '数据分析工具（Python/SQL有基础但不够深入）',
        '金融行业实习经验',
      ],
      recommendations: [
        '在校期间参加SAP认证培训，增加行业资质背书',
        '用 Kaggle 金融数据集做2-3个分析项目，写入简历',
        '先在金融科技初创公司积累实习经验，半年后再申请目标岗位',
      ],
      competitiveness: '中',
    });
  }

  return 'AI 分析结果将在此显示。';
}

// ========== 业务 API：简历分析 ==========

export async function analyzeResume(
  resumeContent: string,
  jobDescription: string
): Promise<{
  score: number;
  strengths: string[];
  weaknesses: string[];
  atsScore: number;
  suggestions: Array<{ section: string; original: string; improved: string; reason: string }>;
}> {
  const prompt = `你是一位资深HR和职业顾问。请仔细分析以下简历和岗位描述的匹配度，给出详细的评估报告。

## 简历内容：
${resumeContent}

## 岗位描述：
${jobDescription}

请用 JSON 格式返回以下内容（不要包含其他文字）：
{
  "score": 数字(0-100),
  "strengths": ["优势1", "优势2", "优势3"],
  "weaknesses": ["问题1", "问题2", "问题3"],
  "atsScore": 数字(0-100, ATS系统匹配度),
  "suggestions": [
    {
      "section": "模块名称（如：教育背景、项目经历、技能、实习经历）",
      "original": "当前存在的问题",
      "improved": "具体修改建议",
      "reason": "修改原因"
    }
  ]
}`;

  const result = await chatCompletion([
    { role: 'system', content: '你是一位资深HR顾问，擅长简历评估和职业规划。始终以 JSON 格式返回分析结果。' },
    { role: 'user', content: prompt },
  ], 0.3);

  return JSON.parse(result);
}

// ========== 业务 API：简历优化 ==========

export async function optimizeResume(
  resumeContent: string,
  jobDescription: string
): Promise<{
  optimizedContent: string;
  changes: string[];
}> {
  const prompt = `你是一位资深HR和简历优化专家。请根据岗位描述优化以下简历，使其更具竞争力。

## 原始简历：
${resumeContent}

## 目标岗位：
${jobDescription}

## 优化要求：
1. 量化成就（用数字说话）
2. 增加行业关键词（提升ATS匹配度）
3. 使用强有力的动词开头
4. 突出与岗位最相关的经验
5. 保持原简历的核心事实不变

请用 JSON 格式返回（不要包含其他文字）：
{
  "optimizedContent": "优化后的完整简历文本",
  "changes": ["具体改动1", "具体改动2", "具体改动3", ...]
}`;

  const result = await chatCompletion([
    { role: 'system', content: '你是一位资深简历优化专家。始终以 JSON 格式返回优化结果。' },
    { role: 'user', content: prompt },
  ], 0.5);

  return JSON.parse(result);
}

// ========== 业务 API：面试问题生成 ==========

export async function generateInterviewQuestions(
  resumeContent: string,
  jobDescription: string
): Promise<Array<{ id: string; category: string; question: string; hint: string }>> {
  const prompt = `你是一位资深面试官。请根据以下简历和岗位描述，生成针对性的面试问题。

## 简历内容：
${resumeContent}

## 岗位描述：
${jobDescription}

## 要求：
- 生成 8-10 个问题
- 覆盖：技术能力、项目经验、专业知识、行为面试、情景模拟 5个维度
- 每个问题附带1条答题提示

请用 JSON 数组格式返回（不要包含其他文字）：
[
  {
    "id": "1",
    "category": "分类名称",
    "question": "问题内容",
    "hint": "答题提示"
  },
  ...
]`;

  const result = await chatCompletion([
    { role: 'system', content: '你是一位资深面试官，擅长根据简历和JD生成针对性面试题。始终以 JSON 数组格式返回。' },
    { role: 'user', content: prompt },
  ], 0.7);

  return JSON.parse(result);
}

// ========== 业务 API：录取概率预测 ==========

export async function predictMatch(
  resumeContent: string,
  jobDescription: string
): Promise<{
  matchScore: number;
  skillGaps: string[];
  recommendations: string[];
  competitiveness: '低' | '中' | '高';
}> {
  const prompt = `你是一位资深职业顾问和猎头。请评估候选人与岗位的匹配度，并给出预测和建议。

## 简历内容：
${resumeContent}

## 岗位描述：
${jobDescription}

请用 JSON 格式返回（不要包含其他文字）：
{
  "matchScore": 数字(0-100, 综合匹配度),
  "skillGaps": ["技能缺口1", "技能缺口2", ...],
  "recommendations": ["改进建议1", "改进建议2", ...],
  "competitiveness": "低/中/高"
}`;

  const result = await chatCompletion([
    { role: 'system', content: '你是一位资深职业顾问，擅长评估职场竞争力。始终以 JSON 格式返回。' },
    { role: 'user', content: prompt },
  ], 0.3);

  return JSON.parse(result);
}
