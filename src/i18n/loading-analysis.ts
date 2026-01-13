import { Brain, Zap, Target, Eye, Lightbulb } from 'lucide-react';

export default {
  "zh-CN": {
    title: '计算你的智商分数',
    subtitle: '等一下，我们的人工智能会根据5个关键的智力指标分析你的答案',
    dimensions: [
      { name: '记忆力', icon: Brain },
      { name: '速度', icon: Zap },
      { name: '反应力', icon: Target },
      { name: '专注力', icon: Eye },
      { name: '逻辑思维', icon: Lightbulb },
    ],
    modals: [
      {
        title: '数字还是单词？',
        description: '你更擅长处理哪种类型的信息？',
        options: ['数字', '单词'],
      },
      {
        title: '你喜欢解谜吗？',
        description: '解决复杂问题对你来说是一种乐趣吗？',
        options: ['不', '是'],
      },
      {
        title: '单独工作还是团队合作？',
        description: '你更喜欢哪种工作方式？',
        options: ['单独', '团队'],
      },
    ],
  },
  "en-US": {
    title: 'Calculating Your IQ Score',
    subtitle: 'Hold on, our AI is analyzing your answers based on 5 key intelligence indicators',
    dimensions: [
      { name: 'Memory', icon: Brain },
      { name: 'Speed', icon: Zap },
      { name: 'Reaction', icon: Target },
      { name: 'Concentration', icon: Eye },
      { name: 'Logic', icon: Lightbulb },
    ],
    modals: [
      {
        title: 'Numbers or Words?',
        description: 'Which type of information do you handle better?',
        options: ['Numbers', 'Words'],
      },
      {
        title: 'Do you like solving puzzles?',
        description: 'Is solving complex problems enjoyable for you?',
        options: ['No', 'Yes'],
      },
      {
        title: 'Work alone or in a team?',
        description: 'Which working style do you prefer?',
        options: ['Alone', 'Team'],
      },
    ],
  },
}