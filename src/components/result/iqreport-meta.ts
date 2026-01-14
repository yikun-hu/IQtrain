import { Translation } from "@/i18n/translations";

export const iqReportMeta = (t: Translation) => ({
  "schemaVersion": "1.0.0",
  "locale": "zh-CN",
  "scoring": {
    "iqScale": { "sd": 15, "label": t.iqreport.iqEstimate },
    "levels": 5,
    "selectLevelByIq": "inclusive",
    "defaultIqRangeClamp": [0, 200]
  },
  "rendering": {
    "titleTemplate": t.iqreport.reportTitleTemplate,
    "header": {
      "watermarkText": t.iqreport.watermark,
      "title": t.iqreport.reportHeaderTitle,
      "subtitle": t.iqreport.reportSubtitle
    },
    "meta": {
      "items": [
        { "key": "iq", "label": t.iqreport.iqEstimate, "valueFrom": "score.iq" },
        { "key": "percentile", "label": t.iqreport.percentile, "valueFrom": "level.percentile" },
        { "key": "accuracy", "label": t.iqreport.testAccuracy, "valueFrom": "computed.accuracyText" },
        { "key": "testDate", "label": t.iqreport.testDate, "valueFrom": "computed.testDateText" }
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
      "name": t.iqreport.l1Name,
      "iqRange": [130, 200],
      "percentile": t.iqreport.l1Percentile,
      "descriptionShort": t.iqreport.l1DescShort,
      "colors": {
        "headerGradient": "linear-gradient(135deg, #8A2BE2 0%, #5D0C9D 100%)",
        "accent": "#8A2BE2",
        "accentDark": "#5D0C9D",
        "badgeText": "#5D0C9D",
        "badgeGradient": "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
      },
      "reportTitle": t.iqreport.l1ReportTitle,
      "overview": {
        "leadTemplate": t.iqreport.l1Lead,
        "body": t.iqreport.l1Body
      },
      "cognitiveProfile": {
        "patternRecognition": 96,
        "spatialReasoning": 94,
        "logicalDeduction": 92,
        "processingSpeed": 88
      },
      "cognitiveLabels": [
        { "key": "patternRecognition", "label": t.iqreport.cogPattern },
        { "key": "spatialReasoning", "label": t.iqreport.cogSpatial },
        { "key": "logicalDeduction", "label": t.iqreport.cogLogical },
        { "key": "processingSpeed", "label": t.iqreport.cogSpeed }
      ],
      "comparativeAnalysis": t.iqreport.l1Analysis,
      "chart": {
        "type": "simpleBars",
        "bars": [
          { "label": t.iqreport.labelTop50, "heightPct": 40, "color": "#e0e0e0" },
          { "label": t.iqreport.labelTop16, "heightPct": 60, "color": "#c0c0c0" },
          { "label": t.iqreport.labelTop5, "heightPct": 80, "color": "#a0a0a0" },
          { "labelTemplate": t.iqreport.labelYou, "heightPct": 95, "colorFrom": "level.colors.accent" }
        ],
        "note": t.iqreport.chartNoteNormal
      },
      "strengths": [
        { "title": t.iqreport.l1Str1Title, "detail": t.iqreport.l1Str1Detail },
        { "title": t.iqreport.l1Str2Title, "detail": t.iqreport.l1Str2Detail },
        { "title": t.iqreport.l1Str3Title, "detail": t.iqreport.l1Str3Detail },
        { "title": t.iqreport.l1Str4Title, "detail": t.iqreport.l1Str4Detail }
      ],
      "recommendations": [
        { "title": t.iqreport.l1Rec1Title, "detail": t.iqreport.l1Rec1Detail },
        { "title": t.iqreport.l1Rec2Title, "detail": t.iqreport.l1Rec2Detail },
        { "title": t.iqreport.l1Rec3Title, "detail": t.iqreport.l1Rec3Detail },
        { "title": t.iqreport.l1Rec4Title, "detail": t.iqreport.l1Rec4Detail }
      ],
      "trainingPlan": {
        "title": t.iqreport.trainTitle,
        "intro": t.iqreport.l1TrainIntro,
        "items": [
          t.iqreport.l1TrainItem1,
          t.iqreport.l1TrainItem2,
          t.iqreport.l1TrainItem3,
          t.iqreport.l1TrainItem4
        ],
        "style": { "backgroundColor": "#f0f8ff", "radius": 8, "padding": 20 }
      },
      "certificate": {
        "titleTemplate": t.iqreport.reportTitleTemplate,
        "paragraphs": [
          t.iqreport.l1CertP1,
          t.iqreport.l1CertP2,
          t.iqreport.l1CertP3
        ],
        "idPrefix": "MENSA-REPORT",
        "idTemplate": "MENSA-REPORT-001-{YYYY}-{iq}",
        "dateLineTemplate": t.iqreport.certDateLine,
        "footnote": t.iqreport.certFootnote
      }
    },
    {
      "id": 2,
      "name": t.iqreport.l2Name,
      "iqRange": [115, 129],
      "percentile": t.iqreport.l2Percentile,
      "descriptionShort": t.iqreport.l2DescShort,
      "colors": {
        "headerGradient": "linear-gradient(135deg, #1E90FF 0%, #0B5FB5 100%)",
        "accent": "#1E90FF",
        "accentDark": "#0B5FB5",
        "badgeText": "#0B5FB5",
        "badgeGradient": "linear-gradient(135deg, #D9F2FF 0%, #8FD3FF 100%)"
      },
      "reportTitle": t.iqreport.l2ReportTitle,
      "overview": {
        "leadTemplate": t.iqreport.l2Lead,
        "body": t.iqreport.l2Body
      },
      "cognitiveProfile": {
        "patternRecognition": 86,
        "spatialReasoning": 84,
        "logicalDeduction": 85,
        "processingSpeed": 82
      },
      "cognitiveLabels": [
        { "key": "patternRecognition", "label": t.iqreport.cogPattern },
        { "key": "spatialReasoning", "label": t.iqreport.cogSpatial },
        { "key": "logicalDeduction", "label": t.iqreport.cogLogical },
        { "key": "processingSpeed", "label": t.iqreport.cogSpeed }
      ],
      "comparativeAnalysis": t.iqreport.l2Analysis,
      "chart": {
        "type": "simpleBars",
        "bars": [
          { "label": t.iqreport.labelTop50, "heightPct": 40, "color": "#e0e0e0" },
          { "labelTemplate": t.iqreport.labelYou, "heightPct": 80, "colorFrom": "level.colors.accent" },
          { "label": t.iqreport.labelTop5, "heightPct": 90, "color": "#a0a0a0" }
        ],
        "note": t.iqreport.chartNoteSimple
      },
      "strengths": [
        { "title": t.iqreport.l2Str1Title, "detail": t.iqreport.l2Str1Detail },
        { "title": t.iqreport.l2Str2Title, "detail": t.iqreport.l2Str2Detail },
        { "title": t.iqreport.l2Str3Title, "detail": t.iqreport.l2Str3Detail },
        { "title": t.iqreport.l2Str4Title, "detail": t.iqreport.l2Str4Detail }
      ],
      "recommendations": [
        { "title": t.iqreport.l2Rec1Title, "detail": t.iqreport.l2Rec1Detail },
        { "title": t.iqreport.l2Rec2Title, "detail": t.iqreport.l2Rec2Detail },
        { "title": t.iqreport.l2Rec3Title, "detail": t.iqreport.l2Rec3Detail },
        { "title": t.iqreport.l2Rec4Title, "detail": t.iqreport.l2Rec4Detail }
      ],
      "trainingPlan": {
        "title": t.iqreport.trainTitle,
        "intro": t.iqreport.l2TrainIntro,
        "items": [
          t.iqreport.l2TrainItem1,
          t.iqreport.l2TrainItem2,
          t.iqreport.l2TrainItem3,
          t.iqreport.l2TrainItem4
        ],
        "style": { "backgroundColor": "#f0f8ff", "radius": 8, "padding": 20 }
      },
      "certificate": {
        "titleTemplate": t.iqreport.reportTitleTemplate,
        "paragraphs": [
          t.iqreport.l2CertP1,
          t.iqreport.l2CertP2,
          t.iqreport.l2CertP3
        ],
        "idPrefix": "MENSA-REPORT",
        "idTemplate": "MENSA-REPORT-001-{YYYY}-{iq}",
        "dateLineTemplate": t.iqreport.certDateLine,
        "footnote": t.iqreport.certFootnote
      }
    },
    {
      "id": 3,
      "name": t.iqreport.l3Name,
      "iqRange": [100, 114],
      "percentile": t.iqreport.l3Percentile,
      "descriptionShort": t.iqreport.l3DescShort,
      "colors": {
        "headerGradient": "linear-gradient(135deg, #32CD32 0%, #1E8E1E 100%)",
        "accent": "#32CD32",
        "accentDark": "#1E8E1E",
        "badgeText": "#1E8E1E",
        "badgeGradient": "linear-gradient(135deg, #E8FFE8 0%, #B9F6B9 100%)"
      },
      "reportTitle": t.iqreport.l3ReportTitle,
      "overview": {
        "leadTemplate": t.iqreport.l3Lead,
        "body": t.iqreport.l3Body
      },
      "cognitiveProfile": {
        "patternRecognition": 76,
        "spatialReasoning": 73,
        "logicalDeduction": 75,
        "processingSpeed": 71
      },
      "cognitiveLabels": [
        { "key": "patternRecognition", "label": t.iqreport.cogPattern },
        { "key": "spatialReasoning", "label": t.iqreport.cogSpatial },
        { "key": "logicalDeduction", "label": t.iqreport.cogLogical },
        { "key": "processingSpeed", "label": t.iqreport.cogSpeed }
      ],
      "comparativeAnalysis": t.iqreport.l3Analysis,
      "chart": {
        "type": "simpleBars",
        "bars": [
          { "labelTemplate": t.iqreport.labelYou, "heightPct": 60, "colorFrom": "level.colors.accent" },
          { "label": t.iqreport.labelTop16, "heightPct": 80, "color": "#c0c0c0" }
        ],
        "note": t.iqreport.chartNoteSimple
      },
      "strengths": [
        { "title": t.iqreport.l3Str1Title, "detail": t.iqreport.l3Str1Detail },
        { "title": t.iqreport.l3Str2Title, "detail": t.iqreport.l3Str2Detail },
        { "title": t.iqreport.l3Str3Title, "detail": t.iqreport.l3Str3Detail },
        { "title": t.iqreport.l3Str4Title, "detail": t.iqreport.l3Str4Detail }
      ],
      "recommendations": [
        { "title": t.iqreport.l3Rec1Title, "detail": t.iqreport.l3Rec1Detail },
        { "title": t.iqreport.l3Rec2Title, "detail": t.iqreport.l3Rec2Detail },
        { "title": t.iqreport.l3Rec3Title, "detail": t.iqreport.l3Rec3Detail },
        { "title": t.iqreport.l3Rec4Title, "detail": t.iqreport.l3Rec4Detail }
      ],
      "trainingPlan": {
        "title": t.iqreport.trainTitle,
        "intro": t.iqreport.l3TrainIntro,
        "items": [
          t.iqreport.l3TrainItem1,
          t.iqreport.l3TrainItem2,
          t.iqreport.l3TrainItem3,
          t.iqreport.l3TrainItem4
        ],
        "style": { "backgroundColor": "#f0f8ff", "radius": 8, "padding": 20 }
      },
      "certificate": {
        "titleTemplate": t.iqreport.reportTitleTemplate,
        "paragraphs": [
          t.iqreport.l3CertP1,
          t.iqreport.l3CertP2,
          t.iqreport.l3CertP3
        ],
        "idPrefix": "MENSA-REPORT",
        "idTemplate": "MENSA-REPORT-001-{YYYY}-{iq}",
        "dateLineTemplate": t.iqreport.certDateLine,
        "footnote": t.iqreport.certFootnote
      }
    },
    {
      "id": 4,
      "name": t.iqreport.l4Name,
      "iqRange": [85, 99],
      "percentile": t.iqreport.l4Percentile,
      "descriptionShort": t.iqreport.l4DescShort,
      "colors": {
        "headerGradient": "linear-gradient(135deg, #FFA500 0%, #CC7A00 100%)",
        "accent": "#FFA500",
        "accentDark": "#CC7A00",
        "badgeText": "#7A4A00",
        "badgeGradient": "linear-gradient(135deg, #FFE6BF 0%, #FFC266 100%)"
      },
      "reportTitle": t.iqreport.l4ReportTitle,
      "overview": {
        "leadTemplate": t.iqreport.l4Lead,
        "body": t.iqreport.l4Body
      },
      "cognitiveProfile": {
        "patternRecognition": 66,
        "spatialReasoning": 63,
        "logicalDeduction": 65,
        "processingSpeed": 61
      },
      "cognitiveLabels": [
        { "key": "patternRecognition", "label": t.iqreport.cogPattern },
        { "key": "spatialReasoning", "label": t.iqreport.cogSpatial },
        { "key": "logicalDeduction", "label": t.iqreport.cogLogical },
        { "key": "processingSpeed", "label": t.iqreport.cogSpeed }
      ],
      "comparativeAnalysis": t.iqreport.l4Analysis,
      "chart": {
        "type": "simpleBars",
        "bars": [
          { "label": t.iqreport.labelTop50, "heightPct": 60, "color": "#e0e0e0" },
          { "labelTemplate": t.iqreport.labelYou, "heightPct": 70, "colorFrom": "level.colors.accent" }
        ],
        "note": t.iqreport.chartNoteSimple
      },
      "strengths": [
        { "title": t.iqreport.l4Str1Title, "detail": t.iqreport.l4Str1Detail },
        { "title": t.iqreport.l4Str2Title, "detail": t.iqreport.l4Str2Detail },
        { "title": t.iqreport.l4Str3Title, "detail": t.iqreport.l4Str3Detail },
        { "title": t.iqreport.l4Str4Title, "detail": t.iqreport.l4Str4Detail }
      ],
      "recommendations": [
        { "title": t.iqreport.l4Rec1Title, "detail": t.iqreport.l4Rec1Detail },
        { "title": t.iqreport.l4Rec2Title, "detail": t.iqreport.l4Rec2Detail },
        { "title": t.iqreport.l4Rec3Title, "detail": t.iqreport.l4Rec3Detail },
        { "title": t.iqreport.l4Rec4Title, "detail": t.iqreport.l4Rec4Detail }
      ],
      "trainingPlan": {
        "title": t.iqreport.trainTitle,
        "intro": t.iqreport.l4TrainIntro,
        "items": [
          t.iqreport.l4TrainItem1,
          t.iqreport.l4TrainItem2,
          t.iqreport.l4TrainItem3,
          t.iqreport.l4TrainItem4
        ],
        "style": { "backgroundColor": "#f0f8ff", "radius": 8, "padding": 20 }
      },
      "certificate": {
        "titleTemplate": t.iqreport.reportTitleTemplate,
        "paragraphs": [
          t.iqreport.l4CertP1,
          t.iqreport.l4CertP2,
          t.iqreport.l4CertP3
        ],
        "idPrefix": "MENSA-REPORT",
        "idTemplate": "MENSA-REPORT-001-{YYYY}-{iq}",
        "dateLineTemplate": t.iqreport.certDateLine,
        "footnote": t.iqreport.certFootnote
      }
    },
    {
      "id": 5,
      "name": t.iqreport.l5Name,
      "iqRange": [0, 84],
      "percentile": t.iqreport.l5Percentile,
      "descriptionShort": t.iqreport.l5DescShort,
      "colors": {
        "headerGradient": "linear-gradient(135deg, #FF4500 0%, #B53000 100%)",
        "accent": "#FF4500",
        "accentDark": "#B53000",
        "badgeText": "#7A1E00",
        "badgeGradient": "linear-gradient(135deg, #FFD1C2 0%, #FF8A66 100%)"
      },
      "reportTitle": t.iqreport.l5ReportTitle,
      "overview": {
        "leadTemplate": t.iqreport.l5Lead,
        "body": t.iqreport.l5Body
      },
      "cognitiveProfile": {
        "patternRecognition": 58,
        "spatialReasoning": 55,
        "logicalDeduction": 56,
        "processingSpeed": 54
      },
      "cognitiveLabels": [
        { "key": "patternRecognition", "label": t.iqreport.cogPattern },
        { "key": "spatialReasoning", "label": t.iqreport.cogSpatial },
        { "key": "logicalDeduction", "label": t.iqreport.cogLogical },
        { "key": "processingSpeed", "label": t.iqreport.cogSpeed }
      ],
      "comparativeAnalysis": t.iqreport.l5Analysis,
      "chart": {
        "type": "simpleBars",
        "bars": [
          { "labelTemplate": t.iqreport.labelYou, "heightPct": 45, "colorFrom": "level.colors.accent" },
          { "label": t.iqreport.labelTop84, "heightPct": 70, "color": "#c0c0c0" }
        ],
        "note": t.iqreport.chartNoteSimple
      },
      "strengths": [
        { "title": t.iqreport.l5Str1Title, "detail": t.iqreport.l5Str1Detail },
        { "title": t.iqreport.l5Str2Title, "detail": t.iqreport.l5Str2Detail },
        { "title": t.iqreport.l5Str3Title, "detail": t.iqreport.l5Str3Detail },
        { "title": t.iqreport.l5Str4Title, "detail": t.iqreport.l5Str4Detail }
      ],
      "recommendations": [
        { "title": t.iqreport.l5Rec1Title, "detail": t.iqreport.l5Rec1Detail },
        { "title": t.iqreport.l5Rec2Title, "detail": t.iqreport.l5Rec2Detail },
        { "title": t.iqreport.l5Rec3Title, "detail": t.iqreport.l5Rec3Detail },
        { "title": t.iqreport.l5Rec4Title, "detail": t.iqreport.l5Rec4Detail }
      ],
      "trainingPlan": {
        "title": t.iqreport.trainTitle,
        "intro": t.iqreport.l5TrainIntro,
        "items": [
          t.iqreport.l5TrainItem1,
          t.iqreport.l5TrainItem2,
          t.iqreport.l5TrainItem3,
          t.iqreport.l5TrainItem4
        ],
        "style": { "backgroundColor": "#f0f8ff", "radius": 8, "padding": 20 }
      },
      "certificate": {
        "titleTemplate": t.iqreport.reportTitleTemplate,
        "paragraphs": [
          t.iqreport.l5CertP1,
          t.iqreport.l5CertP2,
          t.iqreport.l5CertP3
        ],
        "idPrefix": "MENSA-REPORT",
        "idTemplate": "MENSA-REPORT-001-{YYYY}-{iq}",
        "dateLineTemplate": t.iqreport.certDateLine,
        "footnote": t.iqreport.certFootnote
      }
    }
  ],
  "commonSections": {
    "science": {
      "title": t.iqreport.scienceTitle,
      "intro": t.iqreport.scienceIntro,
      "items": [
        { "title": t.iqreport.sciItem1Title, "detail": t.iqreport.sciItem1Detail },
        { "title": t.iqreport.sciItem2Title, "detail": t.iqreport.sciItem2Detail },
        { "title": t.iqreport.sciItem3Title, "detail": t.iqreport.sciItem3Detail },
        { "title": t.iqreport.sciItem4Title, "detail": t.iqreport.sciItem4Detail }
      ]
    },
    "disclaimer": {
      "title": t.iqreport.discTitle,
      "items": [
        t.iqreport.discItem1,
        t.iqreport.discItem2,
        t.iqreport.discItem3,
        t.iqreport.discItem4,
        t.iqreport.discItem5
      ]
    },
    "footer": {
      "copyright": t.iqreport.footerCopy,
      "generatedAtTemplate": t.iqreport.footerGen,
      "reportIdTemplate": t.iqreport.footerReportId,
      "miniDisclaimer": t.iqreport.footerMiniDisc
    },
    "ui": {
      "printButtonText": t.iqreport.printBtn
    }
  }
})