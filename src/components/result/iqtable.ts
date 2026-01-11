export default {
  "schemaVersion": "1.0.0",
  "locale": "zh-CN",
  "scoring": {
    "iqScale": { "sd": 15, "label": { "zh-CN": "智商估算 (SD=15)", "en-US": "IQ Estimate (SD=15)" } },
    "levels": 5,
    "selectLevelByIq": "inclusive",
    "defaultIqRangeClamp": [0, 200]
  },
  "rendering": {
    "titleTemplate": { "zh-CN": "认知能力评估报告 - {levelName}级别", "en-US": "Cognitive Ability Assessment Report - {levelName} Level" },
    "header": {
      "watermarkText": { "zh-CN": "MENSA", "en-US": "MENSA" },
      "title": { "zh-CN": "认知能力评估报告", "en-US": "Cognitive Ability Assessment Report" },
      "subtitle": { "zh-CN": "基于图形推理测试的认知能力综合分析", "en-US": "Comprehensive Analysis of Cognitive Abilities Based on Graphical Reasoning Test" }
    },
    "meta": {
      "items": [
        { "key": "iq", "label": { "zh-CN": "智商估算 (SD=15)", "en-US": "IQ Estimate (SD=15)" }, "valueFrom": "score.iq" },
        { "key": "percentile", "label": { "zh-CN": "人群百分位", "en-US": "Percentile" }, "valueFrom": "level.percentile" },
        { "key": "accuracy", "label": { "zh-CN": "测试准确率", "en-US": "Test Accuracy" }, "valueFrom": "computed.accuracyText" },
        { "key": "testDate", "label": { "zh-CN": "测试日期", "en-US": "Test Date" }, "valueFrom": "computed.testDateText" }
      ]
    },
    "sectionsOrder": [
      "overview",
      "cognitiveProfile",
      "strengths",
      "recommendations",
      "certificate",
      "science",
      "disclaimer"
    ]
  },
  "computedDefaults": {
    "accuracyByLevelId": { "1": 98, "2": 95, "3": 92, "4": 88, "5": 82 },
    "date": { "mode": "today", "format": "YYYY-MM-DD", "formatCN": "YYYY年M月D日" },
    "generatedAt": { "mode": "now", "format": "YYYY-MM-DD HH:mm:ss" },
    "report": {
      "idTemplate": "MENSA-REPORT-{seq}-{YYYY}-{iq}",
      "seqDefault": "001",
      "version": "2.1"
    },
    "cognitiveProfileUnit": "%",
    "cognitiveProfileClamp": [40, 99]
  },
  "theme": {
    "page": {
      "backgroundColor": "#f5f7ff",
      "textColor": "#333",
      "lineHeight": 1.7,
      "fontFamily": "'Segoe UI','Microsoft YaHei',sans-serif"
    },
    "container": {
      "maxWidth": 1000,
      "backgroundColor": "#ffffff",
      "shadow": "0 0 30px rgba(0, 0, 0, 0.08)"
    },
    "header": {
      "padding": "40px 50px 30px",
      "watermark": { "fontSize": 180, "opacity": 0.1, "top": -30, "right": 30 }
    },
    "badge": {
      "padding": "8px 25px",
      "radius": 50,
      "fontSize": "1.3rem",
      "shadow": "0 4px 15px rgba(0, 0, 0, 0.2)",
      "defaultGradient": "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
    },
    "meta": {
      "backgroundColor": "#f0f0ff",
      "borderColor": "#e0e0ff",
      "valueFontSize": "1.8rem",
      "labelFontSize": "0.9rem"
    },
    "section": {
      "titleFontSize": "1.6rem",
      "titleUnderlineColor": "#e0e0ff"
    },
    "card": {
      "backgroundColor": "#f8f9ff",
      "borderColor": "#e0e0ff",
      "radius": 10
    },
    "lists": {
      "itemBackgroundColor": "#f8f9ff",
      "itemPadding": "12px 20px",
      "itemRadius": "0 8px 8px 0"
    },
    "certificate": {
      "borderWidth": 3,
      "radius": 15,
      "padding": 40,
      "background": "linear-gradient(to bottom, #f8f5ff, white)"
    },
    "footer": {
      "backgroundColor": "#f0f0ff",
      "borderColor": "#e0e0ff",
      "fontSize": "0.9rem",
      "textColor": "#666"
    },
    "disclaimer": {
      "backgroundColor": "#fff5f5",
      "borderLeftColor": "#ff6b6b",
      "padding": 20,
      "radius": "0 8px 8px 0"
    },
    "responsive": {
      "breakpoint": 768,
      "mobilePadding": "30px 20px",
      "cognitiveGridColumnsDesktop": 4,
      "cognitiveGridColumnsMobile": 2
    },
    "print": { "hidePrintButton": true, "containerShadow": "none" }
  },
  "levels": [
    {
      "id": 1,
      "name": { "zh-CN": "卓越非凡", "en-US": "Exceptional" },
      "iqRange": [130, 200],
      "percentile": { "zh-CN": "前2%", "en-US": "Top 2%" },
      "descriptionShort": { "zh-CN": "门萨级别", "en-US": "Mensa Level" },
      "colors": {
        "headerGradient": "linear-gradient(135deg, #8A2BE2 0%, #5D0C9D 100%)",
        "accent": "#8A2BE2",
        "accentDark": "#5D0C9D",
        "badgeText": "#5D0C9D",
        "badgeGradient": "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
      },
      "reportTitle": { "zh-CN": "卓越认知能力分析报告", "en-US": "Exceptional Cognitive Ability Analysis Report" },
      "overview": {
        "leadTemplate": {
          "zh-CN": "尊敬的测试者，根据您在图形推理测试中的表现，我们评估您的认知能力处于<strong>{levelName}级别</strong>。此级别对应智商{iqMin}以上，处于人群{percentile}的位置，达到国际高智商组织门萨(Mensa)的入会标准。",
          "en-US": "Dear Tester, based on your performance in the graphical reasoning test, we assess that your cognitive ability is at the <strong>{levelName} level</strong>. This level corresponds to an IQ above {iqMin}, placing you in the {percentile} of the population, meeting the membership standards of Mensa."
        },
        "body": {
          "zh-CN": "本报告基于您完成的20道图形推理题目，从多个维度分析您的认知能力特点，并提供个性化发展建议。",
          "en-US": "This report is based on the 20 graphical reasoning questions you completed, analyzing your cognitive ability from multiple dimensions and providing personalized development suggestions."
        }
      },
      "cognitiveProfile": {
        "patternRecognition": 96,
        "spatialReasoning": 94,
        "logicalDeduction": 92,
        "processingSpeed": 88
      },
      "cognitiveLabels": [
        { "key": "patternRecognition", "label": { "zh-CN": "模式识别能力", "en-US": "Pattern Recognition" } },
        { "key": "spatialReasoning", "label": { "zh-CN": "空间推理能力", "en-US": "Spatial Reasoning" } },
        { "key": "logicalDeduction", "label": { "zh-CN": "逻辑演绎能力", "en-US": "Logical Deduction" } },
        { "key": "processingSpeed", "label": { "zh-CN": "认知加工速度", "en-US": "Processing Speed" } }
      ],
      "comparativeAnalysis": {
        "zh-CN": "您的认知能力超越98%的同龄人群，与科学、工程和技术领域的顶尖人才认知特征相似。",
        "en-US": "Your cognitive abilities surpass 98% of your peers, resembling the cognitive traits of top talents in science, engineering, and technology."
      },
      "chart": {
        "type": "simpleBars",
        "bars": [
          { "label": { "zh-CN": "前50%", "en-US": "Top 50%" }, "heightPct": 40, "color": "#e0e0e0" },
          { "label": { "zh-CN": "前16%", "en-US": "Top 16%" }, "heightPct": 60, "color": "#c0c0c0" },
          { "label": { "zh-CN": "前5%", "en-US": "Top 5%" }, "heightPct": 80, "color": "#a0a0a0" },
          { "labelTemplate": { "zh-CN": "{percentile}(您)", "en-US": "{percentile}(You)" }, "heightPct": 95, "colorFrom": "level.colors.accent" }
        ],
        "note": {
          "zh-CN": "解读：图表显示了您的认知能力在正态分布中的位置。右侧阴影区域表示您超越的人群比例。",
          "en-US": "Interpretation: The chart shows your position in the normal distribution of cognitive abilities. The shaded area on the right indicates the proportion of the population you surpass."
        }
      },
      "strengths": [
        {
          "title": { "zh-CN": "极佳的模式识别能力", "en-US": "Excellent Pattern Recognition" },
          "detail": {
            "zh-CN": "您能够快速识别复杂模式并预测其发展趋势，这种能力在解决抽象问题时尤其重要。",
            "en-US": "You can quickly identify complex patterns and predict their trends, which is particularly important in solving abstract problems."
          }
        },
        {
          "title": { "zh-CN": "优秀的空间想象能力", "en-US": "Superior Spatial Imagination" },
          "detail": {
            "zh-CN": "您能够在大脑中精确操作和转换空间关系，这是工程、建筑和设计领域的关键能力。",
            "en-US": "You can accurately manipulate and transform spatial relationships in your mind, a key ability in engineering, architecture, and design."
          }
        },
        {
          "title": { "zh-CN": "高效的逻辑演绎能力", "en-US": "Efficient Logical Deduction" },
          "detail": {
            "zh-CN": "您能够从已知前提推导出必然结论，并识别逻辑关系中的矛盾与一致性。",
            "en-US": "You can deduce necessary conclusions from known premises and identify contradictions and consistencies in logical relationships."
          }
        },
        {
          "title": { "zh-CN": "快速的认知加工速度", "en-US": "Fast Cognitive Processing Speed" },
          "detail": {
            "zh-CN": "您处理复杂信息的速度明显快于平均水平，能够在短时间内整合多源信息。",
            "en-US": "You process complex information significantly faster than average, integrating multiple sources of information in a short time."
          }
        }
      ],
      "recommendations": [
        {
          "title": { "zh-CN": "考虑参加正式门萨测试", "en-US": "Consider Taking the Official Mensa Test" },
          "detail": {
            "zh-CN": "您的认知表现已达到门萨入会标准，建议参加正式测试以获得会员资格，加入高智商社群。",
            "en-US": "Your cognitive performance has reached the Mensa membership standard. It is recommended to take the official test to obtain membership and join the high IQ community."
          }
        },
        {
          "title": { "zh-CN": "探索需要高抽象思维的领域", "en-US": "Explore Fields Requiring High Abstract Thinking" },
          "detail": {
            "zh-CN": "考虑深入研究理论物理、哲学、高等数学或人工智能等需要强大抽象思维的领域。",
            "en-US": "Consider delving into fields that require strong abstract thinking, such as theoretical physics, philosophy, advanced mathematics, or artificial intelligence."
          }
        },
        {
          "title": { "zh-CN": "参与复杂问题解决项目", "en-US": "Engage in Complex Problem-Solving Projects" },
          "detail": {
            "zh-CN": "寻找或创建需要复杂系统思维和跨学科整合能力的项目，充分发挥您的认知优势。",
            "en-US": "Look for or create projects that require complex systems thinking and interdisciplinary integration abilities to fully utilize your cognitive advantages."
          }
        },
        {
          "title": { "zh-CN": "担任领导与指导角色", "en-US": "Take on Leadership and Mentoring Roles" },
          "detail": {
            "zh-CN": "您的认知能力适合担任需要复杂决策和战略规划的领导者角色，或指导他人解决难题。",
            "en-US": "Your cognitive abilities are suitable for leadership roles that require complex decision-making and strategic planning, or for mentoring others in problem-solving."
          }
        }
      ],
      "trainingPlan": {
        "title": { "zh-CN": "持续认知训练计划", "en-US": "Continuous Cognitive Training Plan" },
        "intro": { "zh-CN": "为保持和进一步提升认知能力，建议：", "en-US": "To maintain and further enhance cognitive abilities, it is recommended:" },
        "items": [
          {
            "zh-CN": "每周进行3-4次高难度逻辑训练，每次30-45分钟",
            "en-US": "Engage in high-difficulty logical training 3-4 times a week, each session lasting 30-45 minutes"
          },
          {
            "zh-CN": "定期挑战国际高智商组织发布的难题",
            "en-US": "Regularly challenge puzzles published by international high IQ organizations"
          },
          {
            "zh-CN": "学习一门新的编程语言或复杂系统理论",
            "en-US": "Learn a new programming language or complex systems theory"
          },
          {
            "zh-CN": "参与国际性的问题解决竞赛或活动",
            "en-US": "Participate in international problem-solving competitions or events"
          }
        ],
        "style": { "backgroundColor": "#f0f8ff", "radius": 8, "padding": 20 }
      },
      "certificate": {
        "titleTemplate": { "zh-CN": "{levelReportTitle}", "en-US": "{levelReportTitle}" },
        "paragraphs": [
          {
            "zh-CN": "兹证明测试者在本图形推理测试中表现出卓越的认知能力，",
            "en-US": "This certifies that the tester has demonstrated exceptional cognitive abilities in this graphical reasoning test,"
          },
          {
            "zh-CN": "达到<strong>{levelName}级别</strong>，智商估算值为{iq}。",
            "en-US": "reaching the <strong>{levelName} level</strong>, with an estimated IQ of {iq}."
          },
          {
            "zh-CN": "此级别对应人群{percentile}的认知水平，达到国际高智商组织门萨(Mensa)的入会标准。",
            "en-US": "This level corresponds to the cognitive level of the {percentile} of the population, meeting the membership standards of the international high IQ organization Mensa."
          }
        ],
        "idPrefix": "MENSA-REPORT",
        "idTemplate": "MENSA-REPORT-001-{YYYY}-{iq}",
        "dateLineTemplate": { "zh-CN": "测试日期: {testDateCN}", "en-US": "Test Date: {testDateCN}" },
        "footnote": {
          "zh-CN": "* 此证书证明测试者在图形推理测试中的表现，非正式智商测试证书。",
          "en-US": "* This certificate certifies the tester's performance in the graphical reasoning test and is not an official IQ test certificate."
        }
      }
    },
    {
      "id": 2,
      "name": { "zh-CN": "优秀出色", "en-US": "Superior" },
      "iqRange": [115, 129],
      "percentile": { "zh-CN": "前16%", "en-US": "Top 16%" },
      "descriptionShort": { "zh-CN": "高认知能力", "en-US": "High Cognitive Ability" },
      "colors": {
        "headerGradient": "linear-gradient(135deg, #1E90FF 0%, #0B5FB5 100%)",
        "accent": "#1E90FF",
        "accentDark": "#0B5FB5",
        "badgeText": "#0B5FB5",
        "badgeGradient": "linear-gradient(135deg, #D9F2FF 0%, #8FD3FF 100%)"
      },
      "reportTitle": { "zh-CN": "优秀认知能力分析报告", "en-US": "Superior Cognitive Ability Analysis Report" },
      "overview": {
        "leadTemplate": {
          "zh-CN": "尊敬的测试者，根据您在图形推理测试中的表现，我们评估您的认知能力处于<strong>{levelName}级别</strong>。此级别对应智商{iqMin}-{iqMax}，处于人群{percentile}的位置，具备突出的学习与分析优势。",
          "en-US": "Dear Tester, based on your performance in the graphical reasoning test, we assess that your cognitive ability is at the <strong>{levelName} level</strong>. This level corresponds to an IQ of {iqMin}-{iqMax}, placing you in the {percentile} of the population, with outstanding learning and analytical advantages."
        },
        "body": {
          "zh-CN": "本报告基于您完成的20道图形推理题目，从多个维度分析您的认知能力特点，并提供个性化发展建议。",
          "en-US": "This report is based on the 20 graphical reasoning questions you completed, analyzing your cognitive ability from multiple dimensions and providing personalized development suggestions."
        }
      },
      "cognitiveProfile": {
        "patternRecognition": 86,
        "spatialReasoning": 84,
        "logicalDeduction": 85,
        "processingSpeed": 82
      },
      "cognitiveLabels": [
        { "key": "patternRecognition", "label": { "zh-CN": "模式识别能力", "en-US": "Pattern Recognition" } },
        { "key": "spatialReasoning", "label": { "zh-CN": "空间推理能力", "en-US": "Spatial Reasoning" } },
        { "key": "logicalDeduction", "label": { "zh-CN": "逻辑演绎能力", "en-US": "Logical Deduction" } },
        { "key": "processingSpeed", "label": { "zh-CN": "认知加工速度", "en-US": "Processing Speed" } }
      ],
      "comparativeAnalysis": {
        "zh-CN": "您的认知能力超越84%的同龄人群，具备在技术、金融、法律等领域取得杰出成就的认知基础。",
        "en-US": "Your cognitive abilities surpass 84% of your peers, providing a cognitive foundation for achieving outstanding accomplishments in fields such as technology, finance, and law."
      },
      "chart": {
        "type": "simpleBars",
        "bars": [
          { "label": { "zh-CN": "前50%", "en-US": "Top 50%" }, "heightPct": 40, "color": "#e0e0e0" },
          { "labelTemplate": { "zh-CN": "{percentile}(您)", "en-US": "{percentile}(You)" }, "heightPct": 80, "colorFrom": "level.colors.accent" },
          { "label": { "zh-CN": "前5%", "en-US": "Top 5%" }, "heightPct": 90, "color": "#a0a0a0" }
        ],
        "note": {
          "zh-CN": "解读：图表为示意，展示您在常模分布中的相对位置。",
          "en-US": "Interpretation: The chart shows your relative position in the norm distribution."
        }
      },
      "strengths": [
        {
          "title": { "zh-CN": "良好的模式识别能力", "en-US": "Good Pattern Recognition" },
          "detail": {
            "zh-CN": "能够在较短时间内抓住题目规律，适合处理结构化信息与抽象规则。",
            "en-US": "You can quickly grasp the patterns of problems, suitable for handling structured information and abstract rules."
          }
        },
        {
          "title": { "zh-CN": "较强的空间推理能力", "en-US": "Strong Spatial Reasoning" },
          "detail": {
            "zh-CN": "对图形旋转、组合与变换的把握较好，有助于工程与设计类任务。",
            "en-US": "You have a good grasp of figure rotation, combination, and transformation, which is useful for engineering and design tasks."
          }
        },
        {
          "title": { "zh-CN": "稳定的逻辑推理能力", "en-US": "Stable Logical Reasoning" },
          "detail": {
            "zh-CN": "能较为一致地进行演绎与归纳推理，适合复杂分析与论证。",
            "en-US": "You can consistently perform deductive and inductive reasoning, suitable for complex analysis and argumentation."
          }
        },
        {
          "title": { "zh-CN": "较好的信息加工速度", "en-US": "Good Information Processing Speed" },
          "detail": {
            "zh-CN": "在压力与时间限制下仍能保持效率，适合高强度学习与工作场景。",
            "en-US": "You can maintain efficiency under pressure and time constraints, suitable for high-intensity learning and work scenarios."
          }
        }
      ],
      "recommendations": [
        {
          "title": { "zh-CN": "通过针对性训练提升至高阶认知水平", "en-US": "Enhance to Advanced Cognitive Levels through Targeted Training" },
          "detail": {
            "zh-CN": "建议强化高难度类比推理、矩阵推理与多规则题型的训练。",
            "en-US": "It is recommended to strengthen training in high-difficulty analogy reasoning, matrix reasoning, and multi-rule problem types."
          }
        },
        {
          "title": { "zh-CN": "在专业领域深化逻辑思维应用", "en-US": "Deepen the Application of Logical Thinking in Professional Fields" },
          "detail": {
            "zh-CN": "将推理能力用于建模、论证与决策，形成可迁移的方法论。",
            "en-US": "Apply reasoning abilities to modeling, argumentation, and decision-making, forming transferable methodologies."
          }
        },
        {
          "title": { "zh-CN": "参与需要复杂分析的工作项目", "en-US": "Engage in Work Projects Requiring Complex Analysis" },
          "detail": {
            "zh-CN": "优先选择数据分析、策略、产品、研究等需要结构化思考的任务。",
            "en-US": "Prioritize tasks that require structured thinking, such as data analysis, strategy, product development, and research."
          }
        },
        {
          "title": { "zh-CN": "学习高级编程或数据分析技能", "en-US": "Learn Advanced Programming or Data Analysis Skills" },
          "detail": {
            "zh-CN": "用工具增强思维外化与验证能力，如Python/SQL/统计推断等。",
            "en-US": "Use tools to enhance the externalization and verification of thinking, such as Python/SQL/statistical inference."
          }
        }
      ],
      "trainingPlan": {
        "title": { "zh-CN": "持续认知训练计划", "en-US": "Continuous Cognitive Training Plan" },
        "intro": {
          "zh-CN": "建议采用“难度递增 + 复盘归纳”的训练方式：",
          "en-US": "It is recommended to use the 'increasing difficulty + review and summary' training method:"
        },
        "items": [
          { "zh-CN": "每周3次推理训练（30-40分钟），难度逐步提高", "en-US": "Three times of reasoning training per week (30-40 minutes), with gradually increasing difficulty" },
          { "zh-CN": "每次训练后用3分钟记录“规律类型/失误点/更优策略”", "en-US": "Record the 'pattern type/mistake points/better strategies' for 3 minutes after each training" },
          { "zh-CN": "每周至少一次综合题（多规则叠加）以提升迁移能力", "en-US": "At least one comprehensive problem per week (multiple rules overlay) to enhance transferability" },
          { "zh-CN": "为高压场景加入计时训练，提升稳定性", "en-US": "Add timed training for high-pressure scenarios to improve stability" }
        ],
        "style": { "backgroundColor": "#f0f8ff", "radius": 8, "padding": 20 }
      },
      "certificate": {
        "titleTemplate": { "zh-CN": "{levelReportTitle}", "en-US": "{levelReportTitle}" },
        "paragraphs": [
          {
            "zh-CN": "兹证明测试者在本图形推理测试中表现出优秀的认知能力，",
            "en-US": "This certifies that the tester has demonstrated superior cognitive abilities in this graphical reasoning test,"
          },
          {
            "zh-CN": "达到<strong>{levelName}级别</strong>，智商估算值为{iq}。",
            "en-US": "reaching the <strong>{levelName} level</strong>, with an estimated IQ of {iq}."
          },
          {
            "zh-CN": "此级别对应人群{percentile}的认知水平。",
            "en-US": "This level corresponds to the cognitive level of the {percentile} of the population."
          }
        ],
        "idPrefix": "MENSA-REPORT",
        "idTemplate": "MENSA-REPORT-001-{YYYY}-{iq}",
        "dateLineTemplate": { "zh-CN": "测试日期: {testDateCN}", "en-US": "Test Date: {testDateCN}" },
        "footnote": {
          "zh-CN": "* 此证书证明测试者在图形推理测试中的表现，非正式智商测试证书。",
          "en-US": "* This certificate certifies the tester's performance in the graphical reasoning test and is not an official IQ test certificate."
        }
      }
    },
    {
      "id": 3,
      "name": { "zh-CN": "良好稳定", "en-US": "Good" },
      "iqRange": [100, 114],
      "percentile": { "zh-CN": "前50%", "en-US": "Top 50%" },
      "descriptionShort": { "zh-CN": "平均水平以上", "en-US": "Above Average" },
      "colors": {
        "headerGradient": "linear-gradient(135deg, #32CD32 0%, #1E8E1E 100%)",
        "accent": "#32CD32",
        "accentDark": "#1E8E1E",
        "badgeText": "#1E8E1E",
        "badgeGradient": "linear-gradient(135deg, #E8FFE8 0%, #B9F6B9 100%)"
      },
      "reportTitle": { "zh-CN": "良好认知能力分析报告", "en-US": "Good Cognitive Ability Analysis Report" },
      "overview": {
        "leadTemplate": {
          "zh-CN": "尊敬的测试者，根据您在图形推理测试中的表现，我们评估您的认知能力处于<strong>{levelName}级别</strong>。此级别对应智商{iqMin}-{iqMax}，整体处于人群{percentile}附近，具备良好的学习与问题解决基础。",
          "en-US": "Dear Tester, based on your performance in the graphical reasoning test, we assess that your cognitive ability is at the <strong>{levelName} level</strong>. This level corresponds to an IQ of {iqMin}-{iqMax}, overall placing you near the {percentile} of the population, with a good foundation for learning and problem-solving."
        },
        "body": {
          "zh-CN": "本报告基于您完成的20道图形推理题目，从多个维度分析您的认知能力特点，并提供个性化发展建议。",
          "en-US": "This report is based on the 20 graphical reasoning questions you completed, analyzing your cognitive ability from multiple dimensions and providing personalized development suggestions."
        }
      },
      "cognitiveProfile": {
        "patternRecognition": 76,
        "spatialReasoning": 73,
        "logicalDeduction": 75,
        "processingSpeed": 71
      },
      "cognitiveLabels": [
        { "key": "patternRecognition", "label": { "zh-CN": "模式识别能力", "en-US": "Pattern Recognition" } },
        { "key": "spatialReasoning", "label": { "zh-CN": "空间推理能力", "en-US": "Spatial Reasoning" } },
        { "key": "logicalDeduction", "label": { "zh-CN": "逻辑演绎能力", "en-US": "Logical Deduction" } },
        { "key": "processingSpeed", "label": { "zh-CN": "认知加工速度", "en-US": "Processing Speed" } }
      ],
      "comparativeAnalysis": {
        "zh-CN": "您的认知能力处于人群中的中上水平，具备学习复杂技能和处理日常逻辑问题的良好基础。",
        "en-US": "Your cognitive abilities are in the upper-middle level of the population, providing a good foundation for learning complex skills and handling daily logical problems."
      },
      "chart": {
        "type": "simpleBars",
        "bars": [
          { "labelTemplate": { "zh-CN": "{percentile}(您)", "en-US": "{percentile}(You)" }, "heightPct": 60, "colorFrom": "level.colors.accent" },
          { "label": { "zh-CN": "前16%", "en-US": "Top 16%" }, "heightPct": 80, "color": "#c0c0c0" }
        ],
        "note": {
          "zh-CN": "解读：图表为示意，展示您在常模分布中的相对位置。",
          "en-US": "Interpretation: The chart is a schematic representation showing your relative position in the norm distribution."
        }
      },
      "strengths": [
        {
          "title": { "zh-CN": "具备基础模式识别能力", "en-US": "Basic Pattern Recognition Ability" },
          "detail": {
            "zh-CN": "能识别常见变化规律，适合通过训练提升到更复杂的规则组合题型。",
            "en-US": "You can recognize common patterns of change, suitable for training to improve to more complex rule combination problem types."
          }
        },
        {
          "title": { "zh-CN": "基本空间想象能力", "en-US": "Basic Spatial Imagination Ability" },
          "detail": {
            "zh-CN": "对简单的旋转、对称与拼合较敏感，通过练习可显著提升准确性。",
            "en-US": "You are sensitive to simple rotations, symmetries, and assemblies, and practicing can significantly improve accuracy."
          }
        },
        {
          "title": { "zh-CN": "常规逻辑推理能力", "en-US": "Regular Logical Reasoning Ability" },
          "detail": {
            "zh-CN": "能进行基本演绎/归纳，建议加强“找条件-列规则-验证”的步骤化思维。",
            "en-US": "You can perform basic deductive/inductive reasoning; it is recommended to strengthen step-by-step thinking like 'find conditions-list rules-verify'."
          }
        },
        {
          "title": { "zh-CN": "适中的加工速度", "en-US": "Moderate Processing Speed" },
          "detail": {
            "zh-CN": "在熟悉题型后速度会提升，建议通过计时训练建立稳定节奏。",
            "en-US": "Your speed will improve as you familiarize yourself with problem types; it is recommended to establish a stable rhythm through timed training."
          }
        }
      ],
      "recommendations": [
        {
          "title": { "zh-CN": "系统训练提升逻辑推理能力", "en-US": "Systematic Training to Improve Logical Reasoning Ability" },
          "detail": {
            "zh-CN": "从单规则到双规则，再到多规则叠加，逐级训练并做错题归纳。",
            "en-US": "Train progressively from single-rule to double-rule, and then multi-rule overlay, and summarize mistakes."
          }
        },
        {
          "title": { "zh-CN": "加强图形推理与空间想象练习", "en-US": "Strengthen Graphical Reasoning and Spatial Imagination Exercises" },
          "detail": {
            "zh-CN": "重点练习旋转、镜像、叠加、分割与数量变化等常见规律。",
            "en-US": "Focus on practicing common patterns like rotation, mirroring, overlay, segmentation, and quantity changes."
          }
        },
        {
          "title": { "zh-CN": "学习基础编程或逻辑思维课程", "en-US": "Learn Basic Programming or Logical Thinking Courses" },
          "detail": {
            "zh-CN": "用“条件判断/循环/集合”帮助形成结构化思维框架。",
            "en-US": "Use 'conditional judgment/loop/collection' to help form a structured thinking framework."
          }
        },
        {
          "title": { "zh-CN": "应用结构化逻辑解决方法", "en-US": "Apply Structured Problem-Solving Methods" },
          "detail": {
            "zh-CN": "在工作与学习中使用问题拆分、假设-验证、复盘总结等方法。",
            "en-US": "Use methods such as problem decomposition, hypothesis verification, and review summary in work and study."
          }
        }
      ],
      "trainingPlan": {
        "title": { "zh-CN": "持续认知训练计划", "en-US": "Continuous Cognitive Training Plan" },
        "intro": {
          "zh-CN": "建议建立稳定节奏，重在复盘：",
          "en-US": "It is recommended to establish a stable rhythm with a focus on review:"
        },
        "items": [
          { "zh-CN": "每周2-3次图形推理练习（20-30分钟）", "en-US": "2-3 times of graphical reasoning exercises per week (20-30 minutes)" },
          { "zh-CN": "每次保留错题并标注规律类型（旋转/数量/位置/叠加等）", "en-US": "Keep mistakes from each session and mark pattern types (rotation/quantity/position/overlay, etc.)" },
          { "zh-CN": "每周做一次计时套题，观察速度与准确率", "en-US": "Perform a timed set of problems once a week, observing speed and accuracy" },
          { "zh-CN": "每月回顾一次错题本，重复练习高频薄弱点", "en-US": "Review the mistake book once a month, repeatedly practicing high-frequency weak points"}
        ],
        "style": { "backgroundColor": "#f0f8ff", "radius": 8, "padding": 20 }
      },
      "certificate": {
        "titleTemplate": { "zh-CN": "{levelReportTitle}", "en-US": "{levelReportTitle}" },
        "paragraphs": [
          {
            "zh-CN": "兹证明测试者在本图形推理测试中表现出良好的认知能力，",
            "en-US": "This certifies that the tester has demonstrated good cognitive abilities in this graphical reasoning test,"
          },
          {
            "zh-CN": "达到<strong>{levelName}级别</strong>，智商估算值为{iq}。",
            "en-US": "reaching the <strong>{levelName} level</strong>, with an estimated IQ of {iq}."
          },
          {
            "zh-CN": "本结果反映当前测试表现，适合通过训练进一步提升。",
            "en-US": "This result reflects current test performance and is suitable for further improvement through training."
          }
        ],
        "idPrefix": "MENSA-REPORT",
        "idTemplate": "MENSA-REPORT-001-{YYYY}-{iq}",
        "dateLineTemplate": { "zh-CN": "测试日期: {testDateCN}", "en-US": "Test Date: {testDateCN}" },
        "footnote": {
          "zh-CN": "* 此证书证明测试者在图形推理测试中的表现，非正式智商测试证书。",
          "en-US": "* This certificate certifies the tester's performance in the graphical reasoning test and is not an official IQ test certificate."
        }
      }
    },
    {
      "id": 4,
      "name": { "zh-CN": "中等常规", "en-US": "Average" },
      "iqRange": [85, 99],
      "percentile": { "zh-CN": "前84%", "en-US": "Top 84%" },
      "descriptionShort": { "zh-CN": "常规水平", "en-US": "Regular Level" },
      "colors": {
        "headerGradient": "linear-gradient(135deg, #FFA500 0%, #CC7A00 100%)",
        "accent": "#FFA500",
        "accentDark": "#CC7A00",
        "badgeText": "#7A4A00",
        "badgeGradient": "linear-gradient(135deg, #FFE6BF 0%, #FFC266 100%)"
      },
      "reportTitle": { "zh-CN": "常规认知能力分析报告", "en-US": "Average Cognitive Ability Analysis Report" },
      "overview": {
        "leadTemplate": {
          "zh-CN": "尊敬的测试者，根据您在图形推理测试中的表现，我们评估您的认知能力处于<strong>{levelName}级别</strong>。此级别对应智商{iqMin}-{iqMax}，整体处于人群常规范围，适合通过系统练习获得明显提升。",
          "en-US": "Dear Tester, based on your performance in the graphical reasoning test, we assess that your cognitive ability is at the <strong>{levelName} level</strong>. This level corresponds to an IQ of {iqMin}-{iqMax}, overall placing you in the regular range of the population, suitable for significant improvement through systematic practice."
        },
        "body": {
          "zh-CN": "本报告基于您完成的20道图形推理题目，从多个维度分析您的认知能力特点，并提供可执行的训练建议。",
          "en-US": "This report is based on the 20 graphical reasoning questions you completed, analyzing your cognitive ability from multiple dimensions and providing actionable training suggestions."
        }
      },
      "cognitiveProfile": {
        "patternRecognition": 66,
        "spatialReasoning": 63,
        "logicalDeduction": 65,
        "processingSpeed": 61
      },
      "cognitiveLabels": [
        { "key": "patternRecognition", "label": { "zh-CN": "模式识别能力", "en-US": "Pattern Recognition" } },
        { "key": "spatialReasoning", "label": { "zh-CN": "空间推理能力", "en-US": "Spatial Reasoning" } },
        { "key": "logicalDeduction", "label": { "zh-CN": "逻辑演绎能力", "en-US": "Logical Deduction" } },
        { "key": "processingSpeed", "label": { "zh-CN": "认知加工速度", "en-US": "Processing Speed" } }
      ],
      "comparativeAnalysis": {
        "zh-CN": "您的认知能力处于常规范围，通过系统训练可以显著提升逻辑思维和问题解决能力。",
        "en-US": "Your cognitive abilities are within the regular range, and systematic training can significantly enhance logical thinking and problem-solving skills."
      },
      "chart": {
        "type": "simpleBars",
        "bars": [
          { "label": { "zh-CN": "前50%", "en-US": "Top 50%" }, "heightPct": 60, "color": "#e0e0e0" },
          { "labelTemplate": { "zh-CN": "{percentile}(您)", "en-US": "{percentile}(You)" }, "heightPct": 70, "colorFrom": "level.colors.accent" }
        ],
        "note": {
          "zh-CN": "解读：图表为示意，展示您在常模分布中的相对位置。",
          "en-US": "Interpretation: The chart is a schematic representation showing your relative position in the norm distribution."
        }
      },
      "strengths": [
        {
          "title": { "zh-CN": "具备基础模式识别能力", "en-US": "Basic Pattern Recognition Ability" },
          "detail": {
            "zh-CN": "对明显规律的识别较稳定，适合从常见规则入手逐步建立题型库。",
            "en-US": "Stable recognition of obvious patterns; suitable for starting with common rules to gradually build a problem type library."
          }
        },
        {
          "title": { "zh-CN": "具备初步空间想象能力", "en-US": "Basic Spatial Imagination Ability" },
          "detail": {
            "zh-CN": "在简单图形变化中可找到线索，通过练习可提升准确率与自信。",
            "en-US": "Able to find clues in simple figure changes; practicing can improve accuracy and confidence."
          }
        },
        {
          "title": { "zh-CN": "可完成简单逻辑推理", "en-US": "Able to Perform Simple Logical Reasoning" },
          "detail": {
            "zh-CN": "适合用“先列规则、再验证”的流程降低随意猜测。",
            "en-US": "Suitable for using the 'list rules first, then verify' process to reduce random guessing."
          }
        },
        {
          "title": { "zh-CN": "基本加工速度", "en-US": "Basic Processing Speed" },
          "detail": {
            "zh-CN": "通过熟练度提升，速度通常会明显改善，关键在于建立固定解题步骤。",
            "en-US": "Speed typically improves with proficiency; the key is to establish fixed problem-solving steps."
          }
        }
      ],
      "recommendations": [
        {
          "title": { "zh-CN": "从基础逻辑训练开始系统提升", "en-US": "Start Systematic Improvement with Basic Logical Training" },
          "detail": {
            "zh-CN": "先掌握单一规则（数量/位置/旋转/叠加），再练组合规则。",
            "en-US": "First master single rules (quantity/position/rotation/overlay), then practice combined rules."
          }
        },
        {
          "title": { "zh-CN": "每天坚持15分钟图形推理练习", "en-US": "Maintain 15 Minutes of Graphical Reasoning Practice Daily" },
          "detail": {
            "zh-CN": "短时高频更有效，重点是做完后总结规律与错误原因。",
            "en-US": "Short, frequent practices are more effective; the focus is on summarizing patterns and reasons for mistakes after completing each session."
          }
        },
        {
          "title": { "zh-CN": "学习使用思维导图等工具辅助思考", "en-US": "Learn to Use Mind Maps and Other Tools to Assist Thinking" },
          "detail": {
            "zh-CN": "把规律与条件可视化，减少遗漏与反复试错。",
            "en-US": "Visualize patterns and conditions to reduce omissions and repetitive trial and error."
          }
        },
        {
          "title": { "zh-CN": "在生活中应用简单逻辑解决问题", "en-US": "Apply Simple Logic to Solve Problems in Daily Life" },
          "detail": {
            "zh-CN": "用“目标-约束-步骤-验证”的方式处理日常任务，强化结构化思维。",
            "en-US": "Handle daily tasks with the 'goal-constraint-steps-verification' approach to strengthen structured thinking."
          }
        }
      ],
      "trainingPlan": {
        "title": { "zh-CN": "持续认知训练计划", "en-US": "Continuous Cognitive Training Plan" },
        "intro": {
          "zh-CN": "建议以“规律库 + 错题本”为核心：",
          "en-US": "It is recommended to focus on 'pattern library + mistake book' as the core:"
        },
        "items": [
          { "zh-CN": "每天15分钟图形推理（优先单规则题）", "en-US": "15 minutes of graphical reasoning daily (prefer single-rule problems)" },
          { "zh-CN": "建立规律清单：旋转/镜像/数量/叠加/移动/分割等", "en-US": "Create a pattern list: rotation/mirroring/quantity/overlay/movement/segmentation, etc." },
          { "zh-CN": "每周复盘一次错题：错误类型、缺失步骤、下次策略", "en-US": "Review mistakes once a week: mistake types, missing steps, next strategies" },
          { "zh-CN": "当准确率稳定后再加入计时训练", "en-US": "Add timed training after accuracy stabilizes"}
        ],
        "style": { "backgroundColor": "#f0f8ff", "radius": 8, "padding": 20 }
      },
      "certificate": {
        "titleTemplate": { "zh-CN": "{levelReportTitle}", "en-US": "{levelReportTitle}" },
        "paragraphs": [
          {
            "zh-CN": "兹证明测试者完成本图形推理测试，",
            "en-US": "This certifies that the tester has completed this graphical reasoning test,"
          },
          {
            "zh-CN": "达到<strong>{levelName}级别</strong>，智商估算值为{iq}。",
            "en-US": "reaching the <strong>{levelName} level</strong>, with an estimated IQ of {iq}."
          },
          {
            "zh-CN": "本结果反映当前测试表现，可通过训练进一步提升。",
            "en-US": "This result reflects current test performance and can be further improved through training."
          }
        ],
        "idPrefix": "MENSA-REPORT",
        "idTemplate": "MENSA-REPORT-001-{YYYY}-{iq}",
        "dateLineTemplate": { "zh-CN": "测试日期: {testDateCN}", "en-US": "Test Date: {testDateCN}" },
        "footnote": {
          "zh-CN": "* 此证书证明测试者在图形推理测试中的表现，非正式智商测试证书。",
          "en-US": "* This certificate certifies the tester's performance in the graphical reasoning test and is not an official IQ test certificate."
        }
      }
    },
    {
      "id": 5,
      "name": { "zh-CN": "有待提升", "en-US": "Needs Improvement" },
      "iqRange": [0, 84],
      "percentile": { "zh-CN": "后16%", "en-US": "Bottom 16%" },
      "descriptionShort": { "zh-CN": "需重新测试", "en-US": "Needs Retesting" },
      "colors": {
        "headerGradient": "linear-gradient(135deg, #FF4500 0%, #B53000 100%)",
        "accent": "#FF4500",
        "accentDark": "#B53000",
        "badgeText": "#7A1E00",
        "badgeGradient": "linear-gradient(135deg, #FFD1C2 0%, #FF8A66 100%)"
      },
      "reportTitle": { "zh-CN": "认知能力提升建议报告", "en-US": "Cognitive Ability Improvement Suggestions Report" },
      "overview": {
        "leadTemplate": {
          "zh-CN": "尊敬的测试者，根据您在图形推理测试中的表现，我们评估您的认知能力处于<strong>{levelName}级别</strong>。此结果可能受测试状态、环境干扰或题型熟悉度影响，建议在休息充分、环境安静的条件下重新测试，以获得更稳定的估算。",
          "en-US": "Dear Tester, based on your performance in the graphical reasoning test, we assess that your cognitive ability is at the <strong>{levelName} level</strong>. This result may be affected by test conditions, environmental interference, or familiarity with the question types; it is recommended to retest under fully rested and quiet conditions to obtain a more stable estimate."
        },
        "body": {
          "zh-CN": "本报告仍将基于当前作答表现，给出可执行的训练建议，帮助您逐步提升图形推理与逻辑思维能力。",
          "en-US": "This report will still provide actionable training suggestions based on your current performance to help you gradually improve your graphical reasoning and logical thinking abilities."
        }
      },
      "cognitiveProfile": {
        "patternRecognition": 58,
        "spatialReasoning": 55,
        "logicalDeduction": 56,
        "processingSpeed": 54
      },
      "cognitiveLabels": [
        { "key": "patternRecognition", "label": { "zh-CN": "模式识别能力", "en-US": "Pattern Recognition" } },
        { "key": "spatialReasoning", "label": { "zh-CN": "空间推理能力", "en-US": "Spatial Reasoning" } },
        { "key": "logicalDeduction", "label": { "zh-CN": "逻辑演绎能力", "en-US": "Logical Deduction" } },
        { "key": "processingSpeed", "label": { "zh-CN": "认知加工速度", "en-US": "Processing Speed" } }
      ],
      "comparativeAnalysis": {
        "zh-CN": "当前结果显示您在该类题型上的表现仍有提升空间。通过题型熟悉与循序训练，通常可获得明显进步。",
        "en-US": "The current results show that there is still room for improvement in your performance on these types of questions. Familiarity with the question types and sequential training can usually lead to significant progress."
      },
      "chart": {
        "type": "simpleBars",
        "bars": [
          { "labelTemplate": { "zh-CN": "{percentile}(您)", "en-US": "{percentile}(You)" }, "heightPct": 45, "colorFrom": "level.colors.accent" },
          { "label": { "zh-CN": "前84%", "en-US": "Top 84%" }, "heightPct": 70, "color": "#c0c0c0" }
        ],
        "note": {
          "zh-CN": "解读：图表为示意，展示您在常模分布中的相对位置。",
          "en-US": "Interpretation: The chart is a schematic representation showing your relative position in the norm distribution."
        }
      },
      "strengths": [
        {
          "title": { "zh-CN": "可通过训练快速获得增益", "en-US": "Quick Gains through Training" },
          "detail": {
            "zh-CN": "图形推理对“题型熟悉度”敏感，建立规律库后进步通常较快。",
            "en-US": "Graphical reasoning is sensitive to 'question type familiarity'; progress is usually quick after establishing a pattern library."
          }
        },
        {
          "title": { "zh-CN": "具备基础观察能力", "en-US": "Basic Observation Ability" },
          "detail": {
            "zh-CN": "建议从最常见、最直观的规律入手，逐步提升准确率。",
            "en-US": "It is recommended to start with the most common and intuitive patterns, gradually improving accuracy."
          }
        },
        {
          "title": { "zh-CN": "适合采用步骤化解题", "en-US": "Suitable for Step-by-Step Problem Solving" },
          "detail": {
            "zh-CN": "固定流程（找变化点→列规则→验证）可显著降低无效试错。",
            "en-US": "A fixed process (find change points → list rules → verify) can significantly reduce ineffective trial and error."
          }
        },
        {
          "title": { "zh-CN": "适合短时高频训练", "en-US": "Suitable for Short, Frequent Training" },
          "detail": {
            "zh-CN": "每天少量练习更易坚持，并帮助形成长期提升曲线。",
            "en-US": "Daily short practices are easier to maintain and help form a long-term improvement curve."
          }
        }
      ],
      "recommendations": [
        {
          "title": { "zh-CN": "建议重新测试以获得稳定结果", "en-US": "Recommend Retesting to Obtain Stable Results" },
          "detail": {
            "zh-CN": "在休息充分、专注度更高时再测；如条件允许，可分两次完成并取更稳定的一次。",
            "en-US": "Retest when well-rested and more focused; if conditions allow, complete it in two sessions and take the more stable result."
          }
        },
        {
          "title": { "zh-CN": "从最常见规律开始练习", "en-US": "Start Practicing with the Most Common Patterns" },
          "detail": {
            "zh-CN": "优先练数量变化、位置移动、旋转/镜像、叠加/消除等单规则题。",
            "en-US": "Prioritize practicing single-rule problems like quantity changes, position shifts, rotation/mirroring, overlay/removal."
          }
        },
        {
          "title": { "zh-CN": "建立错题本与规律清单", "en-US": "Establish a Mistake Book and Pattern List" },
          "detail": {
            "zh-CN": "每道错题写出“我忽略了什么变化/本题规律是什么/下次怎么做”。",
            "en-US": "For each mistake, write down 'What change did I overlook/What is the pattern of this problem/How to solve it next time'."
          }
        },
        {
          "title": { "zh-CN": "把速度训练放到准确率稳定之后", "en-US": "Focus on Speed Training After Accuracy Stabilizes" },
          "detail": {
            "zh-CN": "先追求正确，再逐步计时，避免形成“快但不准”的习惯。",
            "en-US": "First pursue correctness, then gradually time the sessions to avoid forming the habit of 'fast but inaccurate'."
          }
        }
      ],
      "trainingPlan": {
        "title": { "zh-CN": "持续认知训练计划", "en-US": "Continuous Cognitive Training Plan" },
        "intro": {
          "zh-CN": "建议以“容易坚持”为第一目标：",
          "en-US": "It is recommended to set 'easy to maintain' as the primary goal:"
        },
        "items": [
          { "zh-CN": "每天10-15分钟，专练单规则题（先不计时）", "en-US": "10-15 minutes daily, focusing on single-rule problems (without timing initially)" },
          { "zh-CN": "每周挑选10道错题复做，直到能稳定说出规律", "en-US": "Select and redo 10 mistakes per week until you can consistently identify the patterns" },
          { "zh-CN": "每两周加入一次小套题（计时），观察是否更稳定", "en-US": "Add a small set of timed problems every two weeks to observe stability" },
          { "zh-CN": "必要时更换题库与题型，避免记忆答案而非理解规律", "en-US": "Change the problem set and types when necessary to avoid memorizing answers instead of understanding patterns"}
        ],
        "style": { "backgroundColor": "#f0f8ff", "radius": 8, "padding": 20 }
      },
      "certificate": {
        "titleTemplate": { "zh-CN": "{levelReportTitle}", "en-US": "{levelReportTitle}" },
        "paragraphs": [
          {
            "zh-CN": "兹证明测试者完成本图形推理测试，",
            "en-US": "This certifies that the tester has completed this graphical reasoning test,"
          },
          {
            "zh-CN": "当前评估为<strong>{levelName}级别</strong>，智商估算值为{iq}。",
            "en-US": "with the current assessment as <strong>{levelName}</strong>, with an estimated IQ of {iq}."
          },
          {
            "zh-CN": "建议在更佳状态下重新测试以获得更稳定的结果。",
            "en-US": "It is recommended to retest under better conditions to obtain more stable results."
          }
        ],
        "idPrefix": "MENSA-REPORT",
        "idTemplate": "MENSA-REPORT-001-{YYYY}-{iq}",
        "dateLineTemplate": { "zh-CN": "测试日期: {testDateCN}", "en-US": "Test Date: {testDateCN}" },
        "footnote": {
          "zh-CN": "* 此证书证明测试者在图形推理测试中的表现，非正式智商测试证书。",
          "en-US": "* This certificate certifies the tester's performance in the graphical reasoning test and is not an official IQ test certificate."
        }
      }
    }
    // ... Repeat similar structure for other levels, making sure each field supports both zh-CN and en-US
  ],
  "commonSections": {
    "science": {
      "title": { "zh-CN": "报告科学依据", "en-US": "Scientific Basis of the Report" },
      "intro": { "zh-CN": "本报告基于以下科学原理和方法：", "en-US": "This report is based on the following scientific principles and methods:" },
      "items": [
        {
          "title": { "zh-CN": "认知心理学理论", "en-US": "Cognitive Psychology Theory" },
          "detail": { "zh-CN": "基于工作记忆、流体智力和执行功能等认知心理学理论", "en-US": "Based on cognitive psychology theories such as working memory, fluid intelligence, and executive functions" }
        },
        {
          "title": { "zh-CN": "项目反应理论", "en-US": "Item Response Theory" },
          "detail": { "zh-CN": "采用IRT模型分析题目难度与测试者能力的匹配度", "en-US": "Using IRT models to analyze the match between item difficulty and tester ability" }
        },
        {
          "title": { "zh-CN": "常模参照评估", "en-US": "Norm-Referenced Assessment" },
          "detail": { "zh-CN": "基于大规模标准化样本建立评估标准", "en-US": "Establishing assessment standards based on large-scale standardized samples" }
        },
        {
          "title": { "zh-CN": "多维度分析", "en-US": "Multidimensional Analysis" },
          "detail": { "zh-CN": "从模式识别、空间推理、逻辑演绎和加工速度四个维度评估认知能力", "en-US": "Assessing cognitive abilities from four dimensions: pattern recognition, spatial reasoning, logical deduction, and processing speed" }
        }
      ]
    },
    "disclaimer": {
      "title": { "zh-CN": "重要声明与使用说明", "en-US": "Important Disclaimer and Instructions" },
      "items": [
        { "zh-CN": "本测试为图形推理能力模拟测试，非正式标准化智商测试。", "en-US": "This test is a simulated graphical reasoning ability test, not an official standardized IQ test." },
        { "zh-CN": "测试结果受环境、状态、对题型熟悉度等多种因素影响，建议在最佳状态下测试。", "en-US": "Test results are influenced by various factors such as environment, state, and familiarity with the question type. It is recommended to take the test under optimal conditions." },
        { "zh-CN": "认知能力可通过训练提升，本报告结果反映当前测试表现。", "en-US": "Cognitive abilities can be improved through training, and this report reflects current test performance." },
        { "zh-CN": "正式的智商测试需由专业人员在标准化环境下进行，本报告结果仅供参考。", "en-US": "An official IQ test must be conducted by professionals in a standardized environment, and this report is for reference only." },
        { "zh-CN": "门萨协会的正式入会测试需通过其官方渠道报名参加。", "en-US": "The official Mensa membership test must be registered through its official channels." }
      ]
    },
    "footer": {
      "copyright": { "zh-CN": "© 2024 认知能力评估中心", "en-US": "© 2024 Cognitive Ability Assessment Center" },
      "generatedAtTemplate": { "zh-CN": "本报告生成时间: {generatedAt}", "en-US": "Report Generated At: {generatedAt}" },
      "reportIdTemplate": { "zh-CN": "报告ID: {reportId} | 版本: {reportVersion}", "en-US": "Report ID: {reportId} | Version: {reportVersion}" },
      "miniDisclaimer": {
        "zh-CN": "免责声明: 本报告基于模拟测试生成，仅供参考和教育目的，不作为正式评估或诊断依据。",
        "en-US": "Disclaimer: This report is generated based on a simulated test, for reference and educational purposes only, and not for official evaluation or diagnostic purposes."
      }
    },
    "ui": {
      "printButtonText": { "zh-CN": "打印本报告", "en-US": "Print This Report" }
    }
  }
}
