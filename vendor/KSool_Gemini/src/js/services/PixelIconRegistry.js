/**
 * PixelIconRegistry - K-SOOL Custom Handcrafted Pixel & HD Art System
 * 
 * Supports 3 switchable visualization styles:
 * 1. 'hd'    : 💎 고급형태 (32x32 High-Detail Custom Vector/Pixel Art with Depth & Shading)
 * 2. 'dot'   : 👾 도트형태 (16x16 Retro Classic Pixel Art with Crisp Edges)
 * 3. 'emoji' : ✨ 기본이모지 (Universal Unicode Emojis)
 * 
 * Preserves full backwards compatibility and real-time live re-rendering across all views.
 */
(function() {
  window.KSool = window.KSool || {};

  // 1. [👾 16x16 레트로 클래식 도트 스프라이트 (117종 전 아이템 순수 도트 통일)]
  const SPRITE_DATA_DOT = {
  "soju": {
    "key": "soju",
    "name": "소주",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#15803d\"/><rect x=\"7\" y=\"2\" width=\"1\" height=\"4\" fill=\"#86efac\"/><rect x=\"8\" y=\"2\" width=\"2\" height=\"4\" fill=\"#22c55e\"/><rect x=\"5\" y=\"6\" width=\"2\" height=\"1\" fill=\"#86efac\"/><rect x=\"7\" y=\"6\" width=\"4\" height=\"1\" fill=\"#22c55e\"/><rect x=\"4\" y=\"7\" width=\"1\" height=\"8\" fill=\"#16a34a\"/><rect x=\"5\" y=\"7\" width=\"1\" height=\"8\" fill=\"#4ade80\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"8\" fill=\"#22c55e\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"8\" fill=\"#166534\"/><rect x=\"5\" y=\"9\" width=\"5\" height=\"4\" fill=\"#ffffff\"/><rect x=\"6\" y=\"10\" width=\"3\" height=\"1\" fill=\"#0284c7\"/><rect x=\"7\" y=\"11\" width=\"1\" height=\"1\" fill=\"#ef4444\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#14532d\"/>"
  },
  "beer": {
    "key": "beer",
    "name": "맥주",
    "innerSvg": "<rect x=\"6\" y=\"0\" width=\"4\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#fde047\"/><rect x=\"7\" y=\"2\" width=\"1\" height=\"4\" fill=\"#d97706\"/><rect x=\"8\" y=\"2\" width=\"2\" height=\"4\" fill=\"#78350f\"/><rect x=\"5\" y=\"6\" width=\"2\" height=\"1\" fill=\"#b45309\"/><rect x=\"7\" y=\"6\" width=\"4\" height=\"1\" fill=\"#78350f\"/><rect x=\"4\" y=\"7\" width=\"1\" height=\"8\" fill=\"#451a03\"/><rect x=\"5\" y=\"7\" width=\"1\" height=\"8\" fill=\"#d97706\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"8\" fill=\"#78350f\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"8\" fill=\"#260e02\"/><rect x=\"5\" y=\"9\" width=\"5\" height=\"4\" fill=\"#1d4ed8\"/><rect x=\"6\" y=\"9\" width=\"3\" height=\"4\" fill=\"#fde047\"/><rect x=\"7\" y=\"10\" width=\"1\" height=\"2\" fill=\"#ef4444\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#260e02\"/>"
  },
  "mango_ringo": {
    "key": "mango_ringo",
    "name": "망고링고",
    "innerSvg": "<rect x=\"6\" y=\"0\" width=\"4\" height=\"1\" fill=\"#facc15\"/><rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#eab308\"/><rect x=\"7\" y=\"2\" width=\"1\" height=\"4\" fill=\"#86efac\"/><rect x=\"8\" y=\"2\" width=\"2\" height=\"4\" fill=\"#22c55e\"/><rect x=\"5\" y=\"6\" width=\"2\" height=\"1\" fill=\"#4ade80\"/><rect x=\"7\" y=\"6\" width=\"4\" height=\"1\" fill=\"#16a34a\"/><rect x=\"4\" y=\"7\" width=\"1\" height=\"8\" fill=\"#15803d\"/><rect x=\"5\" y=\"7\" width=\"1\" height=\"8\" fill=\"#4ade80\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"8\" fill=\"#22c55e\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"8\" fill=\"#14532d\"/><rect x=\"5\" y=\"9\" width=\"5\" height=\"4\" fill=\"#fde047\"/><rect x=\"6\" y=\"9\" width=\"3\" height=\"3\" fill=\"#f97316\"/><rect x=\"7\" y=\"9\" width=\"1\" height=\"1\" fill=\"#15803d\"/><rect x=\"5\" y=\"9\" width=\"5\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#14532d\"/>"
  },
  "maesilju": {
    "key": "maesilju",
    "name": "매화수",
    "innerSvg": "<rect x=\"6\" y=\"2\" width=\"4\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"7\" y=\"3\" width=\"1\" height=\"3\" fill=\"#ffffff\"/><rect x=\"8\" y=\"3\" width=\"2\" height=\"3\" fill=\"#fef08a\"/><rect x=\"5\" y=\"6\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"6\" width=\"4\" height=\"1\" fill=\"#fde047\"/><rect x=\"4\" y=\"7\" width=\"1\" height=\"7\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"7\" width=\"1\" height=\"7\" fill=\"#ffffff\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"7\" fill=\"#fde047\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"7\" fill=\"#ca8a04\"/><rect x=\"5\" y=\"8\" width=\"5\" height=\"4\" fill=\"#fffbeb\"/><rect x=\"7\" y=\"9\" width=\"1\" height=\"2\" fill=\"#78350f\"/><rect x=\"6\" y=\"9\" width=\"1\" height=\"1\" fill=\"#f472b6\"/><rect x=\"8\" y=\"9\" width=\"1\" height=\"1\" fill=\"#f472b6\"/><rect x=\"7\" y=\"8\" width=\"1\" height=\"1\" fill=\"#ec4899\"/><rect x=\"7\" y=\"10\" width=\"1\" height=\"1\" fill=\"#f472b6\"/><rect x=\"7\" y=\"9\" width=\"1\" height=\"1\" fill=\"#fde047\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#a16207\"/>"
  },
  "bokbunjaju": {
    "key": "bokbunjaju",
    "name": "복분자주",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"7\" y=\"2\" width=\"1\" height=\"4\" fill=\"#a855f7\"/><rect x=\"8\" y=\"2\" width=\"2\" height=\"4\" fill=\"#581c87\"/><rect x=\"5\" y=\"6\" width=\"2\" height=\"1\" fill=\"#7e22ce\"/><rect x=\"7\" y=\"6\" width=\"4\" height=\"1\" fill=\"#3b0764\"/><rect x=\"4\" y=\"7\" width=\"1\" height=\"8\" fill=\"#2e1065\"/><rect x=\"5\" y=\"7\" width=\"1\" height=\"8\" fill=\"#9333ea\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"8\" fill=\"#3b0764\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"8\" fill=\"#1e1b4b\"/><rect x=\"5\" y=\"9\" width=\"5\" height=\"4\" fill=\"#fef08a\"/><rect x=\"6\" y=\"10\" width=\"3\" height=\"2\" fill=\"#dc2626\"/><rect x=\"7\" y=\"10\" width=\"1\" height=\"1\" fill=\"#7e22ce\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#1e1b4b\"/>"
  },
  "makgeolli": {
    "key": "makgeolli",
    "name": "막걸리",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#15803d\"/><rect x=\"7\" y=\"2\" width=\"2\" height=\"3\" fill=\"#f8fafc\"/><rect x=\"6\" y=\"2\" width=\"1\" height=\"3\" fill=\"#e2e8f0\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"2\" fill=\"#f1f5f9\"/><rect x=\"4\" y=\"7\" width=\"8\" height=\"8\" fill=\"#f8fafc\"/><rect x=\"4\" y=\"7\" width=\"1\" height=\"8\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"7\" width=\"1\" height=\"8\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"8\" width=\"6\" height=\"5\" fill=\"#15803d\"/><rect x=\"6\" y=\"9\" width=\"4\" height=\"3\" fill=\"#fef08a\"/><rect x=\"7\" y=\"10\" width=\"2\" height=\"1\" fill=\"#1e293b\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/>"
  },
  "ice": {
    "key": "ice",
    "name": "얼음",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"2\" width=\"6\" height=\"1\" fill=\"#f0f9ff\"/><rect x=\"6\" y=\"2\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"1\" fill=\"#e0f2fe\"/><rect x=\"5\" y=\"3\" width=\"4\" height=\"1\" fill=\"#ffffff\"/><rect x=\"4\" y=\"4\" width=\"8\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"6\" y=\"4\" width=\"3\" height=\"1\" fill=\"#f0f9ff\"/><rect x=\"3\" y=\"5\" width=\"1\" height=\"7\" fill=\"#7dd3fc\"/><rect x=\"4\" y=\"5\" width=\"1\" height=\"7\" fill=\"#bae6fd\"/><rect x=\"5\" y=\"5\" width=\"1\" height=\"8\" fill=\"#7dd3fc\"/><rect x=\"6\" y=\"5\" width=\"1\" height=\"8\" fill=\"#38bdf8\"/><rect x=\"7\" y=\"5\" width=\"1\" height=\"8\" fill=\"#bae6fd\"/><rect x=\"4\" y=\"6\" width=\"1\" height=\"2\" fill=\"#ffffff\"/><rect x=\"5\" y=\"8\" width=\"1\" height=\"2\" fill=\"#ffffff\"/><rect x=\"6\" y=\"10\" width=\"1\" height=\"2\" fill=\"#ffffff\"/><rect x=\"4\" y=\"10\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"8\" y=\"5\" width=\"1\" height=\"8\" fill=\"#38bdf8\"/><rect x=\"9\" y=\"5\" width=\"1\" height=\"8\" fill=\"#0ea5e9\"/><rect x=\"10\" y=\"5\" width=\"1\" height=\"7\" fill=\"#0ea5e9\"/><rect x=\"11\" y=\"5\" width=\"1\" height=\"7\" fill=\"#0284c7\"/><rect x=\"12\" y=\"5\" width=\"1\" height=\"6\" fill=\"#0369a1\"/><rect x=\"9\" y=\"7\" width=\"1\" height=\"2\" fill=\"#bae6fd\"/><rect x=\"10\" y=\"9\" width=\"1\" height=\"2\" fill=\"#bae6fd\"/><rect x=\"11\" y=\"6\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"4\" width=\"1\" height=\"9\" fill=\"#ffffff\" opacity=\"0.9\"/><rect x=\"4\" y=\"12\" width=\"4\" height=\"1\" fill=\"#0ea5e9\"/><rect x=\"8\" y=\"13\" width=\"4\" height=\"1\" fill=\"#0284c7\"/><rect x=\"13\" y=\"1\" width=\"1\" height=\"2\" fill=\"#ffffff\"/><rect x=\"12\" y=\"2\" width=\"3\" height=\"1\" fill=\"#ffffff\"/>"
  },
  "water": {
    "key": "water",
    "name": "물",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"6\" y=\"2\" width=\"4\" height=\"2\" fill=\"#0ea5e9\"/><rect x=\"5\" y=\"4\" width=\"6\" height=\"3\" fill=\"#0284c7\"/><rect x=\"4\" y=\"7\" width=\"8\" height=\"4\" fill=\"#0369a1\"/><rect x=\"5\" y=\"11\" width=\"6\" height=\"3\" fill=\"#075985\"/><rect x=\"6\" y=\"14\" width=\"4\" height=\"1\" fill=\"#0c4a6e\"/><rect x=\"6\" y=\"4\" width=\"2\" height=\"4\" fill=\"#ffffff\"/><rect x=\"5\" y=\"6\" width=\"1\" height=\"2\" fill=\"#ffffff\"/><rect x=\"8\" y=\"10\" width=\"2\" height=\"2\" fill=\"#bae6fd\"/>"
  },
  "fire": {
    "key": "fire",
    "name": "불",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"3\" fill=\"#dc2626\"/><rect x=\"7\" y=\"2\" width=\"2\" height=\"2\" fill=\"#ea580c\"/><rect x=\"3\" y=\"4\" width=\"2\" height=\"3\" fill=\"#dc2626\"/><rect x=\"4\" y=\"5\" width=\"1\" height=\"2\" fill=\"#f97316\"/><rect x=\"11\" y=\"3\" width=\"2\" height=\"4\" fill=\"#dc2626\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"2\" fill=\"#f97316\"/><rect x=\"5\" y=\"4\" width=\"3\" height=\"3\" fill=\"#ea580c\"/><rect x=\"8\" y=\"4\" width=\"3\" height=\"3\" fill=\"#ea580c\"/><rect x=\"2\" y=\"7\" width=\"12\" height=\"5\" fill=\"#dc2626\"/><rect x=\"3\" y=\"12\" width=\"10\" height=\"3\" fill=\"#b91c1c\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#991b1b\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"6\" fill=\"#f97316\"/><rect x=\"3\" y=\"8\" width=\"10\" height=\"4\" fill=\"#ea580c\"/><rect x=\"5\" y=\"12\" width=\"6\" height=\"2\" fill=\"#ea580c\"/><rect x=\"5\" y=\"7\" width=\"6\" height=\"5\" fill=\"#fde047\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"6\" fill=\"#facc15\"/><rect x=\"6\" y=\"8\" width=\"4\" height=\"3\" fill=\"#fef08a\"/><rect x=\"7\" y=\"9\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"2\" y=\"3\" width=\"1\" height=\"1\" fill=\"#fde047\"/><rect x=\"13\" y=\"2\" width=\"1\" height=\"1\" fill=\"#f97316\"/>"
  },
  "air": {
    "key": "air",
    "name": "공기",
    "innerSvg": "<rect x=\"3\" y=\"4\" width=\"8\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"11\" y=\"5\" width=\"2\" height=\"2\" fill=\"#7dd3fc\"/><rect x=\"9\" y=\"7\" width=\"2\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"5\" y=\"8\" width=\"7\" height=\"1\" fill=\"#e0f2fe\"/><rect x=\"12\" y=\"9\" width=\"2\" height=\"2\" fill=\"#bae6fd\"/><rect x=\"2\" y=\"11\" width=\"10\" height=\"1\" fill=\"#7dd3fc\"/><rect x=\"12\" y=\"12\" width=\"2\" height=\"2\" fill=\"#38bdf8\"/><rect x=\"10\" y=\"14\" width=\"2\" height=\"1\" fill=\"#0284c7\"/>"
  },
  "snow": {
    "key": "snow",
    "name": "눈",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"14\" fill=\"#38bdf8\"/><rect x=\"1\" y=\"7\" width=\"14\" height=\"2\" fill=\"#38bdf8\"/><rect x=\"4\" y=\"4\" width=\"2\" height=\"2\" fill=\"#7dd3fc\"/><rect x=\"10\" y=\"4\" width=\"2\" height=\"2\" fill=\"#7dd3fc\"/><rect x=\"4\" y=\"10\" width=\"2\" height=\"2\" fill=\"#7dd3fc\"/><rect x=\"10\" y=\"10\" width=\"2\" height=\"2\" fill=\"#7dd3fc\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"4\" fill=\"#ffffff\"/><rect x=\"7\" y=\"5\" width=\"2\" height=\"6\" fill=\"#ffffff\"/><rect x=\"5\" y=\"7\" width=\"6\" height=\"2\" fill=\"#ffffff\"/><rect x=\"7\" y=\"2\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"2\" y=\"7\" width=\"1\" height=\"2\" fill=\"#ffffff\"/><rect x=\"13\" y=\"7\" width=\"1\" height=\"2\" fill=\"#ffffff\"/><rect x=\"7\" y=\"13\" width=\"2\" height=\"1\" fill=\"#ffffff\"/>"
  },
  "rec_ringelju": {
    "key": "rec_ringelju",
    "name": "링겔주",
    "innerSvg": "<rect x=\"5\" y=\"0\" width=\"6\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"4\" y=\"1\" width=\"8\" height=\"4\" fill=\"#fef08a\"/><rect x=\"5\" y=\"1\" width=\"2\" height=\"4\" fill=\"#ffffff\"/><rect x=\"7\" y=\"2\" width=\"2\" height=\"2\" fill=\"#f43f5e\"/><rect x=\"6\" y=\"5\" width=\"4\" height=\"2\" fill=\"#fde047\"/><rect x=\"7\" y=\"6\" width=\"2\" height=\"2\" fill=\"#f59e0b\"/><rect x=\"6\" y=\"8\" width=\"4\" height=\"1\" fill=\"#15803d\"/><rect x=\"5\" y=\"9\" width=\"6\" height=\"1\" fill=\"#22c55e\"/><rect x=\"4\" y=\"10\" width=\"8\" height=\"5\" fill=\"#16a34a\"/><rect x=\"5\" y=\"10\" width=\"2\" height=\"5\" fill=\"#4ade80\"/><rect x=\"5\" y=\"11\" width=\"6\" height=\"3\" fill=\"#ffffff\"/><rect x=\"7\" y=\"12\" width=\"2\" height=\"1\" fill=\"#0284c7\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#14532d\"/>"
  },
  "rec_somaek": {
    "key": "rec_somaek",
    "name": "소맥",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"8\" height=\"2\" fill=\"#ffffff\"/><rect x=\"3\" y=\"4\" width=\"1\" height=\"2\" fill=\"#e2e8f0\"/><rect x=\"12\" y=\"4\" width=\"1\" height=\"2\" fill=\"#e2e8f0\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"8\" fill=\"#f59e0b\"/><rect x=\"4\" y=\"6\" width=\"1\" height=\"8\" fill=\"#fde047\"/><rect x=\"11\" y=\"6\" width=\"1\" height=\"8\" fill=\"#d97706\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#b45309\"/><rect x=\"6\" y=\"15\" width=\"4\" height=\"1\" fill=\"#e2e8f0\"/><rect x=\"5\" y=\"2\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"8\" y=\"1\" width=\"3\" height=\"3\" fill=\"#ffffff\"/><rect x=\"10\" y=\"3\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"6\" y=\"8\" width=\"3\" height=\"4\" fill=\"#86efac\"/><rect x=\"7\" y=\"9\" width=\"1\" height=\"2\" fill=\"#16a34a\"/>"
  },
  "rec_kkulju": {
    "key": "rec_kkulju",
    "name": "꿀주",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"8\" height=\"2\" fill=\"#ffffff\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"8\" fill=\"#f59e0b\"/><rect x=\"5\" y=\"7\" width=\"2\" height=\"4\" fill=\"#fbbf24\"/><rect x=\"4\" y=\"14\" width=\"8\" height=\"1\" fill=\"#d97706\"/><rect x=\"8\" y=\"0\" width=\"1\" height=\"5\" fill=\"#d97706\"/><rect x=\"7\" y=\"4\" width=\"3\" height=\"3\" fill=\"#f59e0b\"/><rect x=\"8\" y=\"7\" width=\"2\" height=\"3\" fill=\"#fde047\"/><rect x=\"7\" y=\"10\" width=\"4\" height=\"2\" fill=\"#f59e0b\"/><rect x=\"6\" y=\"15\" width=\"4\" height=\"1\" fill=\"#e2e8f0\"/>"
  },
  "rec_sotonic": {
    "key": "rec_sotonic",
    "name": "소토닉",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\" fill=\"#e0f2fe\"/><rect x=\"6\" y=\"6\" width=\"3\" height=\"3\" fill=\"#bae6fd\"/><rect x=\"7\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"10\" width=\"3\" height=\"3\" fill=\"#7dd3fc\"/><rect x=\"5\" y=\"9\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"8\" y=\"12\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"2\" y=\"2\" width=\"4\" height=\"4\" fill=\"#fde047\"/><rect x=\"3\" y=\"3\" width=\"2\" height=\"2\" fill=\"#fef08a\"/><rect x=\"3\" y=\"2\" width=\"1\" height=\"1\" fill=\"#84cc16\"/>"
  },
  "rec_gojingamlae": {
    "key": "rec_gojingamlae",
    "name": "고진감래주",
    "innerSvg": "<rect x=\"4\" y=\"3\" width=\"1\" height=\"12\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"3\" width=\"1\" height=\"12\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"5\" y=\"3\" width=\"6\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"4\" width=\"6\" height=\"3\" fill=\"#f59e0b\"/><rect x=\"5\" y=\"7\" width=\"6\" height=\"3\" fill=\"#e0f2fe\"/><rect x=\"6\" y=\"8\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"10\" width=\"6\" height=\"4\" fill=\"#451a03\"/><rect x=\"6\" y=\"11\" width=\"4\" height=\"2\" fill=\"#78350f\"/>"
  },
  "rec_milkisju": {
    "key": "rec_milkisju",
    "name": "밀키스주",
    "innerSvg": "<rect x=\"4\" y=\"3\" width=\"8\" height=\"12\" fill=\"#f8fafc\"/><rect x=\"4\" y=\"3\" width=\"1\" height=\"12\" fill=\"#cbd5e1\"/><rect x=\"11\" y=\"3\" width=\"1\" height=\"12\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"6\" y=\"5\" width=\"2\" height=\"2\" fill=\"#38bdf8\"/><rect x=\"9\" y=\"7\" width=\"2\" height=\"2\" fill=\"#7dd3fc\"/><rect x=\"5\" y=\"9\" width=\"2\" height=\"2\" fill=\"#38bdf8\"/><rect x=\"8\" y=\"11\" width=\"2\" height=\"2\" fill=\"#0ea5e9\"/><rect x=\"6\" y=\"13\" width=\"1\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"9\" y=\"0\" width=\"1\" height=\"5\" fill=\"#0284c7\"/>"
  },
  "rec_energizerju": {
    "key": "rec_energizerju",
    "name": "에너자이저주",
    "innerSvg": "<rect x=\"4\" y=\"3\" width=\"1\" height=\"12\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"3\" width=\"1\" height=\"12\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"5\" y=\"3\" width=\"6\" height=\"6\" fill=\"#00f0ff\"/><rect x=\"6\" y=\"4\" width=\"3\" height=\"2\" fill=\"#e0f2fe\"/><rect x=\"5\" y=\"9\" width=\"6\" height=\"5\" fill=\"#dc2626\"/><rect x=\"6\" y=\"10\" width=\"4\" height=\"3\" fill=\"#f97316\"/><rect x=\"7\" y=\"6\" width=\"2\" height=\"4\" fill=\"#fde047\"/>"
  },
  "rec_taegeukju": {
    "key": "rec_taegeukju",
    "name": "태극주",
    "innerSvg": "<rect x=\"4\" y=\"3\" width=\"1\" height=\"12\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"3\" width=\"1\" height=\"12\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"5\" y=\"3\" width=\"6\" height=\"5\" fill=\"#dc2626\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"2\" fill=\"#ef4444\"/><rect x=\"5\" y=\"8\" width=\"6\" height=\"6\" fill=\"#1d4ed8\"/><rect x=\"6\" y=\"9\" width=\"4\" height=\"3\" fill=\"#2563eb\"/><rect x=\"6\" y=\"7\" width=\"2\" height=\"2\" fill=\"#dc2626\"/><rect x=\"8\" y=\"7\" width=\"2\" height=\"2\" fill=\"#1d4ed8\"/>"
  },
  "rec_pocariju": {
    "key": "rec_pocariju",
    "name": "뽕가리스웨트",
    "innerSvg": "<rect x=\"4\" y=\"3\" width=\"1\" height=\"12\" fill=\"#93c5fd\"/><rect x=\"11\" y=\"3\" width=\"1\" height=\"12\" fill=\"#93c5fd\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#60a5fa\"/><rect x=\"5\" y=\"4\" width=\"6\" height=\"10\" fill=\"#f0f9ff\"/><rect x=\"5\" y=\"8\" width=\"6\" height=\"2\" fill=\"#0284c7\"/><rect x=\"6\" y=\"7\" width=\"2\" height=\"1\" fill=\"#0284c7\"/><rect x=\"8\" y=\"10\" width=\"2\" height=\"1\" fill=\"#0284c7\"/><rect x=\"6\" y=\"5\" width=\"3\" height=\"2\" fill=\"#bae6fd\"/>"
  },
  "rec_dutch_lager": {
    "key": "rec_dutch_lager",
    "name": "더치 라거",
    "innerSvg": "<rect x=\"4\" y=\"3\" width=\"1\" height=\"12\" fill=\"#cbd5e1\"/><rect x=\"11\" y=\"3\" width=\"1\" height=\"12\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"5\" y=\"3\" width=\"6\" height=\"1\" fill=\"#d97706\"/><rect x=\"5\" y=\"4\" width=\"6\" height=\"3\" fill=\"#451a03\"/><rect x=\"6\" y=\"5\" width=\"4\" height=\"1\" fill=\"#78350f\"/><rect x=\"5\" y=\"7\" width=\"6\" height=\"7\" fill=\"#f59e0b\"/><rect x=\"5\" y=\"7\" width=\"1\" height=\"7\" fill=\"#fde047\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"7\" fill=\"#d97706\"/>"
  },
  "rec_tesla": {
    "key": "rec_tesla",
    "name": "테스형라",
    "innerSvg": "<rect x=\"2\" y=\"2\" width=\"2\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"2\" y=\"3\" width=\"2\" height=\"2\" fill=\"#15803d\"/><rect x=\"1\" y=\"5\" width=\"4\" height=\"10\" fill=\"#16a34a\"/><rect x=\"2\" y=\"7\" width=\"2\" height=\"3\" fill=\"#1d4ed8\"/><rect x=\"10\" y=\"3\" width=\"2\" height=\"1\" fill=\"#15803d\"/><rect x=\"10\" y=\"4\" width=\"2\" height=\"2\" fill=\"#22c55e\"/><rect x=\"9\" y=\"6\" width=\"4\" height=\"9\" fill=\"#22c55e\"/><rect x=\"10\" y=\"8\" width=\"2\" height=\"3\" fill=\"#ffffff\"/><rect x=\"6\" y=\"2\" width=\"2\" height=\"2\" fill=\"#fde047\"/><rect x=\"5\" y=\"4\" width=\"2\" height=\"3\" fill=\"#fde047\"/><rect x=\"6\" y=\"6\" width=\"3\" height=\"2\" fill=\"#fde047\"/><rect x=\"5\" y=\"8\" width=\"2\" height=\"3\" fill=\"#f59e0b\"/>"
  },
  "rec_tejina": {
    "key": "rec_tejina",
    "name": "테진아",
    "innerSvg": "<rect x=\"2\" y=\"3\" width=\"2\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"2\" y=\"4\" width=\"2\" height=\"2\" fill=\"#15803d\"/><rect x=\"1\" y=\"6\" width=\"4\" height=\"9\" fill=\"#16a34a\"/><rect x=\"2\" y=\"8\" width=\"2\" height=\"3\" fill=\"#1d4ed8\"/><rect x=\"10\" y=\"3\" width=\"2\" height=\"1\" fill=\"#0284c7\"/><rect x=\"10\" y=\"4\" width=\"2\" height=\"2\" fill=\"#38bdf8\"/><rect x=\"9\" y=\"6\" width=\"4\" height=\"9\" fill=\"#38bdf8\"/><rect x=\"10\" y=\"8\" width=\"2\" height=\"3\" fill=\"#ffffff\"/><rect x=\"10\" y=\"9\" width=\"2\" height=\"1\" fill=\"#ef4444\"/><rect x=\"6\" y=\"3\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"5\" y=\"5\" width=\"3\" height=\"2\" fill=\"#fde047\"/>"
  },
  "rec_casscheorom": {
    "key": "rec_casscheorom",
    "name": "카아스처럼",
    "innerSvg": "<rect x=\"2\" y=\"3\" width=\"2\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"1\" y=\"4\" width=\"4\" height=\"11\" fill=\"#1d4ed8\"/><rect x=\"2\" y=\"7\" width=\"2\" height=\"3\" fill=\"#ffffff\"/><rect x=\"10\" y=\"3\" width=\"2\" height=\"1\" fill=\"#15803d\"/><rect x=\"10\" y=\"4\" width=\"2\" height=\"2\" fill=\"#22c55e\"/><rect x=\"9\" y=\"6\" width=\"4\" height=\"9\" fill=\"#22c55e\"/><rect x=\"10\" y=\"8\" width=\"2\" height=\"3\" fill=\"#ffffff\"/><rect x=\"10\" y=\"9\" width=\"2\" height=\"1\" fill=\"#16a34a\"/><rect x=\"6\" y=\"4\" width=\"2\" height=\"2\" fill=\"#fde047\"/><rect x=\"7\" y=\"3\" width=\"1\" height=\"4\" fill=\"#ffffff\"/><rect x=\"5\" y=\"4\" width=\"4\" height=\"1\" fill=\"#ffffff\"/>"
  },
  "rec_kelly_is_back": {
    "key": "rec_kelly_is_back",
    "name": "캘리포니아 이즈백",
    "innerSvg": "<rect x=\"2\" y=\"3\" width=\"2\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"2\" y=\"4\" width=\"2\" height=\"2\" fill=\"#b45309\"/><rect x=\"1\" y=\"6\" width=\"4\" height=\"9\" fill=\"#b45309\"/><rect x=\"2\" y=\"8\" width=\"2\" height=\"3\" fill=\"#fde047\"/><rect x=\"10\" y=\"3\" width=\"2\" height=\"1\" fill=\"#0284c7\"/><rect x=\"10\" y=\"4\" width=\"2\" height=\"2\" fill=\"#38bdf8\"/><rect x=\"9\" y=\"6\" width=\"4\" height=\"9\" fill=\"#38bdf8\"/><rect x=\"10\" y=\"8\" width=\"2\" height=\"3\" fill=\"#ffffff\"/><rect x=\"6\" y=\"4\" width=\"2\" height=\"2\" fill=\"#ffffff\"/>"
  },
  "rec_castella": {
    "key": "rec_castella",
    "name": "카스텔라",
    "innerSvg": "<rect x=\"1\" y=\"5\" width=\"4\" height=\"10\" fill=\"#1d4ed8\"/><rect x=\"9\" y=\"5\" width=\"4\" height=\"10\" fill=\"#16a34a\"/><rect x=\"3\" y=\"2\" width=\"8\" height=\"3\" fill=\"#ffffff\"/><rect x=\"4\" y=\"1\" width=\"6\" height=\"2\" fill=\"#ffffff\"/><rect x=\"6\" y=\"5\" width=\"2\" height=\"8\" fill=\"#f59e0b\"/><rect x=\"5\" y=\"6\" width=\"4\" height=\"2\" fill=\"#fde047\"/>"
  },
  "rec_maksa": {
    "key": "rec_maksa",
    "name": "막사",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"3\" y=\"11\" width=\"10\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#f8fafc\"/><rect x=\"4\" y=\"7\" width=\"2\" height=\"2\" fill=\"#22c55e\"/><rect x=\"7\" y=\"6\" width=\"2\" height=\"2\" fill=\"#86efac\"/><rect x=\"10\" y=\"8\" width=\"2\" height=\"2\" fill=\"#22c55e\"/><rect x=\"5\" y=\"9\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"8\" y=\"9\" width=\"2\" height=\"1\" fill=\"#ffffff\"/>"
  },
  "rec_honey_makgeolli": {
    "key": "rec_honey_makgeolli",
    "name": "꿀 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#f8fafc\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"4\" fill=\"#f59e0b\"/><rect x=\"7\" y=\"7\" width=\"2\" height=\"2\" fill=\"#fde047\"/><rect x=\"5\" y=\"8\" width=\"2\" height=\"2\" fill=\"#fbbf24\"/><rect x=\"9\" y=\"8\" width=\"2\" height=\"2\" fill=\"#d97706\"/>"
  },
  "rec_strawberry_makgeolli": {
    "key": "rec_strawberry_makgeolli",
    "name": "딸기우유 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#fbcfe8\"/><rect x=\"4\" y=\"7\" width=\"8\" height=\"3\" fill=\"#f472b6\"/><rect x=\"7\" y=\"4\" width=\"3\" height=\"3\" fill=\"#ef4444\"/><rect x=\"8\" y=\"3\" width=\"1\" height=\"1\" fill=\"#15803d\"/><rect x=\"8\" y=\"5\" width=\"1\" height=\"1\" fill=\"#fde047\"/>"
  },
  "rec_banana_milk_makgeolli": {
    "key": "rec_banana_milk_makgeolli",
    "name": "바나나우유 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#fef08a\"/><rect x=\"5\" y=\"7\" width=\"6\" height=\"3\" fill=\"#fde047\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"4\" fill=\"#fde047\"/><rect x=\"7\" y=\"5\" width=\"2\" height=\"2\" fill=\"#fef9c3\"/><rect x=\"8\" y=\"6\" width=\"1\" height=\"1\" fill=\"#78350f\"/>"
  },
  "rec_yuzu_makgeolli": {
    "key": "rec_yuzu_makgeolli",
    "name": "유자 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#fef9c3\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"4\" fill=\"#facc15\"/><rect x=\"7\" y=\"5\" width=\"2\" height=\"2\" fill=\"#fef08a\"/><rect x=\"6\" y=\"3\" width=\"1\" height=\"1\" fill=\"#15803d\"/>"
  },
  "rec_maesil_makgeolli": {
    "key": "rec_maesil_makgeolli",
    "name": "매실 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#f1f5f9\"/><rect x=\"6\" y=\"5\" width=\"4\" height=\"4\" fill=\"#84cc16\"/><rect x=\"7\" y=\"4\" width=\"1\" height=\"1\" fill=\"#78350f\"/>"
  },
  "rec_sikhye_makgeolli": {
    "key": "rec_sikhye_makgeolli",
    "name": "식혜 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#fef3c7\"/><rect x=\"4\" y=\"7\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"6\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"10\" y=\"8\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"6\" y=\"9\" width=\"2\" height=\"1\" fill=\"#ffffff\"/>"
  },
  "rec_misutgaru_makgeolli": {
    "key": "rec_misutgaru_makgeolli",
    "name": "미숫가루 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#78350f\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#522409\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#522409\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#522409\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#d4a373\"/><rect x=\"5\" y=\"7\" width=\"6\" height=\"3\" fill=\"#c5925a\"/><rect x=\"7\" y=\"5\" width=\"2\" height=\"2\" fill=\"#99582a\"/>"
  },
  "rec_peach_makgeolli": {
    "key": "rec_peach_makgeolli",
    "name": "복숭아 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#fed7aa\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"4\" fill=\"#fb923c\"/><rect x=\"7\" y=\"3\" width=\"1\" height=\"1\" fill=\"#15803d\"/>"
  },
  "rec_pear_makgeolli": {
    "key": "rec_pear_makgeolli",
    "name": "배 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#fef08a\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"4\" fill=\"#fde047\"/><rect x=\"7\" y=\"4\" width=\"1\" height=\"1\" fill=\"#78350f\"/>"
  },
  "rec_pineapple_makgeolli": {
    "key": "rec_pineapple_makgeolli",
    "name": "파인애플 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#fef08a\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"4\" fill=\"#eab308\"/><rect x=\"7\" y=\"3\" width=\"2\" height=\"1\" fill=\"#15803d\"/>"
  },
  "rec_yakult_makgeolli": {
    "key": "rec_yakult_makgeolli",
    "name": "요구르트 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#ffedd5\"/><rect x=\"7\" y=\"3\" width=\"3\" height=\"3\" fill=\"#fed7aa\"/><rect x=\"7\" y=\"2\" width=\"3\" height=\"1\" fill=\"#ef4444\"/>"
  },
  "rec_honey_misutgaru_makgeolli": {
    "key": "rec_honey_misutgaru_makgeolli",
    "name": "꿀 미숫가루 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#78350f\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#522409\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#522409\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#522409\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#d4a373\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"3\" fill=\"#f59e0b\"/><rect x=\"7\" y=\"5\" width=\"2\" height=\"2\" fill=\"#fde047\"/>"
  },
  "rec_pomegranate_makgeolli": {
    "key": "rec_pomegranate_makgeolli",
    "name": "석류 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#f43f5e\"/><rect x=\"4\" y=\"7\" width=\"8\" height=\"3\" fill=\"#be123c\"/><rect x=\"7\" y=\"5\" width=\"2\" height=\"2\" fill=\"#ffe4e6\"/>"
  },
  "rec_bibibig_makgeolli": {
    "key": "rec_bibibig_makgeolli",
    "name": "단팥 막걸리",
    "innerSvg": "<rect x=\"2\" y=\"5\" width=\"12\" height=\"1\" fill=\"#eab308\"/><rect x=\"2\" y=\"6\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"6\" fill=\"#a16207\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#f8fafc\"/><rect x=\"6\" y=\"7\" width=\"5\" height=\"3\" fill=\"#5e1820\"/><rect x=\"7\" y=\"4\" width=\"3\" height=\"4\" fill=\"#5e1820\"/>"
  },
  "rec_icheon_makgeolli": {
    "key": "rec_icheon_makgeolli",
    "name": "이천 수라상 생막걸리",
    "innerSvg": "<rect x=\"6\" y=\"2\" width=\"4\" height=\"1\" fill=\"#0284c7\"/><rect x=\"5\" y=\"3\" width=\"6\" height=\"2\" fill=\"#f8fafc\"/><rect x=\"4\" y=\"5\" width=\"8\" height=\"8\" fill=\"#f8fafc\"/><rect x=\"4\" y=\"5\" width=\"1\" height=\"8\" fill=\"#cbd5e1\"/><rect x=\"11\" y=\"5\" width=\"1\" height=\"8\" fill=\"#94a3b8\"/><rect x=\"5\" y=\"13\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"7\" y=\"6\" width=\"2\" height=\"5\" fill=\"#f59e0b\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"1\" fill=\"#fde047\"/><rect x=\"6\" y=\"9\" width=\"4\" height=\"1\" fill=\"#fde047\"/>"
  },
  "rec_hallasan_sotonic": {
    "key": "rec_hallasan_sotonic",
    "name": "제주 화산 쏘토닉",
    "innerSvg": "<rect x=\"3\" y=\"3\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"3\" y=\"4\" width=\"2\" height=\"2\" fill=\"#e0f2fe\"/><rect x=\"2\" y=\"6\" width=\"4\" height=\"9\" fill=\"#e0f2fe\"/><rect x=\"3\" y=\"8\" width=\"2\" height=\"3\" fill=\"#0284c7\"/><rect x=\"8\" y=\"5\" width=\"6\" height=\"10\" fill=\"#38bdf8\"/><rect x=\"9\" y=\"6\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"8\" y=\"2\" width=\"3\" height=\"3\" fill=\"#fde047\"/><rect x=\"11\" y=\"12\" width=\"4\" height=\"3\" fill=\"#1e293b\"/>"
  },
  "melona": {
    "key": "melona",
    "name": "올때메론바",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"11\" fill=\"#86efac\"/><rect x=\"5\" y=\"1\" width=\"1\" height=\"11\" fill=\"#4ade80\"/><rect x=\"7\" y=\"1\" width=\"1\" height=\"11\" fill=\"#bbf7d0\"/><rect x=\"9\" y=\"1\" width=\"1\" height=\"11\" fill=\"#4ade80\"/><rect x=\"10\" y=\"1\" width=\"1\" height=\"11\" fill=\"#22c55e\"/><rect x=\"7\" y=\"12\" width=\"2\" height=\"4\" fill=\"#d97706\"/><rect x=\"7\" y=\"12\" width=\"1\" height=\"4\" fill=\"#fde68a\"/>"
  },
  "screwbar": {
    "key": "screwbar",
    "name": "배배꼬인바",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"1\" fill=\"#ef4444\"/><rect x=\"6\" y=\"2\" width=\"4\" height=\"1\" fill=\"#ef4444\"/><rect x=\"5\" y=\"3\" width=\"2\" height=\"1\" fill=\"#ef4444\"/><rect x=\"7\" y=\"3\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"10\" y=\"3\" width=\"1\" height=\"1\" fill=\"#ef4444\"/><rect x=\"4\" y=\"4\" width=\"2\" height=\"1\" fill=\"#dc2626\"/><rect x=\"6\" y=\"4\" width=\"3\" height=\"1\" fill=\"#ef4444\"/><rect x=\"9\" y=\"4\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"4\" y=\"5\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"6\" y=\"5\" width=\"3\" height=\"1\" fill=\"#ef4444\"/><rect x=\"9\" y=\"5\" width=\"2\" height=\"1\" fill=\"#dc2626\"/><rect x=\"4\" y=\"6\" width=\"1\" height=\"1\" fill=\"#dc2626\"/><rect x=\"5\" y=\"6\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"8\" y=\"6\" width=\"3\" height=\"1\" fill=\"#ef4444\"/><rect x=\"4\" y=\"7\" width=\"2\" height=\"1\" fill=\"#ef4444\"/><rect x=\"6\" y=\"7\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"9\" y=\"7\" width=\"2\" height=\"1\" fill=\"#ef4444\"/><rect x=\"4\" y=\"8\" width=\"2\" height=\"1\" fill=\"#dc2626\"/><rect x=\"6\" y=\"8\" width=\"3\" height=\"1\" fill=\"#ef4444\"/><rect x=\"9\" y=\"8\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"4\" y=\"9\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"6\" y=\"9\" width=\"3\" height=\"1\" fill=\"#ef4444\"/><rect x=\"9\" y=\"9\" width=\"2\" height=\"1\" fill=\"#dc2626\"/><rect x=\"5\" y=\"10\" width=\"6\" height=\"1\" fill=\"#ef4444\"/><rect x=\"7\" y=\"11\" width=\"2\" height=\"5\" fill=\"#d97706\"/><rect x=\"7\" y=\"11\" width=\"1\" height=\"5\" fill=\"#fde68a\"/>"
  },
  "tankboy": {
    "key": "tankboy",
    "name": "배즙보이",
    "innerSvg": "<rect x=\"7\" y=\"0\" width=\"2\" height=\"2\" fill=\"#eab308\"/><rect x=\"6\" y=\"2\" width=\"4\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"5\" y=\"3\" width=\"6\" height=\"3\" fill=\"#facc15\"/><rect x=\"4\" y=\"4\" width=\"1\" height=\"2\" fill=\"#fde047\"/><rect x=\"6\" y=\"4\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"2\" fill=\"#eab308\"/><rect x=\"5\" y=\"8\" width=\"6\" height=\"5\" fill=\"#facc15\"/><rect x=\"4\" y=\"9\" width=\"1\" height=\"3\" fill=\"#fde047\"/><rect x=\"6\" y=\"9\" width=\"4\" height=\"3\" fill=\"#ffffff\"/><rect x=\"7\" y=\"10\" width=\"2\" height=\"1\" fill=\"#16a34a\"/><rect x=\"10\" y=\"8\" width=\"1\" height=\"5\" fill=\"#ca8a04\"/><rect x=\"5\" y=\"13\" width=\"6\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"6\" y=\"14\" width=\"4\" height=\"1\" fill=\"#a16207\"/>"
  },
  "jawsbar": {
    "key": "jawsbar",
    "name": "상어바",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"4\" height=\"2\" fill=\"#64748b\"/><rect x=\"5\" y=\"3\" width=\"6\" height=\"7\" fill=\"#475569\"/><rect x=\"4\" y=\"4\" width=\"1\" height=\"5\" fill=\"#64748b\"/><rect x=\"7\" y=\"5\" width=\"4\" height=\"4\" fill=\"#dc2626\"/><rect x=\"8\" y=\"6\" width=\"3\" height=\"2\" fill=\"#ef4444\"/><rect x=\"6\" y=\"5\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"6\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"9\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"10\" width=\"2\" height=\"5\" fill=\"#d97706\"/>"
  },
  "bibibig": {
    "key": "bibibig",
    "name": "단팥바",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"3\" height=\"1\" fill=\"#3d0c12\"/><rect x=\"7\" y=\"1\" width=\"2\" height=\"1\" fill=\"#78252f\"/><rect x=\"6\" y=\"2\" width=\"5\" height=\"9\" fill=\"#3d0c12\"/><rect x=\"6\" y=\"2\" width=\"4\" height=\"9\" fill=\"#5e1820\"/><rect x=\"6\" y=\"2\" width=\"1\" height=\"9\" fill=\"#78252f\"/><rect x=\"6\" y=\"3\" width=\"1\" height=\"7\" fill=\"#943843\"/><rect x=\"6\" y=\"3\" width=\"1\" height=\"5\" fill=\"#ffffff\" opacity=\"0.25\"/><rect x=\"7\" y=\"3\" width=\"2\" height=\"2\" fill=\"#280509\"/><rect x=\"7\" y=\"3\" width=\"1\" height=\"1\" fill=\"#78252f\"/><rect x=\"8\" y=\"6\" width=\"2\" height=\"2\" fill=\"#280509\"/><rect x=\"8\" y=\"6\" width=\"1\" height=\"1\" fill=\"#78252f\"/><rect x=\"7\" y=\"9\" width=\"2\" height=\"1\" fill=\"#280509\"/><rect x=\"7\" y=\"11\" width=\"3\" height=\"1\" fill=\"#3d0c12\"/><rect x=\"7\" y=\"11\" width=\"2\" height=\"1\" fill=\"#5e1820\"/><rect x=\"7\" y=\"12\" width=\"2\" height=\"4\" fill=\"#b45309\"/><rect x=\"7\" y=\"12\" width=\"1\" height=\"4\" fill=\"#fde68a\"/><rect x=\"8\" y=\"12\" width=\"1\" height=\"4\" fill=\"#d97706\"/>"
  },
  "chocolate": {
    "key": "chocolate",
    "name": "초콜릿",
    "innerSvg": "<rect x=\"3\" y=\"2\" width=\"10\" height=\"6\" fill=\"#451a03\"/><rect x=\"4\" y=\"3\" width=\"3\" height=\"2\" fill=\"#78350f\"/><rect x=\"8\" y=\"3\" width=\"3\" height=\"2\" fill=\"#78350f\"/><rect x=\"4\" y=\"6\" width=\"3\" height=\"1\" fill=\"#78350f\"/><rect x=\"8\" y=\"6\" width=\"3\" height=\"1\" fill=\"#78350f\"/><rect x=\"3\" y=\"8\" width=\"10\" height=\"2\" fill=\"#e2e8f0\"/><rect x=\"4\" y=\"9\" width=\"8\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"3\" y=\"10\" width=\"10\" height=\"5\" fill=\"#dc2626\"/><rect x=\"5\" y=\"11\" width=\"6\" height=\"3\" fill=\"#b91c1c\"/>"
  },
  "rec_screwbarju": {
    "key": "rec_screwbarju",
    "name": "배배꼬인주",
    "innerSvg": "<rect x=\"3\" y=\"5\" width=\"1\" height=\"10\" fill=\"#e2e8f0\"/><rect x=\"12\" y=\"5\" width=\"1\" height=\"10\" fill=\"#cbd5e1\"/><rect x=\"4\" y=\"14\" width=\"8\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"8\" fill=\"#f43f5e\"/><rect x=\"6\" y=\"1\" width=\"3\" height=\"2\" fill=\"#ef4444\"/><rect x=\"7\" y=\"2\" width=\"3\" height=\"2\" fill=\"#ffffff\"/><rect x=\"6\" y=\"4\" width=\"3\" height=\"2\" fill=\"#ef4444\"/><rect x=\"7\" y=\"0\" width=\"2\" height=\"2\" fill=\"#d97706\"/>"
  },
  "rec_melonaju": {
    "key": "rec_melonaju",
    "name": "올때메론주",
    "innerSvg": "<rect x=\"3\" y=\"5\" width=\"1\" height=\"10\" fill=\"#e2e8f0\"/><rect x=\"12\" y=\"5\" width=\"1\" height=\"10\" fill=\"#cbd5e1\"/><rect x=\"4\" y=\"14\" width=\"8\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"8\" fill=\"#bbf7d0\"/><rect x=\"6\" y=\"2\" width=\"4\" height=\"7\" fill=\"#4ade80\"/><rect x=\"7\" y=\"0\" width=\"2\" height=\"3\" fill=\"#d97706\"/>"
  },
  "rec_tankboyju": {
    "key": "rec_tankboyju",
    "name": "배즙보이주",
    "innerSvg": "<rect x=\"3\" y=\"5\" width=\"1\" height=\"10\" fill=\"#e2e8f0\"/><rect x=\"12\" y=\"5\" width=\"1\" height=\"10\" fill=\"#cbd5e1\"/><rect x=\"4\" y=\"14\" width=\"8\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"8\" fill=\"#fef08a\"/><rect x=\"7\" y=\"1\" width=\"3\" height=\"6\" fill=\"#facc15\"/><rect x=\"7\" y=\"1\" width=\"1\" height=\"6\" fill=\"#fde047\"/><rect x=\"8\" y=\"0\" width=\"1\" height=\"2\" fill=\"#ca8a04\"/>"
  },
  "rec_jawsbarju": {
    "key": "rec_jawsbarju",
    "name": "상어바주",
    "innerSvg": "<rect x=\"3\" y=\"5\" width=\"1\" height=\"10\" fill=\"#e2e8f0\"/><rect x=\"12\" y=\"5\" width=\"1\" height=\"10\" fill=\"#cbd5e1\"/><rect x=\"4\" y=\"14\" width=\"8\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"4\" fill=\"#38bdf8\"/><rect x=\"4\" y=\"10\" width=\"8\" height=\"4\" fill=\"#dc2626\"/><rect x=\"7\" y=\"2\" width=\"3\" height=\"5\" fill=\"#475569\"/><rect x=\"8\" y=\"0\" width=\"2\" height=\"3\" fill=\"#d97706\"/>"
  },
  "rec_kahlua_milk": {
    "key": "rec_kahlua_milk",
    "name": "조선 깔루아 밀크",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"5\" y=\"4\" width=\"6\" height=\"5\" fill=\"#ffffff\"/><rect x=\"5\" y=\"9\" width=\"6\" height=\"5\" fill=\"#451a03\"/><rect x=\"9\" y=\"1\" width=\"1\" height=\"6\" fill=\"#dc2626\"/><rect x=\"9\" y=\"0\" width=\"2\" height=\"2\" fill=\"#ffffff\"/>"
  },
  "rec_choco_soju": {
    "key": "rec_choco_soju",
    "name": "초코방울주",
    "innerSvg": "<rect x=\"4\" y=\"6\" width=\"1\" height=\"9\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"6\" width=\"1\" height=\"9\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"5\" y=\"8\" width=\"6\" height=\"6\" fill=\"#522409\"/><rect x=\"5\" y=\"7\" width=\"6\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"5\" width=\"3\" height=\"3\" fill=\"#451a03\"/><rect x=\"8\" y=\"5\" width=\"1\" height=\"1\" fill=\"#ffffff\"/>"
  },
  "rec_calamansiju": {
    "key": "rec_calamansiju",
    "name": "깔라만시주",
    "innerSvg": "<rect x=\"4\" y=\"6\" width=\"1\" height=\"9\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"6\" width=\"1\" height=\"9\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"5\" y=\"7\" width=\"6\" height=\"7\" fill=\"#a3e635\"/><rect x=\"6\" y=\"8\" width=\"2\" height=\"4\" fill=\"#fef08a\"/><rect x=\"3\" y=\"4\" width=\"3\" height=\"3\" fill=\"#65a30d\"/><rect x=\"4\" y=\"5\" width=\"1\" height=\"1\" fill=\"#fef08a\"/>"
  },
  "rec_hongchaju": {
    "key": "rec_hongchaju",
    "name": "홍차주",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\" fill=\"#b45309\"/><rect x=\"6\" y=\"6\" width=\"2\" height=\"3\" fill=\"#bae6fd\"/><rect x=\"8\" y=\"10\" width=\"2\" height=\"2\" fill=\"#bae6fd\"/><rect x=\"3\" y=\"3\" width=\"3\" height=\"3\" fill=\"#fde047\"/>"
  },
  "rec_kibum_tea": {
    "key": "rec_kibum_tea",
    "name": "만능열쇠 홍차주",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\" fill=\"#b45309\"/><rect x=\"6\" y=\"6\" width=\"2\" height=\"3\" fill=\"#bae6fd\"/><rect x=\"8\" y=\"10\" width=\"2\" height=\"2\" fill=\"#bae6fd\"/><rect x=\"3\" y=\"3\" width=\"3\" height=\"3\" fill=\"#fde047\"/>"
  },
  "rec_blue_lemon_soju": {
    "key": "rec_blue_lemon_soju",
    "name": "레몬소주",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\" fill=\"#fef08a\"/><rect x=\"6\" y=\"6\" width=\"2\" height=\"3\" fill=\"#ffffff\"/><rect x=\"3\" y=\"3\" width=\"4\" height=\"4\" fill=\"#eab308\"/><rect x=\"4\" y=\"4\" width=\"2\" height=\"2\" fill=\"#facc15\"/>"
  },
  "rec_mango_ringo": {
    "key": "rec_mango_ringo",
    "name": "망고비어",
    "innerSvg": "<rect x=\"6\" y=\"0\" width=\"4\" height=\"1\" fill=\"#facc15\"/><rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#eab308\"/><rect x=\"7\" y=\"2\" width=\"1\" height=\"4\" fill=\"#86efac\"/><rect x=\"8\" y=\"2\" width=\"2\" height=\"4\" fill=\"#22c55e\"/><rect x=\"5\" y=\"6\" width=\"2\" height=\"1\" fill=\"#4ade80\"/><rect x=\"7\" y=\"6\" width=\"4\" height=\"1\" fill=\"#16a34a\"/><rect x=\"4\" y=\"7\" width=\"1\" height=\"8\" fill=\"#15803d\"/><rect x=\"5\" y=\"7\" width=\"1\" height=\"8\" fill=\"#4ade80\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"8\" fill=\"#22c55e\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"8\" fill=\"#14532d\"/><rect x=\"5\" y=\"9\" width=\"5\" height=\"4\" fill=\"#fde047\"/><rect x=\"6\" y=\"9\" width=\"3\" height=\"3\" fill=\"#f97316\"/><rect x=\"7\" y=\"9\" width=\"1\" height=\"1\" fill=\"#15803d\"/><rect x=\"5\" y=\"9\" width=\"5\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#14532d\"/>"
  },
  "rec_mango_ringoju": {
    "key": "rec_mango_ringoju",
    "name": "망고비어주",
    "innerSvg": "<rect x=\"6\" y=\"0\" width=\"4\" height=\"1\" fill=\"#facc15\"/><rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#eab308\"/><rect x=\"7\" y=\"2\" width=\"1\" height=\"4\" fill=\"#86efac\"/><rect x=\"8\" y=\"2\" width=\"2\" height=\"4\" fill=\"#22c55e\"/><rect x=\"5\" y=\"6\" width=\"2\" height=\"1\" fill=\"#4ade80\"/><rect x=\"7\" y=\"6\" width=\"4\" height=\"1\" fill=\"#16a34a\"/><rect x=\"4\" y=\"7\" width=\"1\" height=\"8\" fill=\"#15803d\"/><rect x=\"5\" y=\"7\" width=\"1\" height=\"8\" fill=\"#4ade80\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"8\" fill=\"#22c55e\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"8\" fill=\"#14532d\"/><rect x=\"5\" y=\"9\" width=\"5\" height=\"4\" fill=\"#fde047\"/><rect x=\"6\" y=\"9\" width=\"3\" height=\"3\" fill=\"#f97316\"/><rect x=\"7\" y=\"9\" width=\"1\" height=\"1\" fill=\"#15803d\"/><rect x=\"5\" y=\"9\" width=\"5\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#14532d\"/>"
  },
  "rec_maeksato": {
    "key": "rec_maeksato",
    "name": "맥사토",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"8\" height=\"11\" fill=\"#ef4444\"/><rect x=\"4\" y=\"4\" width=\"8\" height=\"3\" fill=\"#f59e0b\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"1\" fill=\"#ffffff\"/><rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/>"
  },
  "rec_soju_cola": {
    "key": "rec_soju_cola",
    "name": "소콜",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\" fill=\"#451a03\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"2\" fill=\"#ffffff\"/><rect x=\"6\" y=\"8\" width=\"2\" height=\"2\" fill=\"#bae6fd\"/>"
  },
  "rec_energy_soju": {
    "key": "rec_energy_soju",
    "name": "에너지주",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\" fill=\"#eab308\"/><rect x=\"6\" y=\"6\" width=\"2\" height=\"3\" fill=\"#fde047\"/><rect x=\"7\" y=\"3\" width=\"2\" height=\"2\" fill=\"#38bdf8\"/>"
  },
  "rec_boksosa": {
    "key": "rec_boksosa",
    "name": "복소사",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\" fill=\"#701a75\"/><rect x=\"6\" y=\"6\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"1\" fill=\"#fbcfe8\"/>"
  },
  "rec_golden_somaek": {
    "key": "rec_golden_somaek",
    "name": "황금소맥",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"2\" fill=\"#ffffff\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\" fill=\"#f59e0b\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"4\" fill=\"#fde047\"/><rect x=\"7\" y=\"10\" width=\"2\" height=\"3\" fill=\"#86efac\"/>"
  },
  "rec_sowonju": {
    "key": "rec_sowonju",
    "name": "소원주",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\" fill=\"#0284c7\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"4\" fill=\"#fde047\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/>"
  },
  "rec_icetea": {
    "key": "rec_icetea",
    "name": "아이스티",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"9\" fill=\"#d97706\"/><rect x=\"6\" y=\"6\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"8\" y=\"9\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"9\" y=\"1\" width=\"1\" height=\"5\" fill=\"#fb923c\"/>"
  },
  "yakult": {
    "key": "yakult",
    "name": "요구르트",
    "innerSvg": "<rect x=\"6\" y=\"2\" width=\"4\" height=\"1\" fill=\"#ef4444\"/><rect x=\"6\" y=\"3\" width=\"4\" height=\"2\" fill=\"#fed7aa\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"1\" fill=\"#fdba74\"/><rect x=\"5\" y=\"6\" width=\"6\" height=\"7\" fill=\"#fed7aa\"/><rect x=\"5\" y=\"6\" width=\"1\" height=\"7\" fill=\"#ea580c\"/><rect x=\"6\" y=\"8\" width=\"4\" height=\"2\" fill=\"#ef4444\"/><rect x=\"5\" y=\"13\" width=\"6\" height=\"1\" fill=\"#f97316\"/>"
  },
  "banana_milk": {
    "key": "banana_milk",
    "name": "바나나우유",
    "innerSvg": "<rect x=\"9\" y=\"0\" width=\"1\" height=\"3\" fill=\"#ef4444\"/><rect x=\"10\" y=\"0\" width=\"1\" height=\"1\" fill=\"#ef4444\"/><rect x=\"6\" y=\"2\" width=\"4\" height=\"1\" fill=\"#15803d\"/><rect x=\"6\" y=\"3\" width=\"4\" height=\"1\" fill=\"#16a34a\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"1\" fill=\"#fde047\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"1\" fill=\"#fde047\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"1\" fill=\"#fde047\"/><rect x=\"3\" y=\"7\" width=\"10\" height=\"1\" fill=\"#fde047\"/><rect x=\"2\" y=\"8\" width=\"12\" height=\"1\" fill=\"#fef08a\"/><rect x=\"2\" y=\"9\" width=\"12\" height=\"1\" fill=\"#fef08a\"/><rect x=\"3\" y=\"10\" width=\"10\" height=\"1\" fill=\"#fef08a\"/><rect x=\"3\" y=\"11\" width=\"10\" height=\"1\" fill=\"#fef08a\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#fde047\"/><rect x=\"5\" y=\"13\" width=\"6\" height=\"1\" fill=\"#fde047\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"3\" y=\"7\" width=\"1\" height=\"5\" fill=\"#ffffff\" opacity=\"0.45\"/><rect x=\"4\" y=\"6\" width=\"1\" height=\"7\" fill=\"#ffffff\" opacity=\"0.3\"/><rect x=\"11\" y=\"7\" width=\"1\" height=\"6\" fill=\"#ca8a04\"/><rect x=\"12\" y=\"8\" width=\"1\" height=\"2\" fill=\"#a16207\"/><rect x=\"6\" y=\"8\" width=\"4\" height=\"2\" fill=\"#16a34a\" opacity=\"0.75\"/><rect x=\"7\" y=\"8\" width=\"2\" height=\"2\" fill=\"#ffffff\" opacity=\"0.85\"/>"
  },
  "milk": {
    "key": "milk",
    "name": "우유",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"1\" fill=\"#1d4ed8\"/><rect x=\"5\" y=\"2\" width=\"6\" height=\"2\" fill=\"#2563eb\"/><rect x=\"4\" y=\"4\" width=\"8\" height=\"11\" fill=\"#ffffff\"/><rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#cbd5e1\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#94a3b8\"/><rect x=\"4\" y=\"7\" width=\"8\" height=\"3\" fill=\"#1d4ed8\"/><rect x=\"6\" y=\"8\" width=\"4\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/>"
  },
  "strawberry_milk": {
    "key": "strawberry_milk",
    "name": "딸기우유",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"1\" fill=\"#ec4899\"/><rect x=\"5\" y=\"2\" width=\"6\" height=\"2\" fill=\"#f472b6\"/><rect x=\"4\" y=\"4\" width=\"8\" height=\"11\" fill=\"#fbcfe8\"/><rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#f472b6\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#db2777\"/><rect x=\"6\" y=\"8\" width=\"4\" height=\"4\" fill=\"#ef4444\"/><rect x=\"7\" y=\"7\" width=\"2\" height=\"1\" fill=\"#15803d\"/>"
  },
  "choco_milk": {
    "key": "choco_milk",
    "name": "초코우유",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"1\" fill=\"#78350f\"/><rect x=\"5\" y=\"2\" width=\"6\" height=\"2\" fill=\"#522409\"/><rect x=\"4\" y=\"4\" width=\"8\" height=\"11\" fill=\"#78350f\"/><rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#522409\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"11\" fill=\"#3b1806\"/><rect x=\"6\" y=\"8\" width=\"4\" height=\"4\" fill=\"#3b1806\"/><rect x=\"7\" y=\"7\" width=\"2\" height=\"1\" fill=\"#ffffff\"/>"
  },
  "cider": {
    "key": "cider",
    "name": "사이다",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"4\" y=\"2\" width=\"8\" height=\"12\" fill=\"#16a34a\"/><rect x=\"4\" y=\"2\" width=\"1\" height=\"12\" fill=\"#15803d\"/><rect x=\"11\" y=\"2\" width=\"1\" height=\"12\" fill=\"#14532d\"/><rect x=\"7\" y=\"5\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"6\" y=\"9\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"9\" y=\"8\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"4\" y=\"7\" width=\"8\" height=\"1\" fill=\"#dc2626\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/>"
  },
  "cola": {
    "key": "cola",
    "name": "콜라",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"4\" y=\"2\" width=\"8\" height=\"12\" fill=\"#dc2626\"/><rect x=\"4\" y=\"2\" width=\"1\" height=\"12\" fill=\"#b91c1c\"/><rect x=\"11\" y=\"2\" width=\"1\" height=\"12\" fill=\"#991b1b\"/><rect x=\"5\" y=\"7\" width=\"6\" height=\"1\" fill=\"#ffffff\"/><rect x=\"6\" y=\"8\" width=\"4\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"9\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/>"
  },
  "milksoda": {
    "key": "milksoda",
    "name": "밀크소다",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"4\" y=\"2\" width=\"8\" height=\"12\" fill=\"#38bdf8\"/><rect x=\"4\" y=\"2\" width=\"1\" height=\"12\" fill=\"#0284c7\"/><rect x=\"11\" y=\"2\" width=\"1\" height=\"12\" fill=\"#0369a1\"/><rect x=\"5\" y=\"6\" width=\"6\" height=\"4\" fill=\"#ffffff\"/><rect x=\"7\" y=\"7\" width=\"2\" height=\"2\" fill=\"#0284c7\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/>"
  },
  "energy_drink": {
    "key": "energy_drink",
    "name": "에너지드링크",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"2\" width=\"3\" height=\"12\" fill=\"#94a3b8\"/><rect x=\"8\" y=\"2\" width=\"3\" height=\"12\" fill=\"#1e3a8a\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"4\" fill=\"#ef4444\"/><rect x=\"7\" y=\"7\" width=\"2\" height=\"2\" fill=\"#fde047\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/>"
  },
  "ion_drink": {
    "key": "ion_drink",
    "name": "이온음료",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"4\" y=\"2\" width=\"8\" height=\"12\" fill=\"#0284c7\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"2\" fill=\"#ffffff\"/><rect x=\"6\" y=\"5\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"8\" y=\"8\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/>"
  },
  "sikhye": {
    "key": "sikhye",
    "name": "식혜",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"4\" y=\"2\" width=\"8\" height=\"12\" fill=\"#f59e0b\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"3\" fill=\"#dc2626\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"1\" fill=\"#ffffff\"/><rect x=\"6\" y=\"10\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"8\" y=\"11\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/>"
  },
  "pear_drink": {
    "key": "pear_drink",
    "name": "배음료",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"4\" y=\"2\" width=\"8\" height=\"12\" fill=\"#15803d\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"4\" fill=\"#fde047\"/><rect x=\"7\" y=\"5\" width=\"1\" height=\"1\" fill=\"#78350f\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/>"
  },
  "tomato_juice": {
    "key": "tomato_juice",
    "name": "토마토주스",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"4\" y=\"2\" width=\"8\" height=\"12\" fill=\"#dc2626\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"4\" fill=\"#b91c1c\"/><rect x=\"7\" y=\"5\" width=\"2\" height=\"1\" fill=\"#15803d\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/>"
  },
  "black_tea": {
    "key": "black_tea",
    "name": "홍차",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#78350f\"/><rect x=\"7\" y=\"2\" width=\"2\" height=\"3\" fill=\"#d97706\"/><rect x=\"4\" y=\"5\" width=\"8\" height=\"10\" fill=\"#b45309\"/><rect x=\"6\" y=\"8\" width=\"4\" height=\"3\" fill=\"#15803d\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#78350f\"/>"
  },
  "peach_drink": {
    "key": "peach_drink",
    "name": "복숭아음료",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"4\" y=\"2\" width=\"8\" height=\"12\" fill=\"#f472b6\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"4\" fill=\"#fb923c\"/><rect x=\"7\" y=\"5\" width=\"1\" height=\"1\" fill=\"#15803d\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/>"
  },
  "pineapple_juice": {
    "key": "pineapple_juice",
    "name": "파인애플주스",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"4\" y=\"2\" width=\"8\" height=\"12\" fill=\"#facc15\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"4\" fill=\"#ca8a04\"/><rect x=\"7\" y=\"5\" width=\"2\" height=\"1\" fill=\"#15803d\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/>"
  },
  "blue_lemonade": {
    "key": "blue_lemonade",
    "name": "레몬에이드",
    "innerSvg": "<rect x=\"4\" y=\"4\" width=\"8\" height=\"11\" fill=\"#facc15\"/><rect x=\"3\" y=\"4\" width=\"1\" height=\"11\" fill=\"#fde047\"/><rect x=\"12\" y=\"4\" width=\"1\" height=\"11\" fill=\"#eab308\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"4\" fill=\"#ca8a04\"/><rect x=\"7\" y=\"7\" width=\"2\" height=\"2\" fill=\"#fef9c3\"/><rect x=\"9\" y=\"1\" width=\"1\" height=\"5\" fill=\"#f43f5e\"/>"
  },
  "pomegranate_juice": {
    "key": "pomegranate_juice",
    "name": "석류주스",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#881337\"/><rect x=\"7\" y=\"2\" width=\"2\" height=\"3\" fill=\"#be123c\"/><rect x=\"4\" y=\"5\" width=\"8\" height=\"10\" fill=\"#9f1239\"/><rect x=\"6\" y=\"8\" width=\"4\" height=\"3\" fill=\"#f43f5e\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#4c0519\"/>"
  },
  "tonic_water": {
    "key": "tonic_water",
    "name": "토닉워터",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"7\" y=\"2\" width=\"2\" height=\"4\" fill=\"#e0f2fe\"/><rect x=\"5\" y=\"6\" width=\"6\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"4\" y=\"7\" width=\"8\" height=\"8\" fill=\"#e0f2fe\"/><rect x=\"4\" y=\"7\" width=\"1\" height=\"8\" fill=\"#ffffff\"/><rect x=\"4\" y=\"9\" width=\"8\" height=\"3\" fill=\"#0284c7\"/><rect x=\"6\" y=\"10\" width=\"4\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#94a3b8\"/>"
  },
  "calamansi_pouch": {
    "key": "calamansi_pouch",
    "name": "깔라만시 원액",
    "innerSvg": "<rect x=\"7\" y=\"0\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"6\" y=\"2\" width=\"4\" height=\"1\" fill=\"#84cc16\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"11\" fill=\"#84cc16\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"6\" fill=\"#eab308\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"3\" fill=\"#fde047\"/><rect x=\"4\" y=\"14\" width=\"8\" height=\"1\" fill=\"#4d7c0f\"/>"
  },
  "iced_americano": {
    "key": "iced_americano",
    "name": "아이스 아메리카노",
    "innerSvg": "<rect x=\"5\" y=\"2\" width=\"6\" height=\"2\" fill=\"#e2e8f0\"/><rect x=\"4\" y=\"4\" width=\"8\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"9\" y=\"0\" width=\"1\" height=\"4\" fill=\"#15803d\"/><rect x=\"4\" y=\"5\" width=\"8\" height=\"10\" fill=\"#451a03\"/><rect x=\"4\" y=\"5\" width=\"1\" height=\"10\" fill=\"#e2e8f0\"/><rect x=\"11\" y=\"5\" width=\"1\" height=\"10\" fill=\"#cbd5e1\"/><rect x=\"5\" y=\"6\" width=\"3\" height=\"2\" fill=\"#ffffff\"/><rect x=\"8\" y=\"7\" width=\"3\" height=\"2\" fill=\"#bae6fd\"/><rect x=\"6\" y=\"10\" width=\"2\" height=\"2\" fill=\"#bae6fd\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#260e02\"/>"
  },
  "hongcho": {
    "key": "hongcho",
    "name": "홍초",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"7\" y=\"2\" width=\"2\" height=\"4\" fill=\"#be123c\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"9\" fill=\"#9f1239\"/><rect x=\"4\" y=\"6\" width=\"1\" height=\"9\" fill=\"#e11d48\"/><rect x=\"5\" y=\"9\" width=\"6\" height=\"3\" fill=\"#f43f5e\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#4c0519\"/>"
  },
  "sparkling_water": {
    "key": "sparkling_water",
    "name": "탄산수",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"7\" y=\"2\" width=\"2\" height=\"4\" fill=\"#bae6fd\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"9\" fill=\"#7dd3fc\"/><rect x=\"6\" y=\"8\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"9\" y=\"10\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"12\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#0284c7\"/>"
  },
  "lemon": {
    "key": "lemon",
    "name": "레몬",
    "innerSvg": "<rect x=\"7\" y=\"2\" width=\"2\" height=\"1\" fill=\"#15803d\"/><rect x=\"8\" y=\"1\" width=\"2\" height=\"1\" fill=\"#16a34a\"/><rect x=\"5\" y=\"4\" width=\"6\" height=\"8\" fill=\"#fde047\"/><rect x=\"4\" y=\"5\" width=\"8\" height=\"6\" fill=\"#facc15\"/><rect x=\"3\" y=\"7\" width=\"1\" height=\"2\" fill=\"#eab308\"/><rect x=\"12\" y=\"7\" width=\"1\" height=\"2\" fill=\"#eab308\"/><rect x=\"6\" y=\"5\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"6\" y=\"12\" width=\"4\" height=\"1\" fill=\"#ca8a04\"/>"
  },
  "melon": {
    "key": "melon",
    "name": "멜론",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"2\" fill=\"#78350f\"/><rect x=\"6\" y=\"1\" width=\"4\" height=\"1\" fill=\"#15803d\"/><rect x=\"3\" y=\"4\" width=\"10\" height=\"9\" fill=\"#4ade80\"/><rect x=\"4\" y=\"5\" width=\"8\" height=\"1\" fill=\"#fef08a\"/><rect x=\"4\" y=\"8\" width=\"8\" height=\"1\" fill=\"#fef08a\"/><rect x=\"4\" y=\"11\" width=\"8\" height=\"1\" fill=\"#fef08a\"/><rect x=\"6\" y=\"4\" width=\"1\" height=\"9\" fill=\"#fef08a\"/><rect x=\"9\" y=\"4\" width=\"1\" height=\"9\" fill=\"#fef08a\"/><rect x=\"4\" y=\"13\" width=\"8\" height=\"1\" fill=\"#16a34a\"/>"
  },
  "mango": {
    "key": "mango",
    "name": "망고",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"2\" height=\"2\" fill=\"#78350f\"/><rect x=\"7\" y=\"1\" width=\"3\" height=\"1\" fill=\"#15803d\"/><rect x=\"4\" y=\"3\" width=\"7\" height=\"10\" fill=\"#f59e0b\"/><rect x=\"3\" y=\"5\" width=\"8\" height=\"7\" fill=\"#facc15\"/><rect x=\"3\" y=\"4\" width=\"3\" height=\"4\" fill=\"#ef4444\"/><rect x=\"5\" y=\"13\" width=\"6\" height=\"1\" fill=\"#ea580c\"/>"
  },
  "maesil": {
    "key": "maesil",
    "name": "매실",
    "innerSvg": "<rect x=\"6\" y=\"2\" width=\"2\" height=\"2\" fill=\"#78350f\"/><rect x=\"7\" y=\"2\" width=\"3\" height=\"1\" fill=\"#15803d\"/><rect x=\"4\" y=\"4\" width=\"8\" height=\"8\" fill=\"#84cc16\"/><rect x=\"3\" y=\"6\" width=\"10\" height=\"5\" fill=\"#65a30d\"/><rect x=\"5\" y=\"5\" width=\"2\" height=\"2\" fill=\"#bef264\"/><rect x=\"5\" y=\"12\" width=\"6\" height=\"1\" fill=\"#4d7c0f\"/>"
  },
  "tomato": {
    "key": "tomato",
    "name": "토마토",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"2\" fill=\"#15803d\"/><rect x=\"5\" y=\"3\" width=\"6\" height=\"1\" fill=\"#16a34a\"/><rect x=\"4\" y=\"2\" width=\"2\" height=\"2\" fill=\"#15803d\"/><rect x=\"10\" y=\"2\" width=\"2\" height=\"2\" fill=\"#15803d\"/><rect x=\"3\" y=\"4\" width=\"10\" height=\"9\" fill=\"#ef4444\"/><rect x=\"5\" y=\"5\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"4\" y=\"13\" width=\"8\" height=\"1\" fill=\"#b91c1c\"/>"
  },
  "apple": {
    "key": "apple",
    "name": "사과",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"2\" fill=\"#78350f\"/><rect x=\"8\" y=\"1\" width=\"3\" height=\"1\" fill=\"#15803d\"/><rect x=\"3\" y=\"4\" width=\"10\" height=\"9\" fill=\"#ef4444\"/><rect x=\"5\" y=\"5\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"6\" y=\"3\" width=\"4\" height=\"1\" fill=\"#dc2626\"/><rect x=\"4\" y=\"13\" width=\"8\" height=\"1\" fill=\"#b91c1c\"/>"
  },
  "strawberry": {
    "key": "strawberry",
    "name": "딸기",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"4\" height=\"2\" fill=\"#16a34a\"/><rect x=\"4\" y=\"2\" width=\"8\" height=\"1\" fill=\"#15803d\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"6\" fill=\"#ef4444\"/><rect x=\"5\" y=\"9\" width=\"6\" height=\"3\" fill=\"#dc2626\"/><rect x=\"6\" y=\"12\" width=\"4\" height=\"2\" fill=\"#b91c1c\"/><rect x=\"7\" y=\"14\" width=\"2\" height=\"1\" fill=\"#991b1b\"/><rect x=\"6\" y=\"5\" width=\"1\" height=\"1\" fill=\"#fde047\"/><rect x=\"9\" y=\"6\" width=\"1\" height=\"1\" fill=\"#fde047\"/><rect x=\"7\" y=\"8\" width=\"1\" height=\"1\" fill=\"#fde047\"/><rect x=\"8\" y=\"10\" width=\"1\" height=\"1\" fill=\"#fde047\"/>"
  },
  "cacao": {
    "key": "cacao",
    "name": "카카오",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"2\" fill=\"#78350f\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"10\" fill=\"#92400e\"/><rect x=\"3\" y=\"5\" width=\"10\" height=\"6\" fill=\"#78350f\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"5\" fill=\"#ffffff\"/><rect x=\"7\" y=\"7\" width=\"2\" height=\"3\" fill=\"#451a03\"/>"
  },
  "pear": {
    "key": "pear",
    "name": "배",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"2\" fill=\"#78350f\"/><rect x=\"8\" y=\"1\" width=\"2\" height=\"1\" fill=\"#15803d\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"10\" fill=\"#fde047\"/><rect x=\"3\" y=\"5\" width=\"10\" height=\"7\" fill=\"#facc15\"/><rect x=\"5\" y=\"5\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"4\" y=\"13\" width=\"8\" height=\"1\" fill=\"#ca8a04\"/>"
  },
  "banana": {
    "key": "banana",
    "name": "바나나",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"3\" height=\"2\" fill=\"#15803d\"/><rect x=\"7\" y=\"3\" width=\"4\" height=\"3\" fill=\"#fde047\"/><rect x=\"8\" y=\"6\" width=\"4\" height=\"4\" fill=\"#fde047\"/><rect x=\"7\" y=\"10\" width=\"4\" height=\"3\" fill=\"#facc15\"/><rect x=\"5\" y=\"12\" width=\"4\" height=\"2\" fill=\"#eab308\"/><rect x=\"4\" y=\"13\" width=\"2\" height=\"2\" fill=\"#78350f\"/>"
  },
  "yuzu": {
    "key": "yuzu",
    "name": "유자",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"2\" fill=\"#15803d\"/><rect x=\"8\" y=\"1\" width=\"3\" height=\"1\" fill=\"#16a34a\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"9\" fill=\"#fde047\"/><rect x=\"3\" y=\"5\" width=\"10\" height=\"6\" fill=\"#facc15\"/><rect x=\"5\" y=\"5\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"9\" y=\"7\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#ca8a04\"/>"
  },
  "calamansi": {
    "key": "calamansi",
    "name": "깔라만시",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"2\" fill=\"#4d7c0f\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"9\" fill=\"#65a30d\"/><rect x=\"3\" y=\"5\" width=\"10\" height=\"6\" fill=\"#84cc16\"/><rect x=\"5\" y=\"5\" width=\"6\" height=\"6\" fill=\"#fef08a\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"4\" fill=\"#eab308\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#4d7c0f\"/>"
  },
  "bokbunja": {
    "key": "bokbunja",
    "name": "복분자",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"2\" fill=\"#15803d\"/><rect x=\"5\" y=\"3\" width=\"6\" height=\"2\" fill=\"#16a34a\"/><rect x=\"5\" y=\"5\" width=\"3\" height=\"3\" fill=\"#581c87\"/><rect x=\"8\" y=\"5\" width=\"3\" height=\"3\" fill=\"#3b0764\"/><rect x=\"4\" y=\"8\" width=\"3\" height=\"3\" fill=\"#3b0764\"/><rect x=\"7\" y=\"8\" width=\"3\" height=\"3\" fill=\"#7e22ce\"/><rect x=\"9\" y=\"8\" width=\"3\" height=\"3\" fill=\"#581c87\"/><rect x=\"6\" y=\"11\" width=\"4\" height=\"3\" fill=\"#3b0764\"/>"
  },
  "pomegranate": {
    "key": "pomegranate",
    "name": "석류",
    "innerSvg": "<rect x=\"6\" y=\"1\" width=\"1\" height=\"2\" fill=\"#be123c\"/><rect x=\"8\" y=\"1\" width=\"1\" height=\"2\" fill=\"#be123c\"/><rect x=\"5\" y=\"3\" width=\"6\" height=\"9\" fill=\"#e11d48\"/><rect x=\"4\" y=\"5\" width=\"8\" height=\"7\" fill=\"#be123c\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"5\" fill=\"#881337\"/><rect x=\"7\" y=\"7\" width=\"2\" height=\"2\" fill=\"#fda4af\"/><rect x=\"5\" y=\"12\" width=\"6\" height=\"1\" fill=\"#881337\"/>"
  },
  "orange": {
    "key": "orange",
    "name": "오렌지",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"2\" fill=\"#15803d\"/><rect x=\"8\" y=\"1\" width=\"3\" height=\"1\" fill=\"#16a34a\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"9\" fill=\"#f97316\"/><rect x=\"3\" y=\"5\" width=\"10\" height=\"6\" fill=\"#ea580c\"/><rect x=\"5\" y=\"5\" width=\"2\" height=\"2\" fill=\"#fed7aa\"/><rect x=\"4\" y=\"12\" width=\"8\" height=\"1\" fill=\"#c2410c\"/>"
  },
  "barley": {
    "key": "barley",
    "name": "맥(보리)",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"14\" fill=\"#d97706\"/><rect x=\"5\" y=\"3\" width=\"2\" height=\"2\" fill=\"#fde047\"/><rect x=\"9\" y=\"4\" width=\"2\" height=\"2\" fill=\"#fde047\"/><rect x=\"5\" y=\"6\" width=\"2\" height=\"2\" fill=\"#f59e0b\"/><rect x=\"9\" y=\"7\" width=\"2\" height=\"2\" fill=\"#f59e0b\"/><rect x=\"5\" y=\"9\" width=\"2\" height=\"2\" fill=\"#fde047\"/><rect x=\"9\" y=\"10\" width=\"2\" height=\"2\" fill=\"#fde047\"/>"
  },
  "rice": {
    "key": "rice",
    "name": "쌀",
    "innerSvg": "<rect x=\"6\" y=\"3\" width=\"4\" height=\"2\" fill=\"#ffffff\"/><rect x=\"4\" y=\"5\" width=\"8\" height=\"3\" fill=\"#ffffff\"/><rect x=\"3\" y=\"7\" width=\"10\" height=\"2\" fill=\"#f8fafc\"/><rect x=\"2\" y=\"8\" width=\"12\" height=\"1\" fill=\"#0284c7\"/><rect x=\"3\" y=\"9\" width=\"10\" height=\"4\" fill=\"#e0f2fe\"/><rect x=\"4\" y=\"13\" width=\"8\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"6\" y=\"14\" width=\"4\" height=\"1\" fill=\"#0284c7\"/>"
  },
  "misutgaru": {
    "key": "misutgaru",
    "name": "미숫가루",
    "innerSvg": "<rect x=\"5\" y=\"4\" width=\"6\" height=\"3\" fill=\"#d4a373\"/><rect x=\"6\" y=\"3\" width=\"4\" height=\"2\" fill=\"#c5925a\"/><rect x=\"2\" y=\"7\" width=\"12\" height=\"1\" fill=\"#78350f\"/><rect x=\"3\" y=\"8\" width=\"10\" height=\"5\" fill=\"#522409\"/><rect x=\"4\" y=\"13\" width=\"8\" height=\"1\" fill=\"#3b1806\"/><rect x=\"6\" y=\"14\" width=\"4\" height=\"1\" fill=\"#3b1806\"/>"
  },
  "coffee_beans": {
    "key": "coffee_beans",
    "name": "커피콩",
    "innerSvg": "<rect x=\"2\" y=\"4\" width=\"6\" height=\"8\" fill=\"#a16207\"/><rect x=\"3\" y=\"3\" width=\"4\" height=\"10\" fill=\"#78350f\"/><rect x=\"5\" y=\"4\" width=\"1\" height=\"8\" fill=\"#451a03\"/><rect x=\"3\" y=\"5\" width=\"1\" height=\"4\" fill=\"#ca8a04\"/><rect x=\"8\" y=\"4\" width=\"6\" height=\"8\" fill=\"#a16207\"/><rect x=\"9\" y=\"3\" width=\"4\" height=\"10\" fill=\"#78350f\"/><rect x=\"10\" y=\"4\" width=\"1\" height=\"8\" fill=\"#451a03\"/><rect x=\"12\" y=\"5\" width=\"1\" height=\"4\" fill=\"#ca8a04\"/>"
  },
  "red_bean": {
    "key": "red_bean",
    "name": "팥",
    "innerSvg": "<rect x=\"2\" y=\"8\" width=\"5\" height=\"6\" fill=\"#7f1d1d\"/><rect x=\"3\" y=\"7\" width=\"3\" height=\"8\" fill=\"#991b1b\"/><rect x=\"4\" y=\"9\" width=\"1\" height=\"4\" fill=\"#ffffff\"/><rect x=\"8\" y=\"8\" width=\"5\" height=\"6\" fill=\"#7f1d1d\"/><rect x=\"9\" y=\"7\" width=\"3\" height=\"8\" fill=\"#991b1b\"/><rect x=\"10\" y=\"9\" width=\"1\" height=\"4\" fill=\"#ffffff\"/><rect x=\"5\" y=\"3\" width=\"5\" height=\"5\" fill=\"#991b1b\"/><rect x=\"6\" y=\"2\" width=\"3\" height=\"7\" fill=\"#b91c1c\"/><rect x=\"7\" y=\"4\" width=\"2\" height=\"2\" fill=\"#ffffff\"/>"
  },
  "roasted_beans": {
    "key": "roasted_beans",
    "name": "원두",
    "innerSvg": "<rect x=\"2\" y=\"6\" width=\"5\" height=\"7\" fill=\"#3d1a08\"/><rect x=\"3\" y=\"5\" width=\"3\" height=\"9\" fill=\"#1c0a00\"/><rect x=\"4\" y=\"6\" width=\"1\" height=\"7\" fill=\"#0a0401\"/><rect x=\"8\" y=\"5\" width=\"5\" height=\"7\" fill=\"#3d1a08\"/><rect x=\"9\" y=\"4\" width=\"3\" height=\"9\" fill=\"#1c0a00\"/><rect x=\"10\" y=\"5\" width=\"1\" height=\"7\" fill=\"#0a0401\"/><rect x=\"4\" y=\"3\" width=\"1\" height=\"2\" fill=\"#e2e8f0\"/><rect x=\"5\" y=\"1\" width=\"1\" height=\"2\" fill=\"#cbd5e1\"/><rect x=\"11\" y=\"2\" width=\"1\" height=\"2\" fill=\"#e2e8f0\"/><rect x=\"10\" y=\"0\" width=\"1\" height=\"2\" fill=\"#cbd5e1\"/>"
  },
  "red_bean_porridge": {
    "key": "red_bean_porridge",
    "name": "단팥죽",
    "innerSvg": "<rect x=\"2\" y=\"8\" width=\"12\" height=\"5\" fill=\"#334155\"/><rect x=\"3\" y=\"7\" width=\"10\" height=\"1\" fill=\"#701a28\"/><rect x=\"4\" y=\"8\" width=\"8\" height=\"2\" fill=\"#831843\"/><rect x=\"4\" y=\"6\" width=\"3\" height=\"3\" fill=\"#ffffff\"/><rect x=\"8\" y=\"5\" width=\"3\" height=\"3\" fill=\"#ffffff\"/><rect x=\"11\" y=\"7\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"7\" y=\"7\" width=\"1\" height=\"1\" fill=\"#fde047\"/><rect x=\"4\" y=\"13\" width=\"8\" height=\"1\" fill=\"#1e293b\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#1e293b\"/><rect x=\"8\" y=\"2\" width=\"1\" height=\"2\" fill=\"#e2e8f0\" opacity=\"0.7\"/>"
  },
  "sugar": {
    "key": "sugar",
    "name": "설탕",
    "innerSvg": "<rect x=\"3\" y=\"6\" width=\"5\" height=\"5\" fill=\"#ffffff\"/><rect x=\"3\" y=\"6\" width=\"5\" height=\"1\" fill=\"#e0f2fe\"/><rect x=\"3\" y=\"6\" width=\"1\" height=\"5\" fill=\"#cbd5e1\"/><rect x=\"7\" y=\"6\" width=\"1\" height=\"5\" fill=\"#94a3b8\"/><rect x=\"3\" y=\"11\" width=\"5\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"7\" y=\"3\" width=\"5\" height=\"5\" fill=\"#ffffff\"/><rect x=\"7\" y=\"3\" width=\"5\" height=\"1\" fill=\"#e0f2fe\"/><rect x=\"7\" y=\"3\" width=\"1\" height=\"5\" fill=\"#cbd5e1\"/><rect x=\"11\" y=\"3\" width=\"1\" height=\"5\" fill=\"#94a3b8\"/><rect x=\"7\" y=\"8\" width=\"5\" height=\"1\" fill=\"#94a3b8\"/>"
  },
  "nuruk": {
    "key": "nuruk",
    "name": "누룩",
    "innerSvg": "<rect x=\"3\" y=\"4\" width=\"10\" height=\"8\" fill=\"#d4a373\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"10\" fill=\"#c5925a\"/><rect x=\"3\" y=\"4\" width=\"10\" height=\"1\" fill=\"#faedcd\"/><rect x=\"5\" y=\"5\" width=\"1\" height=\"4\" fill=\"#78350f\"/><rect x=\"8\" y=\"7\" width=\"3\" height=\"1\" fill=\"#78350f\"/><rect x=\"6\" y=\"8\" width=\"1\" height=\"3\" fill=\"#78350f\"/><rect x=\"3\" y=\"12\" width=\"10\" height=\"1\" fill=\"#522409\"/>"
  },
  "yuzu_cheong": {
    "key": "yuzu_cheong",
    "name": "유자청",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"2\" fill=\"#fde047\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"1\" fill=\"#eab308\"/><rect x=\"4\" y=\"4\" width=\"8\" height=\"10\" fill=\"#fef08a\"/><rect x=\"4\" y=\"4\" width=\"1\" height=\"10\" fill=\"#ffffff\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"10\" fill=\"#ca8a04\"/><rect x=\"6\" y=\"6\" width=\"4\" height=\"3\" fill=\"#eab308\"/><rect x=\"5\" y=\"10\" width=\"4\" height=\"3\" fill=\"#ca8a04\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#ca8a04\"/>"
  },
  "maesil_cheong": {
    "key": "maesil_cheong",
    "name": "매실청",
    "innerSvg": "<rect x=\"5\" y=\"1\" width=\"6\" height=\"2\" fill=\"#84cc16\"/><rect x=\"4\" y=\"3\" width=\"8\" height=\"1\" fill=\"#65a30d\"/><rect x=\"4\" y=\"4\" width=\"8\" height=\"10\" fill=\"#fde047\"/><rect x=\"4\" y=\"4\" width=\"1\" height=\"10\" fill=\"#ffffff\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"10\" fill=\"#ca8a04\"/><rect x=\"6\" y=\"5\" width=\"3\" height=\"3\" fill=\"#65a30d\"/><rect x=\"7\" y=\"9\" width=\"3\" height=\"3\" fill=\"#84cc16\"/><rect x=\"5\" y=\"14\" width=\"6\" height=\"1\" fill=\"#ca8a04\"/>"
  },
  "honey": {
    "key": "honey",
    "name": "꿀",
    "innerSvg": "<rect x=\"7\" y=\"0\" width=\"2\" height=\"7\" fill=\"#d97706\"/><rect x=\"5\" y=\"4\" width=\"6\" height=\"5\" fill=\"#f59e0b\"/><rect x=\"6\" y=\"5\" width=\"4\" height=\"3\" fill=\"#fde047\"/><rect x=\"7\" y=\"9\" width=\"2\" height=\"4\" fill=\"#fbbf24\"/><rect x=\"7\" y=\"13\" width=\"2\" height=\"2\" fill=\"#f59e0b\"/>"
  },
  "vinegar": {
    "key": "vinegar",
    "name": "식초",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"2\" fill=\"#d97706\"/><rect x=\"7\" y=\"3\" width=\"2\" height=\"3\" fill=\"#e2e8f0\"/><rect x=\"4\" y=\"6\" width=\"8\" height=\"9\" fill=\"#fef08a\"/><rect x=\"4\" y=\"6\" width=\"1\" height=\"9\" fill=\"#ffffff\"/><rect x=\"11\" y=\"6\" width=\"1\" height=\"9\" fill=\"#ca8a04\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#ca8a04\"/>"
  },
  "pomegranate_concentrate": {
    "key": "pomegranate_concentrate",
    "name": "석류농축액",
    "innerSvg": "<rect x=\"7\" y=\"1\" width=\"2\" height=\"3\" fill=\"#1e293b\"/><rect x=\"6\" y=\"3\" width=\"4\" height=\"1\" fill=\"#475569\"/><rect x=\"4\" y=\"4\" width=\"8\" height=\"11\" fill=\"#881337\"/><rect x=\"4\" y=\"4\" width=\"1\" height=\"11\" fill=\"#be123c\"/><rect x=\"6\" y=\"7\" width=\"4\" height=\"4\" fill=\"#f43f5e\"/><rect x=\"5\" y=\"15\" width=\"6\" height=\"1\" fill=\"#4c0519\"/>"
  }
};

  // 2. [💎 32x32 고화질 디테일 아트 스프라이트 (사용자 피드백 맞춤형 19종+ 정밀 디자인)]
  const EMOJI_MAP = {
  "soju": "🍶",
  "beer": "🍺",
  "bokbunjaju": "🍷",
  "maesilju": "🟢",
  "makgeolli": "🍶",
  "ice": "🧊",
  "water": "💧",
  "fire": "🔥",
  "sparkling_water": "🫧",
  "air": "🌬️",
  "snow": "❄️",
  "lemon": "🍋",
  "melon": "🍈",
  "mango": "🥭",
  "maesil": "🍏",
  "tomato": "🍅",
  "apple": "🍎",
  "strawberry": "🍓",
  "cacao": "🫘",
  "pear": "🍐",
  "banana": "🍌",
  "yuzu": "🍊",
  "calamansi": "🍈",
  "bokbunja": "🫐",
  "pomegranate": "🍎",
  "orange": "🍊",
  "milk": "🥛",
  "barley": "🌾",
  "rice": "🏞️",
  "misutgaru": "🥣",
  "coffee_beans": "🫘",
  "red_bean": "🫘",
  "roasted_beans": "☕",
  "red_bean_porridge": "🥣",
  "black_tea": "🫖",
  "energy_drink": "⚡",
  "ion_drink": "🎽",
  "milksoda": "🫧",
  "blue_lemonade": "🍋",
  "lemonade": "🍋",
  "cider": "🥤",
  "cola": "🥤",
  "tomato_juice": "🍅",
  "choco_milk": "🍫",
  "strawberry_milk": "🍓",
  "banana_milk": "🍌",
  "sikhye": "🌾",
  "peach_drink": "🍑",
  "pear_drink": "🍐",
  "pineapple_juice": "🍍",
  "yakult": "🍼",
  "pomegranate_juice": "🌺",
  "tonic_water": "🍸",
  "calamansi_pouch": "🍋",
  "iced_americano": "☕",
  "hongcho": "🧪",
  "sugar": "🍬",
  "nuruk": "🍞",
  "yuzu_cheong": "🍯",
  "maesil_cheong": "🫙",
  "honey": "🍯",
  "vinegar": "🍶",
  "pomegranate_concentrate": "🍷",
  "screwbar": "🍭",
  "chocolate": "🍫",
  "tankboy": "🍧",
  "melona": "🍈",
  "jawsbar": "🦈",
  "bibibig": "🪵",
  "rec_somaek": "🍺",
  "rec_kkulju": "🍯",
  "rec_hongchaju": "🫖",
  "rec_kibum_tea": "🗝️",
  "rec_energy_soju": "⚡",
  "rec_blue_lemon_soju": "🍋",
  "rec_lemon_soju": "🍋",
  "rec_boksosa": "🍷",
  "rec_icetea": "🍹",
  "rec_mango_ringo": "🥭",
  "rec_mango_ringoju": "🍹",
  "rec_soju_cola": "🥤",
  "rec_ringelju": "💉",
  "rec_maeksato": "🍅",
  "rec_screwbarju": "🍭",
  "rec_maksa": "🍶",
  "rec_choco_soju": "🍫",
  "rec_golden_somaek": "👑",
  "rec_tankboyju": "🍧",
  "rec_strawberry_makgeolli": "🍓",
  "rec_honey_makgeolli": "🍯",
  "rec_yuzu_makgeolli": "🍊",
  "rec_maesil_makgeolli": "🍏",
  "rec_sikhye_makgeolli": "🌾",
  "rec_misutgaru_makgeolli": "🥣",
  "rec_banana_milk_makgeolli": "🍌",
  "rec_peach_makgeolli": "🍑",
  "rec_pear_makgeolli": "🍐",
  "rec_pineapple_makgeolli": "🍍",
  "rec_yakult_makgeolli": "🍼",
  "rec_honey_misutgaru_makgeolli": "🍯",
  "rec_pomegranate_makgeolli": "🌺",
  "rec_sotonic": "🍸",
  "rec_calamansiju": "🍋",
  "rec_icheon_makgeolli": "👑",
  "rec_hallasan_sotonic": "🌋",
  "rec_tesla": "⚡",
  "rec_tejina": "🎤",
  "rec_casscheorom": "🌊",
  "rec_kelly_is_back": "🌴",
  "rec_castella": "🍞",
  "rec_milkisju": "🥛",
  "rec_gojingamlae": "🎢",
  "rec_pocariju": "💧",
  "rec_energizerju": "🔋",
  "rec_taegeukju": "🇰🇷",
  "rec_sowonju": "☕",
  "rec_dutch_lager": "🍺",
  "rec_melonaju": "🍈",
  "rec_jawsbarju": "🦈",
  "rec_bibibig_makgeolli": "🍧",
  "rec_kahlua_milk": "☕",
  "mango_ringo": "🥭"
};

const SPRITE_DATA_HD = {
  "soju": {
    "key": "soju",
    "name": "소주",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"12\" y=\"1\" width=\"8\" height=\"2\" fill=\"#14532d\"/><rect x=\"13\" y=\"1\" width=\"6\" height=\"1\" fill=\"#22c55e\"/><rect x=\"12\" y=\"3\" width=\"8\" height=\"1\" fill=\"#166534\"/><rect x=\"13\" y=\"4\" width=\"1\" height=\"7\" fill=\"#14532d\"/><rect x=\"14\" y=\"4\" width=\"1\" height=\"7\" fill=\"#86efac\"/><rect x=\"15\" y=\"4\" width=\"2\" height=\"7\" fill=\"#22c55e\"/><rect x=\"17\" y=\"4\" width=\"1\" height=\"7\" fill=\"#16a34a\"/><rect x=\"18\" y=\"4\" width=\"1\" height=\"7\" fill=\"#14532d\"/><rect x=\"12\" y=\"11\" width=\"2\" height=\"1\" fill=\"#86efac\"/><rect x=\"14\" y=\"11\" width=\"4\" height=\"1\" fill=\"#22c55e\"/><rect x=\"18\" y=\"11\" width=\"2\" height=\"1\" fill=\"#14532d\"/><rect x=\"10\" y=\"12\" width=\"3\" height=\"1\" fill=\"#86efac\"/><rect x=\"13\" y=\"12\" width=\"6\" height=\"1\" fill=\"#22c55e\"/><rect x=\"19\" y=\"12\" width=\"3\" height=\"1\" fill=\"#14532d\"/><rect x=\"9\" y=\"13\" width=\"3\" height=\"1\" fill=\"#86efac\"/><rect x=\"12\" y=\"13\" width=\"8\" height=\"1\" fill=\"#22c55e\"/><rect x=\"20\" y=\"13\" width=\"3\" height=\"1\" fill=\"#14532d\"/><rect x=\"8\" y=\"14\" width=\"1\" height=\"15\" fill=\"#14532d\"/><rect x=\"9\" y=\"14\" width=\"1\" height=\"15\" fill=\"#4ade80\"/><rect x=\"10\" y=\"14\" width=\"2\" height=\"15\" fill=\"#86efac\"/><rect x=\"12\" y=\"14\" width=\"7\" height=\"15\" fill=\"#22c55e\"/><rect x=\"19\" y=\"14\" width=\"3\" height=\"15\" fill=\"#16a34a\"/><rect x=\"22\" y=\"14\" width=\"1\" height=\"15\" fill=\"#166534\"/><rect x=\"23\" y=\"14\" width=\"1\" height=\"15\" fill=\"#14532d\"/><rect x=\"10\" y=\"17\" width=\"12\" height=\"9\" fill=\"#ffffff\"/><rect x=\"10\" y=\"17\" width=\"12\" height=\"1\" fill=\"#f1f5f9\"/><rect x=\"10\" y=\"25\" width=\"12\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"14\" y=\"18\" width=\"4\" height=\"1\" fill=\"#0284c7\"/><rect x=\"13\" y=\"19\" width=\"6\" height=\"2\" fill=\"#0369a1\"/><rect x=\"14\" y=\"19\" width=\"2\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"15\" y=\"20\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"15\" y=\"22\" width=\"2\" height=\"2\" fill=\"#ef4444\"/><rect x=\"15\" y=\"22\" width=\"1\" height=\"1\" fill=\"#fca5a5\"/><rect x=\"12\" y=\"24\" width=\"8\" height=\"1\" fill=\"#64748b\"/><rect x=\"9\" y=\"29\" width=\"14\" height=\"1\" fill=\"#166534\"/><rect x=\"10\" y=\"30\" width=\"12\" height=\"1\" fill=\"#14532d\"/>"
  },
  "beer": {
    "key": "beer",
    "name": "맥주",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"12\" y=\"1\" width=\"8\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"13\" y=\"1\" width=\"6\" height=\"1\" fill=\"#fde047\"/><rect x=\"12\" y=\"2\" width=\"8\" height=\"1\" fill=\"#b45309\"/><rect x=\"13\" y=\"3\" width=\"6\" height=\"3\" fill=\"#f59e0b\"/><rect x=\"14\" y=\"3\" width=\"2\" height=\"3\" fill=\"#fef08a\"/><rect x=\"16\" y=\"3\" width=\"2\" height=\"3\" fill=\"#d97706\"/><rect x=\"12\" y=\"5\" width=\"8\" height=\"1\" fill=\"#b45309\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"5\" fill=\"#451a03\"/><rect x=\"14\" y=\"6\" width=\"1\" height=\"5\" fill=\"#f59e0b\"/><rect x=\"15\" y=\"6\" width=\"2\" height=\"5\" fill=\"#92400e\"/><rect x=\"17\" y=\"6\" width=\"1\" height=\"5\" fill=\"#78350f\"/><rect x=\"18\" y=\"6\" width=\"1\" height=\"5\" fill=\"#260e02\"/><rect x=\"12\" y=\"11\" width=\"2\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"14\" y=\"11\" width=\"4\" height=\"1\" fill=\"#92400e\"/><rect x=\"18\" y=\"11\" width=\"2\" height=\"1\" fill=\"#451a03\"/><rect x=\"10\" y=\"12\" width=\"3\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"13\" y=\"12\" width=\"6\" height=\"1\" fill=\"#92400e\"/><rect x=\"19\" y=\"12\" width=\"3\" height=\"1\" fill=\"#451a03\"/><rect x=\"9\" y=\"13\" width=\"3\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"12\" y=\"13\" width=\"8\" height=\"1\" fill=\"#92400e\"/><rect x=\"20\" y=\"13\" width=\"3\" height=\"1\" fill=\"#260e02\"/><rect x=\"8\" y=\"14\" width=\"1\" height=\"15\" fill=\"#451a03\"/><rect x=\"9\" y=\"14\" width=\"1\" height=\"15\" fill=\"#d97706\"/><rect x=\"10\" y=\"14\" width=\"2\" height=\"15\" fill=\"#f59e0b\"/><rect x=\"12\" y=\"14\" width=\"7\" height=\"15\" fill=\"#78350f\"/><rect x=\"19\" y=\"14\" width=\"3\" height=\"15\" fill=\"#451a03\"/><rect x=\"22\" y=\"14\" width=\"1\" height=\"15\" fill=\"#260e02\"/><rect x=\"23\" y=\"14\" width=\"1\" height=\"15\" fill=\"#1c0a00\"/><rect x=\"10\" y=\"16\" width=\"12\" height=\"9\" fill=\"#1e3a8a\"/><rect x=\"10\" y=\"16\" width=\"12\" height=\"1\" fill=\"#2563eb\"/><rect x=\"10\" y=\"24\" width=\"12\" height=\"1\" fill=\"#1e40af\"/><rect x=\"14\" y=\"18\" width=\"4\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"13\" y=\"19\" width=\"6\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"12\" y=\"20\" width=\"8\" height=\"1\" fill=\"#fde047\"/><rect x=\"15\" y=\"20\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"21\" width=\"6\" height=\"1\" fill=\"#d97706\"/><rect x=\"14\" y=\"22\" width=\"4\" height=\"1\" fill=\"#ef4444\"/><rect x=\"11\" y=\"23\" width=\"10\" height=\"1\" fill=\"#e2e8f0\"/><rect x=\"9\" y=\"29\" width=\"14\" height=\"1\" fill=\"#451a03\"/><rect x=\"10\" y=\"30\" width=\"12\" height=\"1\" fill=\"#260e02\"/>"
  },
  "mango_ringo": {
    "key": "mango_ringo",
    "name": "망고링고",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"12\" y=\"1\" width=\"8\" height=\"2\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"1\" width=\"6\" height=\"1\" fill=\"#facc15\"/><rect x=\"12\" y=\"3\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"13\" y=\"4\" width=\"1\" height=\"7\" fill=\"#14532d\"/><rect x=\"14\" y=\"4\" width=\"1\" height=\"7\" fill=\"#86efac\"/><rect x=\"15\" y=\"4\" width=\"2\" height=\"7\" fill=\"#22c55e\"/><rect x=\"17\" y=\"4\" width=\"1\" height=\"7\" fill=\"#16a34a\"/><rect x=\"18\" y=\"4\" width=\"1\" height=\"7\" fill=\"#14532d\"/><rect x=\"12\" y=\"11\" width=\"2\" height=\"1\" fill=\"#86efac\"/><rect x=\"14\" y=\"11\" width=\"4\" height=\"1\" fill=\"#22c55e\"/><rect x=\"18\" y=\"11\" width=\"2\" height=\"1\" fill=\"#14532d\"/><rect x=\"10\" y=\"12\" width=\"3\" height=\"1\" fill=\"#86efac\"/><rect x=\"13\" y=\"12\" width=\"6\" height=\"1\" fill=\"#22c55e\"/><rect x=\"19\" y=\"12\" width=\"3\" height=\"1\" fill=\"#14532d\"/><rect x=\"9\" y=\"13\" width=\"3\" height=\"1\" fill=\"#86efac\"/><rect x=\"12\" y=\"13\" width=\"8\" height=\"1\" fill=\"#22c55e\"/><rect x=\"20\" y=\"13\" width=\"3\" height=\"1\" fill=\"#14532d\"/><rect x=\"8\" y=\"14\" width=\"1\" height=\"15\" fill=\"#14532d\"/><rect x=\"9\" y=\"14\" width=\"1\" height=\"15\" fill=\"#4ade80\"/><rect x=\"10\" y=\"14\" width=\"2\" height=\"15\" fill=\"#86efac\"/><rect x=\"12\" y=\"14\" width=\"7\" height=\"15\" fill=\"#22c55e\"/><rect x=\"19\" y=\"14\" width=\"3\" height=\"15\" fill=\"#16a34a\"/><rect x=\"22\" y=\"14\" width=\"1\" height=\"15\" fill=\"#166534\"/><rect x=\"23\" y=\"14\" width=\"1\" height=\"15\" fill=\"#14532d\"/><rect x=\"10\" y=\"16\" width=\"12\" height=\"9\" fill=\"#fde047\"/><rect x=\"10\" y=\"16\" width=\"12\" height=\"1\" fill=\"#fef08a\"/><rect x=\"10\" y=\"24\" width=\"12\" height=\"1\" fill=\"#eab308\"/><circle cx=\"16\" cy=\"19.5\" r=\"2.2\" fill=\"#ea580c\"/><circle cx=\"15.5\" cy=\"19\" r=\"1.8\" fill=\"#f97316\"/><circle cx=\"15\" cy=\"18.5\" r=\"0.8\" fill=\"#fde047\"/><path d=\"M 16.5,18 Q 18,16.5 19,17 Q 18,18.5 16.5,18 Z\" fill=\"#16a34a\"/><rect x=\"12\" y=\"22\" width=\"8\" height=\"2\" fill=\"#ffffff\"/><rect x=\"13\" y=\"23\" width=\"6\" height=\"0.8\" fill=\"#ea580c\"/><rect x=\"9\" y=\"29\" width=\"14\" height=\"1\" fill=\"#166534\"/><rect x=\"10\" y=\"30\" width=\"12\" height=\"1\" fill=\"#14532d\"/>"
  },
  "maesilju": {
    "key": "maesilju",
    "name": "매화수",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"13\" y=\"2\" width=\"6\" height=\"2\" fill=\"#ca8a04\"/><rect x=\"14\" y=\"2\" width=\"4\" height=\"1\" fill=\"#fde047\"/><rect x=\"13\" y=\"4\" width=\"6\" height=\"1\" fill=\"#a16207\"/><rect x=\"14\" y=\"5\" width=\"1\" height=\"3\" fill=\"#fdba74\"/><rect x=\"15\" y=\"5\" width=\"2\" height=\"3\" fill=\"#fb923c\"/><rect x=\"17\" y=\"5\" width=\"1\" height=\"3\" fill=\"#c2410c\"/><rect x=\"13\" y=\"8\" width=\"2\" height=\"1\" fill=\"#fdba74\"/><rect x=\"15\" y=\"8\" width=\"2\" height=\"1\" fill=\"#fb923c\"/><rect x=\"17\" y=\"8\" width=\"2\" height=\"1\" fill=\"#ea580c\"/><rect x=\"12\" y=\"9\" width=\"2\" height=\"1\" fill=\"#fed7aa\"/><rect x=\"14\" y=\"9\" width=\"4\" height=\"1\" fill=\"#fb923c\"/><rect x=\"18\" y=\"9\" width=\"2\" height=\"1\" fill=\"#ea580c\"/><rect x=\"11\" y=\"10\" width=\"2\" height=\"1\" fill=\"#fed7aa\"/><rect x=\"13\" y=\"10\" width=\"6\" height=\"1\" fill=\"#f97316\"/><rect x=\"19\" y=\"10\" width=\"2\" height=\"1\" fill=\"#c2410c\"/><rect x=\"10\" y=\"11\" width=\"2\" height=\"1\" fill=\"#fed7aa\"/><rect x=\"12\" y=\"11\" width=\"8\" height=\"1\" fill=\"#f97316\"/><rect x=\"20\" y=\"11\" width=\"2\" height=\"1\" fill=\"#c2410c\"/><rect x=\"9\" y=\"12\" width=\"1\" height=\"17\" fill=\"#cbd5e1\" opacity=\"0.8\"/><rect x=\"10\" y=\"12\" width=\"2\" height=\"17\" fill=\"#fed7aa\"/><rect x=\"12\" y=\"12\" width=\"7\" height=\"17\" fill=\"#fb923c\"/><rect x=\"19\" y=\"12\" width=\"2\" height=\"17\" fill=\"#ea580c\"/><rect x=\"21\" y=\"12\" width=\"1\" height=\"17\" fill=\"#c2410c\"/><rect x=\"22\" y=\"12\" width=\"1\" height=\"17\" fill=\"#94a3b8\" opacity=\"0.7\"/><rect x=\"10\" y=\"29\" width=\"12\" height=\"1\" fill=\"#c2410c\"/><rect x=\"11\" y=\"30\" width=\"10\" height=\"1\" fill=\"#7c2d12\"/><rect x=\"11\" y=\"15\" width=\"10\" height=\"10\" fill=\"#ffffff\" opacity=\"0.96\"/><rect x=\"11\" y=\"15\" width=\"10\" height=\"1\" fill=\"#fce7f3\"/><rect x=\"11\" y=\"24\" width=\"10\" height=\"1\" fill=\"#fbcfe8\"/><rect x=\"12\" y=\"21\" width=\"4\" height=\"1\" fill=\"#15803d\"/><rect x=\"15\" y=\"20\" width=\"3\" height=\"1\" fill=\"#15803d\"/><rect x=\"17\" y=\"19\" width=\"2\" height=\"1\" fill=\"#15803d\"/><rect x=\"15\" y=\"18\" width=\"2\" height=\"2\" fill=\"#f43f5e\"/><rect x=\"14\" y=\"18\" width=\"1\" height=\"2\" fill=\"#fb7185\"/><rect x=\"17\" y=\"18\" width=\"1\" height=\"2\" fill=\"#fb7185\"/><rect x=\"15\" y=\"17\" width=\"2\" height=\"1\" fill=\"#fb7185\"/><rect x=\"15\" y=\"20\" width=\"2\" height=\"1\" fill=\"#fb7185\"/><rect x=\"15\" y=\"19\" width=\"1\" height=\"1\" fill=\"#fef08a\"/><rect x=\"18\" y=\"16\" width=\"2\" height=\"2\" fill=\"#f43f5e\"/><rect x=\"18\" y=\"16\" width=\"1\" height=\"1\" fill=\"#fbcfe8\"/><rect x=\"13\" y=\"22\" width=\"2\" height=\"1\" fill=\"#fb7185\"/>"
  },
  "ice": {
    "key": "ice",
    "name": "얼음",
    "viewBox": "0 0 32 32",
    "innerSvg": "<polygon points=\"16,16 27,10 27,23 16,29\" fill=\"#0284c7\" opacity=\"0.2\"/><line x1=\"16\" y1=\"16\" x2=\"5\" y2=\"23\" stroke=\"#e0f2fe\" stroke-width=\"0.6\" stroke-dasharray=\"1.5,1.5\" opacity=\"0.4\"/><line x1=\"16\" y1=\"16\" x2=\"27\" y2=\"23\" stroke=\"#e0f2fe\" stroke-width=\"0.6\" stroke-dasharray=\"1.5,1.5\" opacity=\"0.4\"/><line x1=\"16\" y1=\"16\" x2=\"16\" y2=\"4\" stroke=\"#ffffff\" stroke-width=\"0.6\" stroke-dasharray=\"1.5,1.5\" opacity=\"0.4\"/><polygon points=\"5,10 16,4 27,10 27,23 16,29 5,23\" fill=\"#38bdf8\" opacity=\"0.15\"/><polygon points=\"5,10 16,16 16,29 5,23\" fill=\"#bae6fd\" opacity=\"0.9\"/><polygon points=\"6,11 15,16 15,28 6,22.5\" fill=\"#7dd3fc\" opacity=\"0.85\"/><polygon points=\"7,12.5 14,16.5 14,26.5 7,21.5\" fill=\"#38bdf8\" opacity=\"0.55\"/><line x1=\"7\" y1=\"13\" x2=\"14\" y2=\"25\" stroke=\"#ffffff\" stroke-width=\"1.2\" opacity=\"0.8\"/><line x1=\"6\" y1=\"18\" x2=\"11\" y2=\"26\" stroke=\"#f0f9ff\" stroke-width=\"0.7\" opacity=\"0.6\"/><circle cx=\"8\" cy=\"19\" r=\"1.1\" fill=\"#ffffff\" opacity=\"0.95\"/><circle cx=\"12\" cy=\"22\" r=\"0.8\" fill=\"#ffffff\" opacity=\"0.85\"/><circle cx=\"10\" cy=\"15\" r=\"0.6\" fill=\"#e0f2fe\" opacity=\"0.9\"/><polygon points=\"16,16 27,10 27,23 16,29\" fill=\"#38bdf8\" opacity=\"0.9\"/><polygon points=\"17,16 26,10.5 26,22.5 17,28\" fill=\"#0ea5e9\" opacity=\"0.85\"/><polygon points=\"18,17 25,12 25,21 18,26.5\" fill=\"#0284c7\" opacity=\"0.65\"/><line x1=\"25\" y1=\"13\" x2=\"18\" y2=\"24\" stroke=\"#bae6fd\" stroke-width=\"1\" opacity=\"0.65\"/><line x1=\"22\" y1=\"11\" x2=\"26\" y2=\"18\" stroke=\"#ffffff\" stroke-width=\"0.7\" opacity=\"0.7\"/><circle cx=\"21\" cy=\"17\" r=\"1\" fill=\"#ffffff\" opacity=\"0.9\"/><circle cx=\"23\" cy=\"21\" r=\"0.75\" fill=\"#bae6fd\" opacity=\"0.85\"/><polygon points=\"16,4 27,10 16,16 5,10\" fill=\"#e0f2fe\" opacity=\"0.95\"/><polygon points=\"16,5 25.5,10 16,15 6.5,10\" fill=\"#f0f9ff\" opacity=\"0.9\"/><polygon points=\"16,6.5 24,10 16,13.5 8,10\" fill=\"#ffffff\" opacity=\"0.85\"/><line x1=\"9\" y1=\"9\" x2=\"16\" y2=\"13\" stroke=\"#ffffff\" stroke-width=\"1.2\" opacity=\"0.95\"/><line x1=\"16\" y1=\"7\" x2=\"23\" y2=\"11\" stroke=\"#ffffff\" stroke-width=\"0.8\" opacity=\"0.7\"/><line x1=\"16\" y1=\"4\" x2=\"16\" y2=\"29\" stroke=\"#ffffff\" stroke-width=\"1.2\" opacity=\"0.95\"/><line x1=\"5\" y1=\"10\" x2=\"16\" y2=\"16\" stroke=\"#ffffff\" stroke-width=\"1.2\" opacity=\"0.95\"/><line x1=\"27\" y1=\"10\" x2=\"16\" y2=\"16\" stroke=\"#e0f2fe\" stroke-width=\"1\" opacity=\"0.9\"/><line x1=\"5\" y1=\"10\" x2=\"16\" y2=\"4\" stroke=\"#ffffff\" stroke-width=\"1\" opacity=\"0.95\"/><line x1=\"27\" y1=\"10\" x2=\"16\" y2=\"4\" stroke=\"#e0f2fe\" stroke-width=\"0.9\" opacity=\"0.85\"/><line x1=\"5\" y1=\"10\" x2=\"5\" y2=\"23\" stroke=\"#e0f2fe\" stroke-width=\"0.9\" opacity=\"0.85\"/><line x1=\"27\" y1=\"10\" x2=\"27\" y2=\"23\" stroke=\"#38bdf8\" stroke-width=\"0.8\" opacity=\"0.7\"/><line x1=\"5\" y1=\"23\" x2=\"16\" y2=\"29\" stroke=\"#38bdf8\" stroke-width=\"0.9\" opacity=\"0.85\"/><line x1=\"27\" y1=\"23\" x2=\"16\" y2=\"29\" stroke=\"#0ea5e9\" stroke-width=\"0.8\" opacity=\"0.7\"/><line x1=\"2\" y1=\"8\" x2=\"6\" y2=\"8\" stroke=\"#ffffff\" stroke-width=\"1\" stroke-linecap=\"round\"/><line x1=\"4\" y1=\"6\" x2=\"4\" y2=\"10\" stroke=\"#ffffff\" stroke-width=\"1\" stroke-linecap=\"round\"/><circle cx=\"4\" cy=\"8\" r=\"1.3\" fill=\"#ffffff\"/><circle cx=\"28\" cy=\"10\" r=\"0.9\" fill=\"#ffffff\"/>"
  },
  "air": {
    "key": "air",
    "name": "공기",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"11\" y=\"9\" width=\"8\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"9\" y=\"11\" width=\"2\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"19\" y=\"11\" width=\"2\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"8\" y=\"12\" width=\"1\" height=\"2\" fill=\"#38bdf8\"/><rect x=\"21\" y=\"12\" width=\"1\" height=\"2\" fill=\"#38bdf8\"/><rect x=\"7\" y=\"14\" width=\"1\" height=\"6\" fill=\"#38bdf8\"/><rect x=\"22\" y=\"14\" width=\"1\" height=\"6\" fill=\"#0284c7\"/><rect x=\"8\" y=\"20\" width=\"1\" height=\"2\" fill=\"#38bdf8\"/><rect x=\"21\" y=\"20\" width=\"1\" height=\"2\" fill=\"#0284c7\"/><rect x=\"9\" y=\"22\" width=\"2\" height=\"1\" fill=\"#0284c7\"/><rect x=\"19\" y=\"22\" width=\"2\" height=\"1\" fill=\"#0284c7\"/><rect x=\"11\" y=\"24\" width=\"8\" height=\"1\" fill=\"#0284c7\"/><rect x=\"8\" y=\"14\" width=\"14\" height=\"6\" fill=\"#e0f2fe\" opacity=\"0.15\"/><rect x=\"9\" y=\"12\" width=\"12\" height=\"8\" fill=\"#bae6fd\" opacity=\"0.12\"/><rect x=\"11\" y=\"11\" width=\"5\" height=\"1\" fill=\"#ffffff\"/><rect x=\"10\" y=\"12\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"9\" y=\"13\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"8\" y=\"15\" width=\"2\" height=\"3\" fill=\"#ffffff\"/><rect x=\"10\" y=\"14\" width=\"1\" height=\"2\" fill=\"#bae6fd\"/><rect x=\"12\" y=\"12\" width=\"2\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"18\" y=\"21\" width=\"3\" height=\"1\" fill=\"#7dd3fc\"/><rect x=\"20\" y=\"19\" width=\"1\" height=\"2\" fill=\"#7dd3fc\"/><rect x=\"21\" y=\"4\" width=\"4\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"19\" y=\"6\" width=\"2\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"25\" y=\"6\" width=\"2\" height=\"1\" fill=\"#0284c7\"/><rect x=\"19\" y=\"7\" width=\"1\" height=\"2\" fill=\"#38bdf8\"/><rect x=\"26\" y=\"7\" width=\"1\" height=\"2\" fill=\"#0284c7\"/><rect x=\"20\" y=\"9\" width=\"2\" height=\"1\" fill=\"#0284c7\"/><rect x=\"24\" y=\"9\" width=\"2\" height=\"1\" fill=\"#0284c7\"/><rect x=\"21\" y=\"10\" width=\"4\" height=\"1\" fill=\"#0284c7\"/><rect x=\"21\" y=\"5\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"20\" y=\"6\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"20\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"5\" y=\"23\" width=\"3\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"4\" y=\"24\" width=\"1\" height=\"2\" fill=\"#38bdf8\"/><rect x=\"8\" y=\"24\" width=\"1\" height=\"2\" fill=\"#0284c7\"/><rect x=\"5\" y=\"26\" width=\"3\" height=\"1\" fill=\"#0284c7\"/><rect x=\"5\" y=\"24\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"24\" y=\"16\" width=\"2\" height=\"2\" fill=\"#bae6fd\"/><rect x=\"24\" y=\"16\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"8\" width=\"2\" height=\"2\" fill=\"#7dd3fc\"/><rect x=\"7\" y=\"8\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"14\" y=\"3\" width=\"1\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"26\" y=\"23\" width=\"1\" height=\"1\" fill=\"#7dd3fc\"/>"
  },
  "rec_ringelju": {
    "key": "rec_ringelju",
    "name": "링겔주",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"11\" y=\"1\" width=\"10\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"10\" y=\"2\" width=\"12\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"10\" y=\"3\" width=\"1\" height=\"7\" fill=\"#cbd5e1\"/><rect x=\"11\" y=\"3\" width=\"2\" height=\"7\" fill=\"#fef08a\"/><rect x=\"13\" y=\"3\" width=\"5\" height=\"7\" fill=\"#eab308\"/><rect x=\"18\" y=\"3\" width=\"2\" height=\"7\" fill=\"#ca8a04\"/><rect x=\"20\" y=\"3\" width=\"1\" height=\"7\" fill=\"#64748b\"/><circle cx=\"15.5\" cy=\"6\" r=\"1.5\" fill=\"#f472b6\"/><circle cx=\"15.5\" cy=\"6\" r=\"0.6\" fill=\"#fde047\"/><rect x=\"11\" y=\"10\" width=\"10\" height=\"1\" fill=\"#eab308\"/><rect x=\"12\" y=\"11\" width=\"8\" height=\"1\" fill=\"#eab308\"/><rect x=\"13\" y=\"12\" width=\"6\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"14\" y=\"13\" width=\"4\" height=\"2\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"14\" width=\"6\" height=\"1\" fill=\"#facc15\"/><rect x=\"13\" y=\"15\" width=\"6\" height=\"1\" fill=\"#84cc16\"/><rect x=\"13\" y=\"16\" width=\"6\" height=\"1\" fill=\"#22c55e\"/><rect x=\"14\" y=\"16\" width=\"4\" height=\"2\" fill=\"#22c55e\"/><rect x=\"13\" y=\"18\" width=\"6\" height=\"1\" fill=\"#22c55e\"/><rect x=\"11\" y=\"19\" width=\"10\" height=\"1\" fill=\"#16a34a\"/><rect x=\"10\" y=\"20\" width=\"12\" height=\"1\" fill=\"#15803d\"/><rect x=\"9\" y=\"21\" width=\"1\" height=\"8\" fill=\"#14532d\"/><rect x=\"10\" y=\"21\" width=\"2\" height=\"8\" fill=\"#4ade80\"/><rect x=\"12\" y=\"21\" width=\"6\" height=\"8\" fill=\"#22c55e\"/><rect x=\"18\" y=\"21\" width=\"3\" height=\"8\" fill=\"#16a34a\"/><rect x=\"21\" y=\"21\" width=\"1\" height=\"8\" fill=\"#14532d\"/><rect x=\"11\" y=\"23\" width=\"10\" height=\"5\" fill=\"#ffffff\"/><rect x=\"14\" y=\"24\" width=\"4\" height=\"1\" fill=\"#0284c7\"/><rect x=\"15\" y=\"25\" width=\"2\" height=\"1\" fill=\"#ef4444\"/><rect x=\"10\" y=\"29\" width=\"12\" height=\"1\" fill=\"#14532d\"/><rect x=\"11\" y=\"30\" width=\"10\" height=\"1\" fill=\"#052e16\"/><rect x=\"23\" y=\"10\" width=\"3\" height=\"6\" fill=\"#e2e8f0\" stroke=\"#94a3b8\" stroke-width=\"0.5\"/><rect x=\"24\" y=\"12\" width=\"1.5\" height=\"3\" fill=\"#facc15\"/><path d=\"M 24.5,16 Q 27,20 25,25 Q 23.5,28 21,29\" fill=\"none\" stroke=\"#f8fafc\" stroke-width=\"1.2\" stroke-linecap=\"round\"/><path d=\"M 24.5,16 Q 27,20 25,25 Q 23.5,28 21,29\" fill=\"none\" stroke=\"#38bdf8\" stroke-width=\"0.5\" opacity=\"0.6\"/><rect x=\"24\" y=\"21\" width=\"2.5\" height=\"2\" fill=\"#2563eb\" rx=\"0.5\"/>"
  },
  "screwbar": {
    "key": "screwbar",
    "name": "배배꼬인바",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"15\" y=\"24\" width=\"2\" height=\"8\" fill=\"#b45309\"/><rect x=\"15\" y=\"24\" width=\"1.5\" height=\"8\" fill=\"#d97706\"/><rect x=\"15\" y=\"24\" width=\"0.8\" height=\"4\" fill=\"#fde68a\"/><rect x=\"12\" y=\"23\" width=\"8\" height=\"1\" fill=\"#700824\"/><rect x=\"15\" y=\"1\" width=\"2\" height=\"1\" fill=\"#e11d48\"/><rect x=\"15\" y=\"1\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"14\" y=\"2\" width=\"4\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"15\" y=\"2\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"14\" y=\"3\" width=\"4\" height=\"1\" fill=\"#e11d48\"/><rect x=\"16\" y=\"3\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"4\" width=\"6\" height=\"1\" fill=\"#e11d48\"/><rect x=\"14\" y=\"4\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"16\" y=\"4\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"18\" y=\"4\" width=\"1\" height=\"1\" fill=\"#ffe4e6\"/><rect x=\"12\" y=\"5\" width=\"8\" height=\"1\" fill=\"#be123c\"/><rect x=\"13\" y=\"5\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"15\" y=\"5\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"18\" y=\"5\" width=\"2\" height=\"1\" fill=\"#ffe4e6\"/><rect x=\"12\" y=\"6\" width=\"8\" height=\"1\" fill=\"#e11d48\"/><rect x=\"14\" y=\"6\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"16\" y=\"6\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"19\" y=\"6\" width=\"1\" height=\"1\" fill=\"#fecdd3\"/><rect x=\"13\" y=\"7\" width=\"7\" height=\"1\" fill=\"#9f1239\"/><rect x=\"14\" y=\"7\" width=\"3\" height=\"1\" fill=\"#e11d48\"/><rect x=\"17\" y=\"7\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"8\" width=\"6\" height=\"1\" fill=\"#700824\"/><rect x=\"17\" y=\"8\" width=\"2\" height=\"1\" fill=\"#be123c\"/><rect x=\"11\" y=\"9\" width=\"8\" height=\"1\" fill=\"#be123c\"/><rect x=\"11\" y=\"9\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"13\" y=\"9\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"16\" y=\"9\" width=\"2\" height=\"1\" fill=\"#ffe4e6\"/><rect x=\"11\" y=\"10\" width=\"9\" height=\"1\" fill=\"#e11d48\"/><rect x=\"12\" y=\"10\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"14\" y=\"10\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"17\" y=\"10\" width=\"2\" height=\"1\" fill=\"#ffe4e6\"/><rect x=\"11\" y=\"11\" width=\"10\" height=\"1\" fill=\"#be123c\"/><rect x=\"13\" y=\"11\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"15\" y=\"11\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"18\" y=\"11\" width=\"2\" height=\"1\" fill=\"#fecdd3\"/><rect x=\"12\" y=\"12\" width=\"9\" height=\"1\" fill=\"#9f1239\"/><rect x=\"14\" y=\"12\" width=\"3\" height=\"1\" fill=\"#e11d48\"/><rect x=\"17\" y=\"12\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"20\" y=\"12\" width=\"1\" height=\"1\" fill=\"#fecdd3\"/><rect x=\"12\" y=\"13\" width=\"8\" height=\"1\" fill=\"#700824\"/><rect x=\"18\" y=\"13\" width=\"2\" height=\"1\" fill=\"#be123c\"/><rect x=\"10\" y=\"14\" width=\"10\" height=\"1\" fill=\"#be123c\"/><rect x=\"10\" y=\"14\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"12\" y=\"14\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"15\" y=\"14\" width=\"3\" height=\"1\" fill=\"#ffe4e6\"/><rect x=\"10\" y=\"15\" width=\"11\" height=\"1\" fill=\"#e11d48\"/><rect x=\"11\" y=\"15\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"13\" y=\"15\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"16\" y=\"15\" width=\"3\" height=\"1\" fill=\"#ffe4e6\"/><rect x=\"10\" y=\"16\" width=\"12\" height=\"1\" fill=\"#be123c\"/><rect x=\"12\" y=\"16\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"14\" y=\"16\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"17\" y=\"16\" width=\"3\" height=\"1\" fill=\"#fecdd3\"/><rect x=\"11\" y=\"17\" width=\"11\" height=\"1\" fill=\"#9f1239\"/><rect x=\"13\" y=\"17\" width=\"3\" height=\"1\" fill=\"#e11d48\"/><rect x=\"16\" y=\"17\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"19\" y=\"17\" width=\"2\" height=\"1\" fill=\"#fecdd3\"/><rect x=\"11\" y=\"18\" width=\"9\" height=\"1\" fill=\"#700824\"/><rect x=\"19\" y=\"18\" width=\"2\" height=\"1\" fill=\"#be123c\"/><rect x=\"10\" y=\"19\" width=\"11\" height=\"1\" fill=\"#be123c\"/><rect x=\"10\" y=\"19\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"12\" y=\"19\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"15\" y=\"19\" width=\"3\" height=\"1\" fill=\"#ffe4e6\"/><rect x=\"10\" y=\"20\" width=\"12\" height=\"1\" fill=\"#e11d48\"/><rect x=\"11\" y=\"20\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"13\" y=\"20\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"16\" y=\"20\" width=\"3\" height=\"1\" fill=\"#ffe4e6\"/><rect x=\"10\" y=\"21\" width=\"13\" height=\"1\" fill=\"#be123c\"/><rect x=\"12\" y=\"21\" width=\"2\" height=\"1\" fill=\"#f43f5e\"/><rect x=\"14\" y=\"21\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"17\" y=\"21\" width=\"3\" height=\"1\" fill=\"#fecdd3\"/><rect x=\"11\" y=\"22\" width=\"12\" height=\"1\" fill=\"#9f1239\"/><rect x=\"13\" y=\"22\" width=\"3\" height=\"1\" fill=\"#e11d48\"/><rect x=\"16\" y=\"22\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"19\" y=\"22\" width=\"3\" height=\"1\" fill=\"#fecdd3\"/><rect x=\"12\" y=\"23\" width=\"10\" height=\"1\" fill=\"#700824\"/>"
  },
  "tankboy": {
    "key": "tankboy",
    "name": "배즙보이",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"13\" y=\"2\" width=\"6\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"14\" y=\"2\" width=\"4\" height=\"1\" fill=\"#fde047\"/><rect x=\"12\" y=\"3\" width=\"2\" height=\"2\" fill=\"#a16207\"/><rect x=\"13\" y=\"3\" width=\"1\" height=\"2\" fill=\"#fef08a\"/><rect x=\"18\" y=\"3\" width=\"2\" height=\"2\" fill=\"#a16207\"/><rect x=\"18\" y=\"3\" width=\"1\" height=\"2\" fill=\"#eab308\"/><rect x=\"13\" y=\"5\" width=\"6\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"14\" y=\"5\" width=\"4\" height=\"1\" fill=\"#eab308\"/><rect x=\"14\" y=\"6\" width=\"4\" height=\"1\" fill=\"#a16207\"/><rect x=\"15\" y=\"6\" width=\"2\" height=\"1\" fill=\"#fde047\"/><rect x=\"15\" y=\"7\" width=\"2\" height=\"2\" fill=\"#a16207\"/><rect x=\"15\" y=\"7\" width=\"1\" height=\"2\" fill=\"#fde047\"/><rect x=\"13\" y=\"9\" width=\"6\" height=\"1\" fill=\"#a16207\"/><rect x=\"14\" y=\"9\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"16\" y=\"9\" width=\"2\" height=\"1\" fill=\"#fef08a\"/><rect x=\"11\" y=\"10\" width=\"10\" height=\"1\" fill=\"#a16207\"/><rect x=\"12\" y=\"10\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"15\" y=\"10\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"19\" y=\"10\" width=\"1\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"10\" y=\"11\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"11\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"11\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"11\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"11\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"11\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"12\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"12\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"12\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"12\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"12\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"12\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"13\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"13\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"13\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"13\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"13\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"13\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"14\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"14\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"14\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"14\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"14\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"14\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"15\" width=\"1\" height=\"1\" fill=\"#854d0e\"/><rect x=\"11\" y=\"15\" width=\"2\" height=\"1\" fill=\"#fef08a\"/><rect x=\"13\" y=\"15\" width=\"4\" height=\"1\" fill=\"#fde047\"/><rect x=\"17\" y=\"15\" width=\"3\" height=\"1\" fill=\"#eab308\"/><rect x=\"20\" y=\"15\" width=\"1\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"21\" y=\"15\" width=\"1\" height=\"1\" fill=\"#854d0e\"/><rect x=\"10\" y=\"16\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"16\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"16\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"16\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"16\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"16\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"17\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"17\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"17\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"17\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"17\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"17\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"18\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"18\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"18\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"18\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"18\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"18\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"19\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"19\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"19\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"19\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"19\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"19\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"20\" width=\"1\" height=\"1\" fill=\"#854d0e\"/><rect x=\"11\" y=\"20\" width=\"2\" height=\"1\" fill=\"#fef08a\"/><rect x=\"13\" y=\"20\" width=\"4\" height=\"1\" fill=\"#fde047\"/><rect x=\"17\" y=\"20\" width=\"3\" height=\"1\" fill=\"#eab308\"/><rect x=\"20\" y=\"20\" width=\"1\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"21\" y=\"20\" width=\"1\" height=\"1\" fill=\"#854d0e\"/><rect x=\"10\" y=\"21\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"21\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"21\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"21\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"21\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"21\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"22\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"22\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"22\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"22\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"22\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"22\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"23\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"23\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"23\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"23\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"23\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"23\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"24\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"24\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"24\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"24\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"24\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"24\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"25\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"25\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"25\" width=\"4\" height=\"1\" fill=\"#fef08a\"/><rect x=\"17\" y=\"25\" width=\"3\" height=\"1\" fill=\"#fde047\"/><rect x=\"20\" y=\"25\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"21\" y=\"25\" width=\"1\" height=\"1\" fill=\"#a16207\"/><rect x=\"14\" y=\"12\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"16\" y=\"13\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"14\" y=\"17\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"17\" y=\"18\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"14\" y=\"22\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"16\" y=\"23\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"15\" y=\"13\" width=\"2\" height=\"1\" fill=\"#4d7c0f\"/><rect x=\"14\" y=\"14\" width=\"3\" height=\"1\" fill=\"#65a30d\"/><rect x=\"15\" y=\"14\" width=\"1\" height=\"1\" fill=\"#bef264\"/><rect x=\"10\" y=\"26\" width=\"12\" height=\"1\" fill=\"#854d0e\"/><rect x=\"11\" y=\"26\" width=\"10\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"10\" y=\"27\" width=\"12\" height=\"1\" fill=\"#a16207\"/><rect x=\"11\" y=\"27\" width=\"2\" height=\"1\" fill=\"#fde047\"/><rect x=\"14\" y=\"27\" width=\"2\" height=\"1\" fill=\"#fde047\"/><rect x=\"17\" y=\"27\" width=\"2\" height=\"1\" fill=\"#fde047\"/><rect x=\"10\" y=\"28\" width=\"12\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"11\" y=\"28\" width=\"10\" height=\"1\" fill=\"#a16207\"/><rect x=\"10\" y=\"29\" width=\"2\" height=\"1\" fill=\"#854d0e\"/><rect x=\"13\" y=\"29\" width=\"2\" height=\"1\" fill=\"#854d0e\"/><rect x=\"16\" y=\"29\" width=\"2\" height=\"1\" fill=\"#854d0e\"/><rect x=\"19\" y=\"29\" width=\"2\" height=\"1\" fill=\"#854d0e\"/>"
  },
  "chocolate": {
    "key": "chocolate",
    "name": "초콜릿",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"5\" y=\"3\" width=\"22\" height=\"26\" rx=\"1.5\" fill=\"#1a0802\"/><rect x=\"6\" y=\"4\" width=\"20\" height=\"24\" fill=\"#381304\"/><rect x=\"15\" y=\"4\" width=\"2\" height=\"24\" fill=\"#180601\"/><rect x=\"6\" y=\"11\" width=\"20\" height=\"2\" fill=\"#180601\"/><rect x=\"6\" y=\"19\" width=\"20\" height=\"2\" fill=\"#180601\"/><rect x=\"7\" y=\"5\" width=\"8\" height=\"6\" fill=\"#2a0d03\"/><rect x=\"8\" y=\"6\" width=\"6\" height=\"1\" fill=\"#9c4a23\"/><rect x=\"8\" y=\"7\" width=\"1\" height=\"3\" fill=\"#823916\"/><rect x=\"9\" y=\"7\" width=\"4\" height=\"2\" fill=\"#69290c\"/><rect x=\"13\" y=\"7\" width=\"1\" height=\"3\" fill=\"#381203\"/><rect x=\"8\" y=\"9\" width=\"6\" height=\"1\" fill=\"#1f0701\"/><rect x=\"17\" y=\"5\" width=\"8\" height=\"6\" fill=\"#2a0d03\"/><rect x=\"18\" y=\"6\" width=\"6\" height=\"1\" fill=\"#9c4a23\"/><rect x=\"18\" y=\"7\" width=\"1\" height=\"3\" fill=\"#823916\"/><rect x=\"19\" y=\"7\" width=\"4\" height=\"2\" fill=\"#69290c\"/><rect x=\"23\" y=\"7\" width=\"1\" height=\"3\" fill=\"#381203\"/><rect x=\"18\" y=\"9\" width=\"6\" height=\"1\" fill=\"#1f0701\"/><rect x=\"7\" y=\"13\" width=\"8\" height=\"6\" fill=\"#2a0d03\"/><rect x=\"8\" y=\"14\" width=\"6\" height=\"1\" fill=\"#9c4a23\"/><rect x=\"8\" y=\"15\" width=\"1\" height=\"3\" fill=\"#823916\"/><rect x=\"9\" y=\"15\" width=\"4\" height=\"2\" fill=\"#69290c\"/><rect x=\"13\" y=\"15\" width=\"1\" height=\"3\" fill=\"#381203\"/><rect x=\"8\" y=\"17\" width=\"6\" height=\"1\" fill=\"#1f0701\"/><rect x=\"17\" y=\"13\" width=\"8\" height=\"6\" fill=\"#2a0d03\"/><rect x=\"18\" y=\"14\" width=\"6\" height=\"1\" fill=\"#9c4a23\"/><rect x=\"18\" y=\"15\" width=\"1\" height=\"3\" fill=\"#823916\"/><rect x=\"19\" y=\"15\" width=\"4\" height=\"2\" fill=\"#69290c\"/><rect x=\"23\" y=\"15\" width=\"1\" height=\"3\" fill=\"#381203\"/><rect x=\"18\" y=\"17\" width=\"6\" height=\"1\" fill=\"#1f0701\"/><rect x=\"7\" y=\"21\" width=\"8\" height=\"6\" fill=\"#2a0d03\"/><rect x=\"8\" y=\"22\" width=\"6\" height=\"1\" fill=\"#9c4a23\"/><rect x=\"8\" y=\"23\" width=\"1\" height=\"3\" fill=\"#823916\"/><rect x=\"9\" y=\"23\" width=\"4\" height=\"2\" fill=\"#69290c\"/><rect x=\"13\" y=\"23\" width=\"1\" height=\"3\" fill=\"#381203\"/><rect x=\"8\" y=\"25\" width=\"6\" height=\"1\" fill=\"#1f0701\"/><rect x=\"17\" y=\"21\" width=\"8\" height=\"6\" fill=\"#2a0d03\"/><rect x=\"18\" y=\"22\" width=\"6\" height=\"1\" fill=\"#9c4a23\"/><rect x=\"18\" y=\"23\" width=\"1\" height=\"3\" fill=\"#823916\"/><rect x=\"19\" y=\"23\" width=\"4\" height=\"2\" fill=\"#69290c\"/><rect x=\"23\" y=\"23\" width=\"1\" height=\"3\" fill=\"#381203\"/><rect x=\"18\" y=\"25\" width=\"6\" height=\"1\" fill=\"#1f0701\"/><rect x=\"9\" y=\"6\" width=\"2\" height=\"1\" fill=\"#c46f41\" opacity=\"0.8\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\" opacity=\"0.4\"/>"
  },
  "rec_screwbarju": {
    "key": "rec_screwbarju",
    "name": "배배꼬인주",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"7\" y=\"10\" width=\"1\" height=\"19\" fill=\"#94a3b8\"/><rect x=\"24\" y=\"10\" width=\"1\" height=\"19\" fill=\"#64748b\"/><rect x=\"8\" y=\"28\" width=\"16\" height=\"2\" fill=\"#475569\"/><rect x=\"9\" y=\"29\" width=\"14\" height=\"1\" fill=\"#334155\"/><rect x=\"8\" y=\"12\" width=\"16\" height=\"16\" fill=\"#fb7185\"/><rect x=\"8\" y=\"12\" width=\"16\" height=\"2\" fill=\"#f43f5e\"/><rect x=\"8\" y=\"18\" width=\"16\" height=\"10\" fill=\"#e11d48\"/><rect x=\"8\" y=\"12\" width=\"2\" height=\"16\" fill=\"rgba(255,255,255,0.4)\"/><rect x=\"11\" y=\"15\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"19\" y=\"17\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"21\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"20\" y=\"23\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"17\" y=\"2\" width=\"2\" height=\"4\" fill=\"#d97706\"/><rect x=\"17\" y=\"2\" width=\"1\" height=\"4\" fill=\"#fde68a\"/><rect x=\"15\" y=\"5\" width=\"5\" height=\"2\" fill=\"#be123c\"/><rect x=\"16\" y=\"5\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"14\" y=\"7\" width=\"6\" height=\"2\" fill=\"#e11d48\"/><rect x=\"17\" y=\"7\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"13\" y=\"9\" width=\"6\" height=\"2\" fill=\"#be123c\"/><rect x=\"15\" y=\"9\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"12\" y=\"11\" width=\"7\" height=\"2\" fill=\"#e11d48\"/><rect x=\"16\" y=\"11\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"11\" y=\"13\" width=\"7\" height=\"2\" fill=\"#9f1239\"/><rect x=\"14\" y=\"13\" width=\"2\" height=\"2\" fill=\"#ffffff\"/>"
  },
  "rec_tankboyju": {
    "key": "rec_tankboyju",
    "name": "배즙보이주",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"7\" y=\"10\" width=\"1\" height=\"19\" fill=\"#94a3b8\"/><rect x=\"24\" y=\"10\" width=\"1\" height=\"19\" fill=\"#64748b\"/><rect x=\"8\" y=\"28\" width=\"16\" height=\"2\" fill=\"#475569\"/><rect x=\"9\" y=\"29\" width=\"14\" height=\"1\" fill=\"#334155\"/><rect x=\"8\" y=\"12\" width=\"16\" height=\"16\" fill=\"#fef08a\"/><rect x=\"8\" y=\"12\" width=\"16\" height=\"3\" fill=\"#fef9c3\"/><rect x=\"8\" y=\"19\" width=\"16\" height=\"9\" fill=\"#fde047\"/><rect x=\"8\" y=\"12\" width=\"2\" height=\"16\" fill=\"rgba(255,255,255,0.4)\"/><rect x=\"11\" y=\"14\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"18\" y=\"16\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"20\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"21\" y=\"22\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"16\" y=\"1\" width=\"4\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"17\" y=\"1\" width=\"2\" height=\"1\" fill=\"#fde047\"/><rect x=\"15\" y=\"2\" width=\"2\" height=\"2\" fill=\"#a16207\"/><rect x=\"19\" y=\"2\" width=\"2\" height=\"2\" fill=\"#a16207\"/><rect x=\"16\" y=\"4\" width=\"4\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"17\" y=\"5\" width=\"2\" height=\"2\" fill=\"#a16207\"/><rect x=\"17\" y=\"5\" width=\"1\" height=\"2\" fill=\"#fde047\"/><rect x=\"15\" y=\"7\" width=\"5\" height=\"2\" fill=\"#a16207\"/><rect x=\"16\" y=\"7\" width=\"2\" height=\"2\" fill=\"#ffffff\"/><rect x=\"18\" y=\"7\" width=\"2\" height=\"2\" fill=\"#fef08a\"/><rect x=\"14\" y=\"9\" width=\"6\" height=\"3\" fill=\"#a16207\"/><rect x=\"15\" y=\"9\" width=\"2\" height=\"3\" fill=\"#ffffff\"/><rect x=\"17\" y=\"9\" width=\"2\" height=\"3\" fill=\"#fde047\"/><rect x=\"19\" y=\"9\" width=\"1\" height=\"3\" fill=\"#eab308\"/><rect x=\"13\" y=\"12\" width=\"7\" height=\"3\" fill=\"#a16207\"/><rect x=\"14\" y=\"12\" width=\"2\" height=\"3\" fill=\"#ffffff\"/><rect x=\"16\" y=\"12\" width=\"3\" height=\"3\" fill=\"#fde047\"/><rect x=\"19\" y=\"12\" width=\"1\" height=\"3\" fill=\"#ca8a04\"/>"
  },
  "rec_mango_ringo": {
    "key": "rec_mango_ringo",
    "name": "망고비어",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"12\" y=\"1\" width=\"8\" height=\"2\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"1\" width=\"6\" height=\"1\" fill=\"#facc15\"/><rect x=\"12\" y=\"3\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"13\" y=\"4\" width=\"1\" height=\"7\" fill=\"#14532d\"/><rect x=\"14\" y=\"4\" width=\"1\" height=\"7\" fill=\"#86efac\"/><rect x=\"15\" y=\"4\" width=\"2\" height=\"7\" fill=\"#22c55e\"/><rect x=\"17\" y=\"4\" width=\"1\" height=\"7\" fill=\"#16a34a\"/><rect x=\"18\" y=\"4\" width=\"1\" height=\"7\" fill=\"#14532d\"/><rect x=\"12\" y=\"11\" width=\"2\" height=\"1\" fill=\"#86efac\"/><rect x=\"14\" y=\"11\" width=\"4\" height=\"1\" fill=\"#22c55e\"/><rect x=\"18\" y=\"11\" width=\"2\" height=\"1\" fill=\"#14532d\"/><rect x=\"10\" y=\"12\" width=\"3\" height=\"1\" fill=\"#86efac\"/><rect x=\"13\" y=\"12\" width=\"6\" height=\"1\" fill=\"#22c55e\"/><rect x=\"19\" y=\"12\" width=\"3\" height=\"1\" fill=\"#14532d\"/><rect x=\"9\" y=\"13\" width=\"3\" height=\"1\" fill=\"#86efac\"/><rect x=\"12\" y=\"13\" width=\"8\" height=\"1\" fill=\"#22c55e\"/><rect x=\"20\" y=\"13\" width=\"3\" height=\"1\" fill=\"#14532d\"/><rect x=\"8\" y=\"14\" width=\"1\" height=\"15\" fill=\"#14532d\"/><rect x=\"9\" y=\"14\" width=\"1\" height=\"15\" fill=\"#4ade80\"/><rect x=\"10\" y=\"14\" width=\"2\" height=\"15\" fill=\"#86efac\"/><rect x=\"12\" y=\"14\" width=\"7\" height=\"15\" fill=\"#22c55e\"/><rect x=\"19\" y=\"14\" width=\"3\" height=\"15\" fill=\"#16a34a\"/><rect x=\"22\" y=\"14\" width=\"1\" height=\"15\" fill=\"#166534\"/><rect x=\"23\" y=\"14\" width=\"1\" height=\"15\" fill=\"#14532d\"/><rect x=\"10\" y=\"16\" width=\"12\" height=\"9\" fill=\"#fde047\"/><rect x=\"10\" y=\"16\" width=\"12\" height=\"1\" fill=\"#fef08a\"/><rect x=\"10\" y=\"24\" width=\"12\" height=\"1\" fill=\"#eab308\"/><circle cx=\"16\" cy=\"19.5\" r=\"2.2\" fill=\"#ea580c\"/><circle cx=\"15.5\" cy=\"19\" r=\"1.8\" fill=\"#f97316\"/><circle cx=\"15\" cy=\"18.5\" r=\"0.8\" fill=\"#fde047\"/><path d=\"M 16.5,18 Q 18,16.5 19,17 Q 18,18.5 16.5,18 Z\" fill=\"#16a34a\"/><rect x=\"12\" y=\"22\" width=\"8\" height=\"2\" fill=\"#ffffff\"/><rect x=\"13\" y=\"23\" width=\"6\" height=\"0.8\" fill=\"#ea580c\"/><rect x=\"9\" y=\"29\" width=\"14\" height=\"1\" fill=\"#166534\"/><rect x=\"10\" y=\"30\" width=\"12\" height=\"1\" fill=\"#14532d\"/>"
  },
  "rec_mango_ringoju": {
    "key": "rec_mango_ringoju",
    "name": "망고비어주",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"12\" y=\"1\" width=\"8\" height=\"2\" fill=\"#ca8a04\"/><rect x=\"13\" y=\"1\" width=\"6\" height=\"1\" fill=\"#facc15\"/><rect x=\"12\" y=\"3\" width=\"8\" height=\"1\" fill=\"#a16207\"/><rect x=\"13\" y=\"4\" width=\"1\" height=\"7\" fill=\"#14532d\"/><rect x=\"14\" y=\"4\" width=\"1\" height=\"7\" fill=\"#86efac\"/><rect x=\"15\" y=\"4\" width=\"2\" height=\"7\" fill=\"#22c55e\"/><rect x=\"17\" y=\"4\" width=\"1\" height=\"7\" fill=\"#16a34a\"/><rect x=\"18\" y=\"4\" width=\"1\" height=\"7\" fill=\"#14532d\"/><rect x=\"12\" y=\"11\" width=\"2\" height=\"1\" fill=\"#86efac\"/><rect x=\"14\" y=\"11\" width=\"4\" height=\"1\" fill=\"#22c55e\"/><rect x=\"18\" y=\"11\" width=\"2\" height=\"1\" fill=\"#14532d\"/><rect x=\"10\" y=\"12\" width=\"3\" height=\"1\" fill=\"#86efac\"/><rect x=\"13\" y=\"12\" width=\"6\" height=\"1\" fill=\"#22c55e\"/><rect x=\"19\" y=\"12\" width=\"3\" height=\"1\" fill=\"#14532d\"/><rect x=\"9\" y=\"13\" width=\"3\" height=\"1\" fill=\"#86efac\"/><rect x=\"12\" y=\"13\" width=\"8\" height=\"1\" fill=\"#22c55e\"/><rect x=\"20\" y=\"13\" width=\"3\" height=\"1\" fill=\"#14532d\"/><rect x=\"8\" y=\"14\" width=\"1\" height=\"15\" fill=\"#14532d\"/><rect x=\"9\" y=\"14\" width=\"1\" height=\"15\" fill=\"#4ade80\"/><rect x=\"10\" y=\"14\" width=\"2\" height=\"15\" fill=\"#86efac\"/><rect x=\"12\" y=\"14\" width=\"7\" height=\"15\" fill=\"#22c55e\"/><rect x=\"19\" y=\"14\" width=\"3\" height=\"15\" fill=\"#16a34a\"/><rect x=\"22\" y=\"14\" width=\"1\" height=\"15\" fill=\"#166534\"/><rect x=\"23\" y=\"14\" width=\"1\" height=\"15\" fill=\"#14532d\"/><rect x=\"10\" y=\"16\" width=\"12\" height=\"9\" fill=\"#fde047\"/><rect x=\"10\" y=\"16\" width=\"12\" height=\"1\" fill=\"#fef08a\"/><rect x=\"10\" y=\"24\" width=\"12\" height=\"1\" fill=\"#eab308\"/><circle cx=\"16\" cy=\"19.5\" r=\"2.2\" fill=\"#ea580c\"/><circle cx=\"15.5\" cy=\"19\" r=\"1.8\" fill=\"#f97316\"/><circle cx=\"15\" cy=\"18.5\" r=\"0.8\" fill=\"#fde047\"/><path d=\"M 16.5,18 Q 18,16.5 19,17 Q 18,18.5 16.5,18 Z\" fill=\"#16a34a\"/><rect x=\"12\" y=\"22\" width=\"8\" height=\"2\" fill=\"#ffffff\"/><rect x=\"13\" y=\"23\" width=\"6\" height=\"0.8\" fill=\"#ea580c\"/><rect x=\"9\" y=\"29\" width=\"14\" height=\"1\" fill=\"#166534\"/><rect x=\"10\" y=\"30\" width=\"12\" height=\"1\" fill=\"#14532d\"/>"
  },
  "milk": {
    "key": "milk",
    "name": "우유",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"9\" y=\"5\" width=\"14\" height=\"1\" fill=\"#1e40af\"/><rect x=\"8\" y=\"6\" width=\"16\" height=\"1\" fill=\"#2563eb\"/><rect x=\"9\" y=\"6\" width=\"4\" height=\"1\" fill=\"#60a5fa\"/><rect x=\"8\" y=\"7\" width=\"16\" height=\"1\" fill=\"#1d4ed8\"/><rect x=\"7\" y=\"8\" width=\"18\" height=\"1\" fill=\"#3b82f6\"/><rect x=\"8\" y=\"8\" width=\"5\" height=\"1\" fill=\"#93c5fd\"/><rect x=\"7\" y=\"9\" width=\"18\" height=\"1\" fill=\"#2563eb\"/><rect x=\"6\" y=\"10\" width=\"20\" height=\"1\" fill=\"#1d4ed8\"/><rect x=\"6\" y=\"10\" width=\"3\" height=\"1\" fill=\"#60a5fa\"/><rect x=\"6\" y=\"11\" width=\"20\" height=\"1\" fill=\"#1e40af\"/><rect x=\"23\" y=\"8\" width=\"2\" height=\"4\" fill=\"#1e3a8a\"/><rect x=\"5\" y=\"12\" width=\"1\" height=\"15\" fill=\"#94a3b8\"/><rect x=\"26\" y=\"12\" width=\"1\" height=\"15\" fill=\"#64748b\"/><rect x=\"6\" y=\"12\" width=\"14\" height=\"14\" fill=\"#ffffff\"/><rect x=\"20\" y=\"12\" width=\"6\" height=\"14\" fill=\"#f1f5f9\"/><rect x=\"23\" y=\"12\" width=\"3\" height=\"14\" fill=\"#e2e8f0\"/><rect x=\"6\" y=\"26\" width=\"20\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"7\" y=\"27\" width=\"18\" height=\"1\" fill=\"#94a3b8\"/><rect x=\"6\" y=\"13\" width=\"20\" height=\"2\" fill=\"#2563eb\"/><rect x=\"6\" y=\"13\" width=\"14\" height=\"1\" fill=\"#3b82f6\"/><rect x=\"20\" y=\"13\" width=\"6\" height=\"2\" fill=\"#1d4ed8\"/><rect x=\"6\" y=\"17\" width=\"14\" height=\"4\" fill=\"#eff6ff\"/><rect x=\"7\" y=\"18\" width=\"12\" height=\"2\" fill=\"#3b82f6\"/><rect x=\"8\" y=\"18\" width=\"4\" height=\"1\" fill=\"#60a5fa\"/><rect x=\"12\" y=\"19\" width=\"2\" height=\"3\" fill=\"#2563eb\"/><rect x=\"11\" y=\"20\" width=\"4\" height=\"2\" fill=\"#2563eb\"/><rect x=\"12\" y=\"20\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"6\" y=\"23\" width=\"20\" height=\"1\" fill=\"#2563eb\"/><rect x=\"20\" y=\"23\" width=\"6\" height=\"1\" fill=\"#1d4ed8\"/>"
  },
  "strawberry_milk": {
    "key": "strawberry_milk",
    "name": "딸기우유",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"9\" y=\"5\" width=\"14\" height=\"1\" fill=\"#9d174d\"/><rect x=\"8\" y=\"6\" width=\"16\" height=\"1\" fill=\"#db2777\"/><rect x=\"9\" y=\"6\" width=\"4\" height=\"1\" fill=\"#f472b6\"/><rect x=\"8\" y=\"7\" width=\"16\" height=\"1\" fill=\"#be185d\"/><rect x=\"7\" y=\"8\" width=\"18\" height=\"1\" fill=\"#ec4899\"/><rect x=\"8\" y=\"8\" width=\"5\" height=\"1\" fill=\"#fbcfe8\"/><rect x=\"7\" y=\"9\" width=\"18\" height=\"1\" fill=\"#db2777\"/><rect x=\"6\" y=\"10\" width=\"20\" height=\"1\" fill=\"#be185d\"/><rect x=\"6\" y=\"10\" width=\"3\" height=\"1\" fill=\"#f472b6\"/><rect x=\"6\" y=\"11\" width=\"20\" height=\"1\" fill=\"#9d174d\"/><rect x=\"23\" y=\"8\" width=\"2\" height=\"4\" fill=\"#831843\"/><rect x=\"5\" y=\"12\" width=\"1\" height=\"15\" fill=\"#f472b6\"/><rect x=\"26\" y=\"12\" width=\"1\" height=\"15\" fill=\"#be185d\"/><rect x=\"6\" y=\"12\" width=\"14\" height=\"14\" fill=\"#fdf2f8\"/><rect x=\"20\" y=\"12\" width=\"6\" height=\"14\" fill=\"#fce7f3\"/><rect x=\"23\" y=\"12\" width=\"3\" height=\"14\" fill=\"#fbcfe8\"/><rect x=\"6\" y=\"26\" width=\"20\" height=\"1\" fill=\"#f472b6\"/><rect x=\"7\" y=\"27\" width=\"18\" height=\"1\" fill=\"#db2777\"/><rect x=\"6\" y=\"13\" width=\"20\" height=\"2\" fill=\"#db2777\"/><rect x=\"6\" y=\"13\" width=\"14\" height=\"1\" fill=\"#f472b6\"/><rect x=\"20\" y=\"13\" width=\"6\" height=\"2\" fill=\"#be185d\"/><rect x=\"6\" y=\"17\" width=\"14\" height=\"5\" fill=\"#fce7f3\"/><rect x=\"12\" y=\"16\" width=\"2\" height=\"1\" fill=\"#15803d\"/><rect x=\"11\" y=\"17\" width=\"4\" height=\"1\" fill=\"#22c55e\"/><rect x=\"12\" y=\"17\" width=\"2\" height=\"1\" fill=\"#86efac\"/><rect x=\"11\" y=\"18\" width=\"4\" height=\"1\" fill=\"#ef4444\"/><rect x=\"10\" y=\"19\" width=\"6\" height=\"2\" fill=\"#dc2626\"/><rect x=\"11\" y=\"21\" width=\"4\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"12\" y=\"22\" width=\"2\" height=\"1\" fill=\"#991b1b\"/><rect x=\"11\" y=\"19\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"19\" width=\"1\" height=\"1\" fill=\"#fef08a\"/><rect x=\"12\" y=\"20\" width=\"1\" height=\"1\" fill=\"#fef08a\"/><rect x=\"14\" y=\"20\" width=\"1\" height=\"1\" fill=\"#fef08a\"/><rect x=\"6\" y=\"23\" width=\"20\" height=\"1\" fill=\"#db2777\"/><rect x=\"20\" y=\"23\" width=\"6\" height=\"1\" fill=\"#be185d\"/>"
  },
  "mango": {
    "key": "mango",
    "name": "망고",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"15\" y=\"2\" width=\"2\" height=\"3\" fill=\"#78350f\"/><rect x=\"15\" y=\"2\" width=\"1\" height=\"3\" fill=\"#a16207\"/><rect x=\"17\" y=\"4\" width=\"4\" height=\"1\" fill=\"#15803d\"/><rect x=\"18\" y=\"3\" width=\"4\" height=\"1\" fill=\"#22c55e\"/><rect x=\"19\" y=\"2\" width=\"3\" height=\"1\" fill=\"#4ade80\"/><rect x=\"22\" y=\"2\" width=\"1\" height=\"1\" fill=\"#86efac\"/><rect x=\"18\" y=\"5\" width=\"3\" height=\"1\" fill=\"#166534\"/><rect x=\"13\" y=\"5\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"14\" y=\"5\" width=\"1\" height=\"1\" fill=\"#ef4444\"/><rect x=\"15\" y=\"5\" width=\"3\" height=\"1\" fill=\"#f97316\"/><rect x=\"18\" y=\"5\" width=\"0\" height=\"1\" fill=\"#facc15\"/><rect x=\"18\" y=\"5\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"11\" y=\"6\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"12\" y=\"6\" width=\"2\" height=\"1\" fill=\"#ef4444\"/><rect x=\"14\" y=\"6\" width=\"5\" height=\"1\" fill=\"#f97316\"/><rect x=\"19\" y=\"6\" width=\"1\" height=\"1\" fill=\"#facc15\"/><rect x=\"20\" y=\"6\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"11\" y=\"7\" width=\"3\" height=\"1\" fill=\"#ef4444\"/><rect x=\"14\" y=\"7\" width=\"6\" height=\"1\" fill=\"#f97316\"/><rect x=\"20\" y=\"7\" width=\"1\" height=\"1\" fill=\"#facc15\"/><rect x=\"21\" y=\"7\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"9\" y=\"8\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"10\" y=\"8\" width=\"4\" height=\"1\" fill=\"#ef4444\"/><rect x=\"14\" y=\"8\" width=\"6\" height=\"1\" fill=\"#f97316\"/><rect x=\"20\" y=\"8\" width=\"2\" height=\"1\" fill=\"#facc15\"/><rect x=\"22\" y=\"8\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"8\" y=\"9\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"9\" y=\"9\" width=\"5\" height=\"1\" fill=\"#ef4444\"/><rect x=\"14\" y=\"9\" width=\"6\" height=\"1\" fill=\"#f97316\"/><rect x=\"20\" y=\"9\" width=\"2\" height=\"1\" fill=\"#facc15\"/><rect x=\"22\" y=\"9\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"8\" y=\"10\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"9\" y=\"10\" width=\"5\" height=\"1\" fill=\"#ef4444\"/><rect x=\"14\" y=\"10\" width=\"6\" height=\"1\" fill=\"#f97316\"/><rect x=\"20\" y=\"10\" width=\"3\" height=\"1\" fill=\"#facc15\"/><rect x=\"23\" y=\"10\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"7\" y=\"11\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"8\" y=\"11\" width=\"6\" height=\"1\" fill=\"#ef4444\"/><rect x=\"14\" y=\"11\" width=\"6\" height=\"1\" fill=\"#f97316\"/><rect x=\"20\" y=\"11\" width=\"3\" height=\"1\" fill=\"#facc15\"/><rect x=\"23\" y=\"11\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"7\" y=\"12\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"8\" y=\"12\" width=\"6\" height=\"1\" fill=\"#ef4444\"/><rect x=\"14\" y=\"12\" width=\"6\" height=\"1\" fill=\"#f97316\"/><rect x=\"20\" y=\"12\" width=\"3\" height=\"1\" fill=\"#facc15\"/><rect x=\"23\" y=\"12\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"7\" y=\"13\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"8\" y=\"13\" width=\"6\" height=\"1\" fill=\"#ef4444\"/><rect x=\"14\" y=\"13\" width=\"7\" height=\"1\" fill=\"#f97316\"/><rect x=\"21\" y=\"13\" width=\"3\" height=\"1\" fill=\"#facc15\"/><rect x=\"24\" y=\"13\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"7\" y=\"14\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"8\" y=\"14\" width=\"6\" height=\"1\" fill=\"#ef4444\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"1\" fill=\"#f97316\"/><rect x=\"21\" y=\"14\" width=\"3\" height=\"1\" fill=\"#facc15\"/><rect x=\"24\" y=\"14\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"7\" y=\"15\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"8\" y=\"15\" width=\"5\" height=\"1\" fill=\"#ef4444\"/><rect x=\"13\" y=\"15\" width=\"7\" height=\"1\" fill=\"#f97316\"/><rect x=\"20\" y=\"15\" width=\"4\" height=\"1\" fill=\"#facc15\"/><rect x=\"24\" y=\"15\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"7\" y=\"16\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"8\" y=\"16\" width=\"5\" height=\"1\" fill=\"#ef4444\"/><rect x=\"13\" y=\"16\" width=\"7\" height=\"1\" fill=\"#f97316\"/><rect x=\"20\" y=\"16\" width=\"4\" height=\"1\" fill=\"#facc15\"/><rect x=\"24\" y=\"16\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"7\" y=\"17\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"8\" y=\"17\" width=\"4\" height=\"1\" fill=\"#ef4444\"/><rect x=\"12\" y=\"17\" width=\"8\" height=\"1\" fill=\"#f97316\"/><rect x=\"20\" y=\"17\" width=\"4\" height=\"1\" fill=\"#facc15\"/><rect x=\"24\" y=\"17\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"8\" y=\"18\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"9\" y=\"18\" width=\"3\" height=\"1\" fill=\"#ef4444\"/><rect x=\"12\" y=\"18\" width=\"8\" height=\"1\" fill=\"#f97316\"/><rect x=\"20\" y=\"18\" width=\"4\" height=\"1\" fill=\"#facc15\"/><rect x=\"24\" y=\"18\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"8\" y=\"19\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"9\" y=\"19\" width=\"2\" height=\"1\" fill=\"#ef4444\"/><rect x=\"11\" y=\"19\" width=\"8\" height=\"1\" fill=\"#f97316\"/><rect x=\"19\" y=\"19\" width=\"5\" height=\"1\" fill=\"#facc15\"/><rect x=\"24\" y=\"19\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"8\" y=\"20\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"9\" y=\"20\" width=\"1\" height=\"1\" fill=\"#ef4444\"/><rect x=\"10\" y=\"20\" width=\"8\" height=\"1\" fill=\"#f97316\"/><rect x=\"18\" y=\"20\" width=\"6\" height=\"1\" fill=\"#facc15\"/><rect x=\"24\" y=\"20\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"9\" y=\"21\" width=\"1\" height=\"1\" fill=\"#b91c1c\"/><rect x=\"10\" y=\"21\" width=\"1\" height=\"1\" fill=\"#ef4444\"/><rect x=\"10\" y=\"21\" width=\"8\" height=\"1\" fill=\"#f97316\"/><rect x=\"18\" y=\"21\" width=\"6\" height=\"1\" fill=\"#facc15\"/><rect x=\"24\" y=\"21\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"9\" y=\"22\" width=\"7\" height=\"1\" fill=\"#f97316\"/><rect x=\"16\" y=\"22\" width=\"7\" height=\"1\" fill=\"#facc15\"/><rect x=\"23\" y=\"22\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"10\" y=\"23\" width=\"6\" height=\"1\" fill=\"#f97316\"/><rect x=\"16\" y=\"23\" width=\"7\" height=\"1\" fill=\"#facc15\"/><rect x=\"23\" y=\"23\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"11\" y=\"24\" width=\"5\" height=\"1\" fill=\"#f97316\"/><rect x=\"16\" y=\"24\" width=\"6\" height=\"1\" fill=\"#facc15\"/><rect x=\"22\" y=\"24\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"12\" y=\"25\" width=\"4\" height=\"1\" fill=\"#f97316\"/><rect x=\"16\" y=\"25\" width=\"5\" height=\"1\" fill=\"#facc15\"/><rect x=\"21\" y=\"25\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"13\" y=\"26\" width=\"3\" height=\"1\" fill=\"#f97316\"/><rect x=\"16\" y=\"26\" width=\"4\" height=\"1\" fill=\"#facc15\"/><rect x=\"20\" y=\"26\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"14\" y=\"27\" width=\"2\" height=\"1\" fill=\"#f97316\"/><rect x=\"16\" y=\"27\" width=\"3\" height=\"1\" fill=\"#facc15\"/><rect x=\"19\" y=\"27\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"15\" y=\"28\" width=\"1\" height=\"1\" fill=\"#f97316\"/><rect x=\"16\" y=\"28\" width=\"2\" height=\"1\" fill=\"#facc15\"/><rect x=\"18\" y=\"28\" width=\"1\" height=\"1\" fill=\"#eab308\"/><rect x=\"10\" y=\"9\" width=\"3\" height=\"2\" fill=\"#fca5a5\"/><rect x=\"11\" y=\"10\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"15\" y=\"11\" width=\"3\" height=\"3\" fill=\"#fde047\"/><rect x=\"16\" y=\"12\" width=\"2\" height=\"2\" fill=\"#fef08a\"/>"
  },
  "misutgaru": {
    "key": "misutgaru",
    "name": "미숫가루",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"4\" y=\"25\" width=\"24\" height=\"2\" fill=\"#78350f\"/><rect x=\"5\" y=\"24\" width=\"22\" height=\"1\" fill=\"#92400e\"/><rect x=\"6\" y=\"27\" width=\"20\" height=\"2\" fill=\"#451a03\"/><rect x=\"9\" y=\"29\" width=\"14\" height=\"1\" fill=\"#291002\"/><rect x=\"15\" y=\"9\" width=\"1\" height=\"1\" fill=\"#fde68a\"/><rect x=\"16\" y=\"9\" width=\"1\" height=\"1\" fill=\"#d97706\"/><rect x=\"17\" y=\"9\" width=\"0\" height=\"1\" fill=\"#b45309\"/><rect x=\"14\" y=\"10\" width=\"1\" height=\"1\" fill=\"#fde68a\"/><rect x=\"15\" y=\"10\" width=\"1\" height=\"1\" fill=\"#d97706\"/><rect x=\"16\" y=\"10\" width=\"2\" height=\"1\" fill=\"#b45309\"/><rect x=\"13\" y=\"11\" width=\"2\" height=\"1\" fill=\"#fde68a\"/><rect x=\"15\" y=\"11\" width=\"2\" height=\"1\" fill=\"#d97706\"/><rect x=\"17\" y=\"11\" width=\"2\" height=\"1\" fill=\"#b45309\"/><rect x=\"12\" y=\"12\" width=\"2\" height=\"1\" fill=\"#fde68a\"/><rect x=\"14\" y=\"12\" width=\"3\" height=\"1\" fill=\"#d97706\"/><rect x=\"17\" y=\"12\" width=\"3\" height=\"1\" fill=\"#b45309\"/><rect x=\"11\" y=\"13\" width=\"3\" height=\"1\" fill=\"#fde68a\"/><rect x=\"14\" y=\"13\" width=\"4\" height=\"1\" fill=\"#d97706\"/><rect x=\"18\" y=\"13\" width=\"3\" height=\"1\" fill=\"#b45309\"/><rect x=\"10\" y=\"14\" width=\"4\" height=\"1\" fill=\"#fde68a\"/><rect x=\"14\" y=\"14\" width=\"4\" height=\"1\" fill=\"#d97706\"/><rect x=\"18\" y=\"14\" width=\"4\" height=\"1\" fill=\"#b45309\"/><rect x=\"9\" y=\"15\" width=\"4\" height=\"1\" fill=\"#fde68a\"/><rect x=\"13\" y=\"15\" width=\"5\" height=\"1\" fill=\"#d97706\"/><rect x=\"18\" y=\"15\" width=\"5\" height=\"1\" fill=\"#b45309\"/><rect x=\"8\" y=\"16\" width=\"5\" height=\"1\" fill=\"#fde68a\"/><rect x=\"13\" y=\"16\" width=\"6\" height=\"1\" fill=\"#d97706\"/><rect x=\"19\" y=\"16\" width=\"5\" height=\"1\" fill=\"#b45309\"/><rect x=\"7\" y=\"17\" width=\"6\" height=\"1\" fill=\"#fde68a\"/><rect x=\"13\" y=\"17\" width=\"7\" height=\"1\" fill=\"#d97706\"/><rect x=\"20\" y=\"17\" width=\"5\" height=\"1\" fill=\"#b45309\"/><rect x=\"6\" y=\"18\" width=\"7\" height=\"1\" fill=\"#fde68a\"/><rect x=\"13\" y=\"18\" width=\"8\" height=\"1\" fill=\"#d97706\"/><rect x=\"21\" y=\"18\" width=\"5\" height=\"1\" fill=\"#b45309\"/><rect x=\"5\" y=\"19\" width=\"7\" height=\"1\" fill=\"#fde68a\"/><rect x=\"12\" y=\"19\" width=\"8\" height=\"1\" fill=\"#d97706\"/><rect x=\"20\" y=\"19\" width=\"7\" height=\"1\" fill=\"#b45309\"/><rect x=\"5\" y=\"20\" width=\"7\" height=\"1\" fill=\"#fde68a\"/><rect x=\"12\" y=\"20\" width=\"8\" height=\"1\" fill=\"#d97706\"/><rect x=\"20\" y=\"20\" width=\"7\" height=\"1\" fill=\"#b45309\"/><rect x=\"5\" y=\"21\" width=\"7\" height=\"1\" fill=\"#fde68a\"/><rect x=\"12\" y=\"21\" width=\"8\" height=\"1\" fill=\"#d97706\"/><rect x=\"20\" y=\"21\" width=\"7\" height=\"1\" fill=\"#b45309\"/><rect x=\"5\" y=\"22\" width=\"7\" height=\"1\" fill=\"#fde68a\"/><rect x=\"12\" y=\"22\" width=\"8\" height=\"1\" fill=\"#d97706\"/><rect x=\"20\" y=\"22\" width=\"7\" height=\"1\" fill=\"#b45309\"/><rect x=\"5\" y=\"23\" width=\"7\" height=\"1\" fill=\"#fde68a\"/><rect x=\"12\" y=\"23\" width=\"8\" height=\"1\" fill=\"#d97706\"/><rect x=\"20\" y=\"23\" width=\"7\" height=\"1\" fill=\"#b45309\"/><rect x=\"5\" y=\"24\" width=\"7\" height=\"1\" fill=\"#fde68a\"/><rect x=\"12\" y=\"24\" width=\"8\" height=\"1\" fill=\"#d97706\"/><rect x=\"20\" y=\"24\" width=\"7\" height=\"1\" fill=\"#b45309\"/><rect x=\"15\" y=\"11\" width=\"1\" height=\"1\" fill=\"#fef3c7\"/><rect x=\"13\" y=\"13\" width=\"1\" height=\"1\" fill=\"#fef3c7\"/><rect x=\"16\" y=\"14\" width=\"1\" height=\"1\" fill=\"#fde68a\"/><rect x=\"12\" y=\"16\" width=\"2\" height=\"1\" fill=\"#fef3c7\"/><rect x=\"17\" y=\"16\" width=\"1\" height=\"1\" fill=\"#92400e\"/><rect x=\"11\" y=\"18\" width=\"1\" height=\"1\" fill=\"#fef3c7\"/><rect x=\"15\" y=\"19\" width=\"2\" height=\"1\" fill=\"#b45309\"/><rect x=\"9\" y=\"20\" width=\"2\" height=\"1\" fill=\"#fef3c7\"/><rect x=\"18\" y=\"20\" width=\"1\" height=\"1\" fill=\"#92400e\"/><rect x=\"13\" y=\"22\" width=\"2\" height=\"1\" fill=\"#fde68a\"/><rect x=\"20\" y=\"22\" width=\"1\" height=\"1\" fill=\"#78350f\"/><rect x=\"12\" y=\"7\" width=\"1\" height=\"1\" fill=\"#fde68a\"/><rect x=\"19\" y=\"8\" width=\"1\" height=\"1\" fill=\"#d97706\"/><rect x=\"8\" y=\"12\" width=\"1\" height=\"1\" fill=\"#fde68a\"/><rect x=\"23\" y=\"13\" width=\"1\" height=\"1\" fill=\"#b45309\"/><rect x=\"5\" y=\"16\" width=\"1\" height=\"1\" fill=\"#fde68a\"/><rect x=\"26\" y=\"17\" width=\"1\" height=\"1\" fill=\"#d97706\"/><rect x=\"3\" y=\"21\" width=\"1\" height=\"1\" fill=\"#fde68a\"/><rect x=\"28\" y=\"22\" width=\"1\" height=\"1\" fill=\"#b45309\"/>"
  },
  "honey": {
    "key": "honey",
    "name": "꿀",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"4\" y=\"0\" width=\"1\" height=\"1\" fill=\"#deb887\"/><rect x=\"5\" y=\"0\" width=\"3\" height=\"1\" fill=\"#2e1202\"/><rect x=\"5\" y=\"1\" width=\"1\" height=\"1\" fill=\"#deb887\"/><rect x=\"6\" y=\"1\" width=\"2\" height=\"1\" fill=\"#d97434\"/><rect x=\"8\" y=\"1\" width=\"1\" height=\"1\" fill=\"#8c4315\"/><rect x=\"9\" y=\"1\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"6\" y=\"2\" width=\"1\" height=\"1\" fill=\"#deb887\"/><rect x=\"7\" y=\"2\" width=\"2\" height=\"1\" fill=\"#d97434\"/><rect x=\"9\" y=\"2\" width=\"1\" height=\"1\" fill=\"#8c4315\"/><rect x=\"10\" y=\"2\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"22\" y=\"2\" width=\"1\" height=\"1\" fill=\"#18181b\"/><rect x=\"26\" y=\"2\" width=\"1\" height=\"1\" fill=\"#18181b\"/><rect x=\"7\" y=\"3\" width=\"1\" height=\"1\" fill=\"#deb887\"/><rect x=\"8\" y=\"3\" width=\"2\" height=\"1\" fill=\"#d97434\"/><rect x=\"10\" y=\"3\" width=\"1\" height=\"1\" fill=\"#8c4315\"/><rect x=\"11\" y=\"3\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"23\" y=\"3\" width=\"1\" height=\"1\" fill=\"#18181b\"/><rect x=\"25\" y=\"3\" width=\"1\" height=\"1\" fill=\"#18181b\"/><rect x=\"8\" y=\"4\" width=\"1\" height=\"1\" fill=\"#deb887\"/><rect x=\"9\" y=\"4\" width=\"2\" height=\"1\" fill=\"#d97434\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"1\" fill=\"#8c4315\"/><rect x=\"12\" y=\"4\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"22\" y=\"4\" width=\"1\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"23\" y=\"4\" width=\"1\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"24\" y=\"4\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"25\" y=\"4\" width=\"1\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"26\" y=\"4\" width=\"1\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"9\" y=\"5\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"10\" y=\"5\" width=\"2\" height=\"1\" fill=\"#8c4315\"/><rect x=\"12\" y=\"5\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"21\" y=\"5\" width=\"1\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"22\" y=\"5\" width=\"1\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"23\" y=\"5\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"25\" y=\"5\" width=\"2\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"27\" y=\"5\" width=\"1\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"28\" y=\"5\" width=\"2\" height=\"1\" fill=\"#18181b\"/><rect x=\"10\" y=\"6\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"11\" y=\"6\" width=\"2\" height=\"1\" fill=\"#5c2807\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"20\" y=\"6\" width=\"1\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"21\" y=\"6\" width=\"1\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"22\" y=\"6\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"25\" y=\"6\" width=\"2\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"27\" y=\"6\" width=\"1\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"28\" y=\"6\" width=\"1\" height=\"1\" fill=\"#18181b\"/><rect x=\"29\" y=\"6\" width=\"1\" height=\"1\" fill=\"#facc15\"/><rect x=\"30\" y=\"6\" width=\"1\" height=\"1\" fill=\"#fef08a\"/><rect x=\"31\" y=\"6\" width=\"1\" height=\"1\" fill=\"#facc15\"/><rect x=\"11\" y=\"7\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"12\" y=\"7\" width=\"1\" height=\"1\" fill=\"#5c2807\"/><rect x=\"13\" y=\"7\" width=\"1\" height=\"1\" fill=\"#d97434\"/><rect x=\"14\" y=\"7\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"15\" y=\"7\" width=\"1\" height=\"1\" fill=\"#5c2807\"/><rect x=\"21\" y=\"7\" width=\"1\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"22\" y=\"7\" width=\"1\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"23\" y=\"7\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"25\" y=\"7\" width=\"1\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"26\" y=\"7\" width=\"1\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"28\" y=\"7\" width=\"1\" height=\"1\" fill=\"#18181b\"/><rect x=\"29\" y=\"7\" width=\"1\" height=\"1\" fill=\"#facc15\"/><rect x=\"30\" y=\"7\" width=\"1\" height=\"1\" fill=\"#fef08a\"/><rect x=\"31\" y=\"7\" width=\"1\" height=\"1\" fill=\"#facc15\"/><rect x=\"12\" y=\"8\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"13\" y=\"8\" width=\"1\" height=\"1\" fill=\"#b45309\"/><rect x=\"14\" y=\"8\" width=\"1\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"15\" y=\"8\" width=\"1\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"16\" y=\"8\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"22\" y=\"8\" width=\"1\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"23\" y=\"8\" width=\"2\" height=\"1\" fill=\"#bae6fd\"/><rect x=\"25\" y=\"8\" width=\"1\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"29\" y=\"8\" width=\"2\" height=\"1\" fill=\"#18181b\"/><rect x=\"31\" y=\"8\" width=\"1\" height=\"1\" fill=\"#000000\"/><rect x=\"13\" y=\"9\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"14\" y=\"9\" width=\"1\" height=\"1\" fill=\"#b45309\"/><rect x=\"15\" y=\"9\" width=\"1\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"16\" y=\"9\" width=\"1\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"17\" y=\"9\" width=\"1\" height=\"1\" fill=\"#2e1202\"/><rect x=\"23\" y=\"9\" width=\"2\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"28\" y=\"9\" width=\"1\" height=\"1\" fill=\"#18181b\"/><rect x=\"31\" y=\"9\" width=\"1\" height=\"1\" fill=\"#18181b\"/><rect x=\"6\" y=\"10\" width=\"13\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"5\" y=\"11\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"6\" y=\"11\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"7\" y=\"11\" width=\"11\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"18\" y=\"11\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"20\" y=\"11\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"4\" y=\"12\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"5\" y=\"12\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"6\" y=\"12\" width=\"1\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"7\" y=\"12\" width=\"1\" height=\"1\" fill=\"#ba5018\"/><rect x=\"8\" y=\"12\" width=\"9\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"17\" y=\"12\" width=\"1\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"18\" y=\"12\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"20\" y=\"12\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"3\" y=\"13\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"4\" y=\"13\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"5\" y=\"13\" width=\"1\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"6\" y=\"13\" width=\"2\" height=\"1\" fill=\"#ba5018\"/><rect x=\"8\" y=\"13\" width=\"10\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"18\" y=\"13\" width=\"1\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"19\" y=\"13\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"20\" y=\"13\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"2\" y=\"14\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"3\" y=\"14\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"4\" y=\"14\" width=\"1\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"5\" y=\"14\" width=\"1\" height=\"1\" fill=\"#ba5018\"/><rect x=\"6\" y=\"14\" width=\"1\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"7\" y=\"14\" width=\"1\" height=\"1\" fill=\"#ba5018\"/><rect x=\"8\" y=\"14\" width=\"3\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"11\" y=\"14\" width=\"1\" height=\"1\" fill=\"#fde047\"/><rect x=\"12\" y=\"14\" width=\"6\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"18\" y=\"14\" width=\"2\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"20\" y=\"14\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"21\" y=\"14\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"22\" y=\"14\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"1\" y=\"15\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"2\" y=\"15\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"3\" y=\"15\" width=\"1\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"4\" y=\"15\" width=\"2\" height=\"1\" fill=\"#ba5018\"/><rect x=\"6\" y=\"15\" width=\"2\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"8\" y=\"15\" width=\"3\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"11\" y=\"15\" width=\"1\" height=\"1\" fill=\"#fde047\"/><rect x=\"12\" y=\"15\" width=\"6\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"18\" y=\"15\" width=\"4\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"22\" y=\"15\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"23\" y=\"15\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"24\" y=\"15\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"1\" y=\"16\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"2\" y=\"16\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"3\" y=\"16\" width=\"2\" height=\"1\" fill=\"#ba5018\"/><rect x=\"5\" y=\"16\" width=\"1\" height=\"1\" fill=\"#d97434\"/><rect x=\"6\" y=\"16\" width=\"2\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"8\" y=\"16\" width=\"2\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"10\" y=\"16\" width=\"1\" height=\"1\" fill=\"#fde047\"/><rect x=\"11\" y=\"16\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"12\" y=\"16\" width=\"6\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"18\" y=\"16\" width=\"5\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"23\" y=\"16\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"24\" y=\"16\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"25\" y=\"16\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"1\" y=\"17\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"2\" y=\"17\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"3\" y=\"17\" width=\"1\" height=\"1\" fill=\"#ba5018\"/><rect x=\"4\" y=\"17\" width=\"1\" height=\"1\" fill=\"#d97434\"/><rect x=\"5\" y=\"17\" width=\"3\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"8\" y=\"17\" width=\"2\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"10\" y=\"17\" width=\"1\" height=\"1\" fill=\"#fde047\"/><rect x=\"11\" y=\"17\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"12\" y=\"17\" width=\"6\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"18\" y=\"17\" width=\"6\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"24\" y=\"17\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"25\" y=\"17\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"26\" y=\"17\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"1\" y=\"18\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"2\" y=\"18\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"3\" y=\"18\" width=\"1\" height=\"1\" fill=\"#ba5018\"/><rect x=\"4\" y=\"18\" width=\"1\" height=\"1\" fill=\"#d97434\"/><rect x=\"5\" y=\"18\" width=\"3\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"8\" y=\"18\" width=\"1\" height=\"1\" fill=\"#b45309\"/><rect x=\"9\" y=\"18\" width=\"1\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"10\" y=\"18\" width=\"1\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"11\" y=\"18\" width=\"1\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"12\" y=\"18\" width=\"1\" height=\"1\" fill=\"#fde047\"/><rect x=\"13\" y=\"18\" width=\"1\" height=\"1\" fill=\"#fef08a\"/><rect x=\"14\" y=\"18\" width=\"3\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"17\" y=\"18\" width=\"1\" height=\"1\" fill=\"#b45309\"/><rect x=\"18\" y=\"18\" width=\"6\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"24\" y=\"18\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"25\" y=\"18\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"26\" y=\"18\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"1\" y=\"19\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"2\" y=\"19\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"3\" y=\"19\" width=\"1\" height=\"1\" fill=\"#ba5018\"/><rect x=\"4\" y=\"19\" width=\"1\" height=\"1\" fill=\"#d97434\"/><rect x=\"5\" y=\"19\" width=\"2\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"7\" y=\"19\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"8\" y=\"19\" width=\"1\" height=\"1\" fill=\"#853205\"/><rect x=\"9\" y=\"19\" width=\"1\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"10\" y=\"19\" width=\"1\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"11\" y=\"19\" width=\"1\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"12\" y=\"19\" width=\"2\" height=\"1\" fill=\"#ffffff\"/><rect x=\"14\" y=\"19\" width=\"4\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"18\" y=\"19\" width=\"1\" height=\"1\" fill=\"#853205\"/><rect x=\"19\" y=\"19\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"20\" y=\"19\" width=\"4\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"24\" y=\"19\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"25\" y=\"19\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"26\" y=\"19\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"1\" y=\"20\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"2\" y=\"20\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"3\" y=\"20\" width=\"1\" height=\"1\" fill=\"#ba5018\"/><rect x=\"4\" y=\"20\" width=\"1\" height=\"1\" fill=\"#d97434\"/><rect x=\"5\" y=\"20\" width=\"2\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"7\" y=\"20\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"8\" y=\"20\" width=\"1\" height=\"1\" fill=\"#853205\"/><rect x=\"9\" y=\"20\" width=\"1\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"10\" y=\"20\" width=\"1\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"11\" y=\"20\" width=\"7\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"18\" y=\"20\" width=\"1\" height=\"1\" fill=\"#853205\"/><rect x=\"19\" y=\"20\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"20\" y=\"20\" width=\"4\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"24\" y=\"20\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"25\" y=\"20\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"26\" y=\"20\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"1\" y=\"21\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"2\" y=\"21\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"3\" y=\"21\" width=\"2\" height=\"1\" fill=\"#ba5018\"/><rect x=\"5\" y=\"21\" width=\"1\" height=\"1\" fill=\"#d97434\"/><rect x=\"6\" y=\"21\" width=\"1\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"7\" y=\"21\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"8\" y=\"21\" width=\"1\" height=\"1\" fill=\"#853205\"/><rect x=\"9\" y=\"21\" width=\"1\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"10\" y=\"21\" width=\"1\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"11\" y=\"21\" width=\"5\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"16\" y=\"21\" width=\"1\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"17\" y=\"21\" width=\"1\" height=\"1\" fill=\"#853205\"/><rect x=\"18\" y=\"21\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"20\" y=\"21\" width=\"3\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"23\" y=\"21\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"24\" y=\"21\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"25\" y=\"21\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"1\" y=\"22\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"2\" y=\"22\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"3\" y=\"22\" width=\"1\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"4\" y=\"22\" width=\"2\" height=\"1\" fill=\"#ba5018\"/><rect x=\"6\" y=\"22\" width=\"1\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"8\" y=\"22\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"9\" y=\"22\" width=\"1\" height=\"1\" fill=\"#853205\"/><rect x=\"10\" y=\"22\" width=\"1\" height=\"1\" fill=\"#fbbf24\"/><rect x=\"11\" y=\"22\" width=\"4\" height=\"1\" fill=\"#f59e0b\"/><rect x=\"15\" y=\"22\" width=\"1\" height=\"1\" fill=\"#853205\"/><rect x=\"16\" y=\"22\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"20\" y=\"22\" width=\"4\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"24\" y=\"22\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"25\" y=\"22\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"26\" y=\"22\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"1\" y=\"23\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"2\" y=\"23\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"3\" y=\"23\" width=\"2\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"5\" y=\"23\" width=\"1\" height=\"1\" fill=\"#ba5018\"/><rect x=\"6\" y=\"23\" width=\"1\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"10\" y=\"23\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"11\" y=\"23\" width=\"3\" height=\"1\" fill=\"#853205\"/><rect x=\"14\" y=\"23\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"19\" y=\"23\" width=\"4\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"23\" y=\"23\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"24\" y=\"23\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"25\" y=\"23\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"2\" y=\"24\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"3\" y=\"24\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"4\" y=\"24\" width=\"2\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"6\" y=\"24\" width=\"1\" height=\"1\" fill=\"#ba5018\"/><rect x=\"7\" y=\"24\" width=\"1\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"18\" y=\"24\" width=\"4\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"22\" y=\"24\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"23\" y=\"24\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"24\" y=\"24\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"3\" y=\"25\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"4\" y=\"25\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"5\" y=\"25\" width=\"2\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"7\" y=\"25\" width=\"12\" height=\"1\" fill=\"#9c3d10\"/><rect x=\"19\" y=\"25\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"20\" y=\"25\" width=\"3\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"23\" y=\"25\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"24\" y=\"25\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"25\" y=\"25\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"4\" y=\"26\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"5\" y=\"26\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"6\" y=\"26\" width=\"1\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"7\" y=\"26\" width=\"12\" height=\"1\" fill=\"#381303\"/><rect x=\"19\" y=\"26\" width=\"2\" height=\"1\" fill=\"#7a2e0b\"/><rect x=\"21\" y=\"26\" width=\"1\" height=\"1\" fill=\"#381303\"/><rect x=\"22\" y=\"26\" width=\"1\" height=\"1\" fill=\"#521d05\"/><rect x=\"23\" y=\"26\" width=\"1\" height=\"1\" fill=\"#1c0a00\"/><rect x=\"5\" y=\"27\" width=\"17\" height=\"1\" fill=\"#1c0a00\"/>"
  },
  "bokbunjaju": {
    "key": "bokbunjaju",
    "name": "복분자주",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"12\" y=\"2\" width=\"8\" height=\"2\" fill=\"#701a75\"/><rect x=\"13\" y=\"1\" width=\"6\" height=\"1\" fill=\"#facc15\"/><rect x=\"12\" y=\"4\" width=\"8\" height=\"1\" fill=\"#4a044e\"/><rect x=\"14\" y=\"5\" width=\"4\" height=\"6\" fill=\"#701a75\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"5\" fill=\"#4a044e\"/><rect x=\"18\" y=\"6\" width=\"1\" height=\"5\" fill=\"#3b0764\"/><rect x=\"14\" y=\"5\" width=\"1\" height=\"6\" fill=\"#a21caf\"/><rect x=\"15\" y=\"5\" width=\"2\" height=\"6\" fill=\"#86198f\"/><rect x=\"11\" y=\"11\" width=\"10\" height=\"2\" fill=\"#701a75\"/><rect x=\"9\" y=\"13\" width=\"14\" height=\"15\" fill=\"#581c87\"/><rect x=\"8\" y=\"14\" width=\"1\" height=\"13\" fill=\"#3b0764\"/><rect x=\"23\" y=\"14\" width=\"1\" height=\"13\" fill=\"#2e1065\"/><rect x=\"9\" y=\"14\" width=\"2\" height=\"13\" fill=\"#a855f7\"/><rect x=\"11\" y=\"14\" width=\"10\" height=\"13\" fill=\"#6b21a8\"/><rect x=\"21\" y=\"14\" width=\"2\" height=\"13\" fill=\"#3b0764\"/><rect x=\"11\" y=\"16\" width=\"10\" height=\"9\" fill=\"#fef08a\"/><rect x=\"11\" y=\"16\" width=\"10\" height=\"1\" fill=\"#ffffff\"/><rect x=\"11\" y=\"24\" width=\"10\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"14\" y=\"18\" width=\"4\" height=\"4\" fill=\"#991b1b\"/><circle cx=\"16\" cy=\"20\" r=\"1.5\" fill=\"#dc2626\"/><rect x=\"15\" y=\"17\" width=\"2\" height=\"1\" fill=\"#15803d\"/><rect x=\"9\" y=\"28\" width=\"14\" height=\"1\" fill=\"#3b0764\"/><rect x=\"10\" y=\"29\" width=\"12\" height=\"1\" fill=\"#1e1b4b\"/>"
  },
  "makgeolli": {
    "key": "makgeolli",
    "name": "막걸리",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"12\" y=\"1\" width=\"8\" height=\"3\" fill=\"#15803d\"/><rect x=\"13\" y=\"1\" width=\"6\" height=\"1\" fill=\"#4ade80\"/><rect x=\"12\" y=\"4\" width=\"8\" height=\"1\" fill=\"#166534\"/><rect x=\"13\" y=\"5\" width=\"6\" height=\"5\" fill=\"#f1f5f9\"/><rect x=\"13\" y=\"5\" width=\"1\" height=\"5\" fill=\"#ffffff\"/><rect x=\"18\" y=\"5\" width=\"1\" height=\"5\" fill=\"#cbd5e1\"/><rect x=\"11\" y=\"10\" width=\"10\" height=\"2\" fill=\"#f8fafc\"/><rect x=\"10\" y=\"11\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"21\" y=\"11\" width=\"1\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"9\" y=\"12\" width=\"14\" height=\"16\" fill=\"#f8fafc\"/><rect x=\"8\" y=\"13\" width=\"1\" height=\"14\" fill=\"#e2e8f0\"/><rect x=\"23\" y=\"13\" width=\"1\" height=\"14\" fill=\"#94a3b8\"/><rect x=\"9\" y=\"13\" width=\"2\" height=\"14\" fill=\"#ffffff\"/><rect x=\"21\" y=\"13\" width=\"2\" height=\"14\" fill=\"#cbd5e1\"/><rect x=\"10\" y=\"16\" width=\"12\" height=\"9\" fill=\"#16a34a\"/><rect x=\"10\" y=\"16\" width=\"12\" height=\"1\" fill=\"#22c55e\"/><rect x=\"10\" y=\"24\" width=\"12\" height=\"1\" fill=\"#14532d\"/><rect x=\"13\" y=\"18\" width=\"6\" height=\"5\" fill=\"#fef08a\"/><rect x=\"14\" y=\"19\" width=\"4\" height=\"3\" fill=\"#14532d\"/><rect x=\"15\" y=\"20\" width=\"2\" height=\"1\" fill=\"#facc15\"/><rect x=\"9\" y=\"28\" width=\"14\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"10\" y=\"29\" width=\"12\" height=\"1\" fill=\"#94a3b8\"/>"
  },
  "water": {
    "key": "water",
    "name": "물",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 16,2 C 16,2 8,14 8,20 C 8,25 11.5,29 16,29 C 20.5,29 24,25 24,20 C 24,14 16,2 16,2 Z\" fill=\"#0284c7\"/><path d=\"M 16,4 C 16,4 10,15 10,20 C 10,24 12.5,27 16,27 C 19.5,27 22,24 22,20 C 22,15 16,4 16,4 Z\" fill=\"#0ea5e9\"/><path d=\"M 16,6 C 16,6 12,15 12,19 C 12,22 13.5,24 16,24 Z\" fill=\"#38bdf8\"/><ellipse cx=\"14\" cy=\"16\" rx=\"2\" ry=\"4\" fill=\"#ffffff\" opacity=\"0.85\"/><circle cx=\"13\" cy=\"22\" r=\"1.5\" fill=\"#ffffff\" opacity=\"0.9\"/><circle cx=\"19\" cy=\"23\" r=\"1\" fill=\"#bae6fd\" opacity=\"0.8\"/>"
  },
  "fire": {
    "key": "fire",
    "name": "불",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 16,2 C 18,5 20,8 19,11 C 21,8 24,9 25,12 C 27,15 28,19 27,23 C 26,27 21,30 16,30 C 10,30 5,27 4,22 C 3,18 5,14 7,12 C 8,15 10,16 9,13 C 7,10 10,6 12,4 C 13,7 14,8 14.5,7 C 15,5 15,3 16,2 Z\" fill=\"#dc2626\"/><path d=\"M 16,5 C 17.5,7.5 19,10 18,12.5 C 20,10.5 22.5,11 23.5,14 C 25,17 25.5,20 24.5,23.5 C 23.5,26.5 19.5,28.5 16,28.5 C 11.5,28.5 7.5,26 6.5,22 C 5.5,18.5 7,15.5 8.5,13.5 C 9.5,15.5 11,16 10.5,14 C 9,11.5 11.5,8 13,6.5 C 13.8,8.5 14.8,9 15,8 C 15.3,6.5 15.5,5.5 16,5 Z\" fill=\"#ea580c\"/><path d=\"M 16,9 C 17.5,11.5 18,13 17,15 C 19,13.5 20.5,14.5 21,17 C 22,20 21.5,23 19.5,25 C 18,26.5 16.5,26.8 15.5,26.8 C 12.5,26.8 9.5,24.8 9,21.5 C 8.5,18.5 10,16 11.5,14.5 C 12,16 13,16.5 12.5,15 C 11.5,13 13,10.5 14.5,9.5 C 15,11 15.6,11 15.7,10.2 C 15.8,9.5 15.9,9.2 16,9 Z\" fill=\"#f97316\"/><path d=\"M 16,13 C 17,15 17.5,16.5 17,18 C 18,17 19,18 19,20 C 19,22.5 17.5,24.5 15.5,24.5 C 13.5,24.5 12,22.8 11.5,20.5 C 11,18.5 12,16.5 13.5,15 C 14,16 14.8,16.2 14.5,15 C 14,13.5 15,12.5 16,13 Z\" fill=\"#fde047\"/><path d=\"M 15.5,17 C 16.5,18.5 17,19.5 16.5,21 C 16,22.5 14.5,23 14,21.5 C 13.5,20 14.5,18.5 15.5,17 Z\" fill=\"#ffffff\" opacity=\"0.95\"/><ellipse cx=\"15.2\" cy=\"20.5\" rx=\"1.8\" ry=\"2.4\" fill=\"#ffffff\"/><circle cx=\"6\" cy=\"7\" r=\"1.2\" fill=\"#fde047\"/><circle cx=\"6\" cy=\"7\" r=\"0.6\" fill=\"#ffffff\"/><circle cx=\"26\" cy=\"8\" r=\"1.3\" fill=\"#f97316\"/><circle cx=\"26\" cy=\"8\" r=\"0.7\" fill=\"#fde047\"/><circle cx=\"21\" cy=\"4\" r=\"0.9\" fill=\"#fde047\"/>"
  },
  "snow": {
    "key": "snow",
    "name": "눈",
    "viewBox": "0 0 32 32",
    "innerSvg": "<line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"30\" stroke=\"#0284c7\" stroke-width=\"2.5\"/><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"30\" stroke=\"#ffffff\" stroke-width=\"1.5\"/><line x1=\"4\" y1=\"9\" x2=\"28\" y2=\"23\" stroke=\"#0284c7\" stroke-width=\"2.5\"/><line x1=\"4\" y1=\"9\" x2=\"28\" y2=\"23\" stroke=\"#ffffff\" stroke-width=\"1.5\"/><line x1=\"4\" y1=\"23\" x2=\"28\" y2=\"9\" stroke=\"#0284c7\" stroke-width=\"2.5\"/><line x1=\"4\" y1=\"23\" x2=\"28\" y2=\"9\" stroke=\"#ffffff\" stroke-width=\"1.5\"/><path d=\"M 16,6 L 13,9 M 16,6 L 19,9 M 16,26 L 13,23 M 16,26 L 19,23\" stroke=\"#38bdf8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><path d=\"M 8,11 L 8,14 M 8,11 L 11,11 M 24,21 L 24,18 M 24,21 L 21,21\" stroke=\"#38bdf8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><path d=\"M 8,21 L 11,21 M 8,21 L 8,18 M 24,11 L 21,11 M 24,11 L 24,14\" stroke=\"#38bdf8\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><circle cx=\"16\" cy=\"16\" r=\"3\" fill=\"#e0f2fe\"/><circle cx=\"16\" cy=\"16\" r=\"1.5\" fill=\"#ffffff\"/>"
  },
  "sparkling_water": {
    "key": "sparkling_water",
    "name": "탄산수",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"13\" y=\"1\" width=\"6\" height=\"2\" fill=\"#0284c7\"/><rect x=\"14\" y=\"1\" width=\"4\" height=\"1\" fill=\"#38bdf8\"/><rect x=\"14\" y=\"3\" width=\"4\" height=\"6\" fill=\"#38bdf8\"/><rect x=\"14\" y=\"3\" width=\"1\" height=\"6\" fill=\"#bae6fd\"/><rect x=\"11\" y=\"9\" width=\"10\" height=\"3\" fill=\"#0ea5e9\"/><rect x=\"9\" y=\"12\" width=\"14\" height=\"17\" fill=\"#0284c7\"/><rect x=\"9\" y=\"12\" width=\"2\" height=\"17\" fill=\"#bae6fd\"/><rect x=\"11\" y=\"12\" width=\"9\" height=\"17\" fill=\"#38bdf8\"/><rect x=\"20\" y=\"12\" width=\"3\" height=\"17\" fill=\"#0369a1\"/><rect x=\"11\" y=\"16\" width=\"10\" height=\"8\" fill=\"#ffffff\"/><rect x=\"12\" y=\"18\" width=\"8\" height=\"2\" fill=\"#0284c7\"/><rect x=\"14\" y=\"21\" width=\"4\" height=\"1\" fill=\"#38bdf8\"/><circle cx=\"13\" cy=\"14\" r=\"1\" fill=\"#ffffff\"/><circle cx=\"18\" cy=\"14\" r=\"0.8\" fill=\"#ffffff\"/><circle cx=\"14\" cy=\"26\" r=\"1\" fill=\"#ffffff\"/><circle cx=\"18\" cy=\"27\" r=\"0.8\" fill=\"#ffffff\"/><rect x=\"9\" y=\"29\" width=\"14\" height=\"1\" fill=\"#0369a1\"/>"
  },
  "lemon": {
    "key": "lemon",
    "name": "레몬",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 6,16 C 6,10 11,6 18,6 C 24,6 27,10 27,15 C 27,21 22,26 15,26 C 9,26 6,22 6,16 Z\" fill=\"#eab308\"/><path d=\"M 8,16 C 8,11 12,8 18,8 C 23,8 25,11 25,15 C 25,20 20,24 15,24 C 10,24 8,20 8,16 Z\" fill=\"#facc15\"/><ellipse cx=\"16\" cy=\"14\" rx=\"7\" ry=\"4\" fill=\"#fde047\"/><ellipse cx=\"14\" cy=\"12\" rx=\"4\" ry=\"2\" fill=\"#ffffff\" opacity=\"0.6\"/><path d=\"M 5,16 Q 3,16 4,14 Q 5,15 6,16 Z\" fill=\"#ca8a04\"/><path d=\"M 27,15 Q 29,15 28,17 Q 27,16 26,15 Z\" fill=\"#ca8a04\"/><path d=\"M 21,7 Q 25,3 27,5 Q 24,8 21,7 Z\" fill=\"#15803d\"/>"
  },
  "melon": {
    "key": "melon",
    "name": "멜론",
    "viewBox": "0 0 32 32",
    "innerSvg": "<circle cx=\"16\" cy=\"18\" r=\"11\" fill=\"#15803d\"/><circle cx=\"16\" cy=\"18\" r=\"10\" fill=\"#22c55e\"/><circle cx=\"14\" cy=\"16\" r=\"8\" fill=\"#4ade80\"/><path d=\"M 9,18 Q 16,14 23,18 M 8,15 Q 16,10 24,15 M 10,22 Q 16,19 22,22 M 16,7 Q 14,18 16,29 M 12,8 Q 10,18 12,28 M 20,8 Q 22,18 20,28\" stroke=\"#f0fdf4\" stroke-width=\"1.2\" fill=\"none\" opacity=\"0.85\"/><path d=\"M 16,7 L 16,3 M 13,3 L 19,3\" stroke=\"#92400e\" stroke-width=\"2\" stroke-linecap=\"round\"/>"
  },
  "maesil": {
    "key": "maesil",
    "name": "매실",
    "viewBox": "0 0 32 32",
    "innerSvg": "<circle cx=\"16\" cy=\"18\" r=\"10\" fill=\"#4d7c0f\"/><circle cx=\"16\" cy=\"18\" r=\"9\" fill=\"#65a30d\"/><circle cx=\"14\" cy=\"16\" r=\"7\" fill=\"#84cc16\"/><path d=\"M 16,9 Q 15,18 16,27\" stroke=\"#4d7c0f\" stroke-width=\"1.2\" fill=\"none\"/><ellipse cx=\"12\" cy=\"14\" rx=\"3\" ry=\"1.5\" fill=\"#fef08a\" opacity=\"0.6\"/><path d=\"M 16,9 Q 18,5 21,7 Q 19,9 16,9 Z\" fill=\"#15803d\"/>"
  },
  "tomato": {
    "key": "tomato",
    "name": "토마토",
    "viewBox": "0 0 32 32",
    "innerSvg": "<circle cx=\"16\" cy=\"18\" r=\"11\" fill=\"#991b1b\"/><circle cx=\"16\" cy=\"18\" r=\"10\" fill=\"#dc2626\"/><circle cx=\"14\" cy=\"16\" r=\"8\" fill=\"#ef4444\"/><ellipse cx=\"12\" cy=\"13\" rx=\"3.5\" ry=\"2\" fill=\"#fca5a5\" opacity=\"0.75\"/><polygon points=\"16,7 13,10 9,7 12,11 8,13 13,12 16,14 19,12 24,13 20,11 23,7 19,10\" fill=\"#15803d\"/><polygon points=\"16,8 14,10 11,8 13,11 10,12 13,12 16,13 18,12 21,12 19,11 21,8 18,10\" fill=\"#22c55e\"/><path d=\"M 16,8 L 16,4\" stroke=\"#15803d\" stroke-width=\"2\" stroke-linecap=\"round\"/>"
  },
  "apple": {
    "key": "apple",
    "name": "사과",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 16,11 C 13,7 7,8 7,16 C 7,24 13,28 16,26 C 19,28 25,24 25,16 C 25,8 19,7 16,11 Z\" fill=\"#991b1b\"/><path d=\"M 16,12 C 14,8 8,9 8,16 C 8,23 13,27 16,25 C 19,27 24,23 24,16 C 24,9 18,8 16,12 Z\" fill=\"#dc2626\"/><ellipse cx=\"12\" cy=\"15\" rx=\"3\" ry=\"5\" fill=\"#ef4444\"/><ellipse cx=\"11\" cy=\"14\" rx=\"1.5\" ry=\"3\" fill=\"#fca5a5\" opacity=\"0.8\"/><path d=\"M 16,11 Q 16,4 19,4\" stroke=\"#78350f\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M 17,7 Q 22,5 21,9 Q 18,9 17,7 Z\" fill=\"#16a34a\"/>"
  },
  "strawberry": {
    "key": "strawberry",
    "name": "딸기",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 16,28 C 11,28 7,20 8,14 C 9,9 13,8 16,10 C 19,8 23,9 24,14 C 25,20 21,28 16,28 Z\" fill=\"#991b1b\"/><path d=\"M 16,27 C 12,27 8.5,19 9.5,14 C 10.5,10 13.5,9.5 16,11 C 18.5,9.5 21.5,10 22.5,14 C 23.5,19 20,27 16,27 Z\" fill=\"#ef4444\"/><circle cx=\"12\" cy=\"14\" r=\"0.8\" fill=\"#fef08a\"/><circle cx=\"16\" cy=\"15\" r=\"0.8\" fill=\"#fef08a\"/><circle cx=\"20\" cy=\"14\" r=\"0.8\" fill=\"#fef08a\"/><circle cx=\"14\" cy=\"19\" r=\"0.8\" fill=\"#fef08a\"/><circle cx=\"18\" cy=\"19\" r=\"0.8\" fill=\"#fef08a\"/><circle cx=\"16\" cy=\"23\" r=\"0.8\" fill=\"#fef08a\"/><polygon points=\"16,11 12,12 8,9 11,7 16,9 21,7 24,9 20,12\" fill=\"#15803d\"/><polygon points=\"16,10 13,11 10,9 12,7.5 16,8.5 20,7.5 22,9 19,11\" fill=\"#22c55e\"/><line x1=\"16\" y1=\"9\" x2=\"16\" y2=\"4\" stroke=\"#15803d\" stroke-width=\"2\" stroke-linecap=\"round\"/>"
  },
  "cacao": {
    "key": "cacao",
    "name": "카카오",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 6,16 C 6,9 13,7 20,9 C 26,11 28,16 26,20 C 24,25 17,26 11,24 C 7,22 6,19 6,16 Z\" fill=\"#451a03\"/><path d=\"M 7,16 C 7,10 14,8 20,10 C 25,12 27,16 25,19 C 23,24 17,25 12,23 C 8,21 7,18 7,16 Z\" fill=\"#78350f\"/><path d=\"M 7,16 Q 16,12 25,18 M 8,13 Q 16,9 23,14 M 9,19 Q 17,17 24,21\" stroke=\"#92400e\" stroke-width=\"1.5\" fill=\"none\"/><ellipse cx=\"14\" cy=\"13\" rx=\"4\" ry=\"2\" fill=\"#b45309\" opacity=\"0.6\"/><path d=\"M 5,16 L 3,15\" stroke=\"#451a03\" stroke-width=\"2\" stroke-linecap=\"round\"/>"
  },
  "pear": {
    "key": "pear",
    "name": "배",
    "viewBox": "0 0 32 32",
    "innerSvg": "<circle cx=\"16\" cy=\"18\" r=\"11\" fill=\"#a16207\"/><circle cx=\"16\" cy=\"18\" r=\"10\" fill=\"#ca8a04\"/><circle cx=\"14\" cy=\"16\" r=\"8\" fill=\"#eab308\"/><ellipse cx=\"12\" cy=\"14\" rx=\"4\" ry=\"2\" fill=\"#fde047\" opacity=\"0.7\"/><circle cx=\"18\" cy=\"18\" r=\"0.6\" fill=\"#78350f\"/><circle cx=\"13\" cy=\"21\" r=\"0.6\" fill=\"#78350f\"/><circle cx=\"20\" cy=\"14\" r=\"0.6\" fill=\"#78350f\"/><path d=\"M 16,8 Q 15,3 18,3\" stroke=\"#78350f\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/>"
  },
  "banana": {
    "key": "banana",
    "name": "바나나",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 6,8 C 8,18 16,26 27,24 C 24,26 14,27 6,18 C 4,14 4,10 6,8 Z\" fill=\"#ca8a04\"/><path d=\"M 6,9 C 9,18 17,25 26,23 C 23,25 14,26 7,18 C 5,14 5,11 6,9 Z\" fill=\"#eab308\"/><path d=\"M 7,10 C 10,18 17,24 25,22 C 22,23 15,24 8,18 C 6,15 6,12 7,10 Z\" fill=\"#facc15\"/><path d=\"M 8,11 C 11,18 18,23 24,21 C 21,21 16,21 9,17 C 7,15 7,13 8,11 Z\" fill=\"#fde047\"/><path d=\"M 5,8 L 3,6\" stroke=\"#15803d\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"26\" cy=\"23\" r=\"1.5\" fill=\"#78350f\"/>"
  },
  "yuzu": {
    "key": "yuzu",
    "name": "유자",
    "viewBox": "0 0 32 32",
    "innerSvg": "<circle cx=\"16\" cy=\"18\" r=\"11\" fill=\"#b45309\"/><circle cx=\"16\" cy=\"18\" r=\"10\" fill=\"#d97706\"/><circle cx=\"14\" cy=\"16\" r=\"8\" fill=\"#f59e0b\"/><ellipse cx=\"12\" cy=\"14\" rx=\"4\" ry=\"2\" fill=\"#fde047\" opacity=\"0.8\"/><circle cx=\"10\" cy=\"18\" r=\"0.7\" fill=\"#b45309\"/><circle cx=\"17\" cy=\"20\" r=\"0.7\" fill=\"#b45309\"/><circle cx=\"19\" cy=\"14\" r=\"0.7\" fill=\"#b45309\"/><path d=\"M 16,8 Q 19,4 23,6 Q 20,9 16,8 Z\" fill=\"#15803d\"/>"
  },
  "calamansi": {
    "key": "calamansi",
    "name": "깔라만시",
    "viewBox": "0 0 32 32",
    "innerSvg": "<circle cx=\"11\" cy=\"18\" r=\"8\" fill=\"#14532d\"/><circle cx=\"11\" cy=\"18\" r=\"7\" fill=\"#16a34a\"/><circle cx=\"9\" cy=\"16\" r=\"5\" fill=\"#4ade80\"/><circle cx=\"22\" cy=\"16\" r=\"8\" fill=\"#ca8a04\"/><circle cx=\"22\" cy=\"16\" r=\"7\" fill=\"#fef08a\"/><circle cx=\"22\" cy=\"16\" r=\"6\" fill=\"#facc15\"/><path d=\"M 22,10 L 22,22 M 16,16 L 28,16 M 18,12 L 26,20 M 18,20 L 26,12\" stroke=\"#ffffff\" stroke-width=\"1\"/>"
  },
  "bokbunja": {
    "key": "bokbunja",
    "name": "복분자",
    "viewBox": "0 0 32 32",
    "innerSvg": "<circle cx=\"16\" cy=\"14\" r=\"3.5\" fill=\"#4a044e\"/><circle cx=\"16\" cy=\"14\" r=\"2.5\" fill=\"#701a75\"/><circle cx=\"15\" cy=\"13\" r=\"1\" fill=\"#f43f5e\"/><circle cx=\"11\" cy=\"16\" r=\"3.5\" fill=\"#3b0764\"/><circle cx=\"11\" cy=\"16\" r=\"2.5\" fill=\"#6b21a8\"/><circle cx=\"10\" cy=\"15\" r=\"1\" fill=\"#f43f5e\"/><circle cx=\"21\" cy=\"16\" r=\"3.5\" fill=\"#3b0764\"/><circle cx=\"21\" cy=\"16\" r=\"2.5\" fill=\"#6b21a8\"/><circle cx=\"20\" cy=\"15\" r=\"1\" fill=\"#f43f5e\"/><circle cx=\"13\" cy=\"21\" r=\"3.5\" fill=\"#1e1b4b\"/><circle cx=\"13\" cy=\"21\" r=\"2.5\" fill=\"#4a044e\"/><circle cx=\"12\" cy=\"20\" r=\"1\" fill=\"#a21caf\"/><circle cx=\"19\" cy=\"21\" r=\"3.5\" fill=\"#1e1b4b\"/><circle cx=\"19\" cy=\"21\" r=\"2.5\" fill=\"#4a044e\"/><circle cx=\"18\" cy=\"20\" r=\"1\" fill=\"#a21caf\"/><circle cx=\"16\" cy=\"25\" r=\"3\" fill=\"#1e1b4b\"/><circle cx=\"16\" cy=\"25\" r=\"2\" fill=\"#3b0764\"/><circle cx=\"15\" cy=\"24\" r=\"0.8\" fill=\"#701a75\"/><path d=\"M 16,11 L 16,6 M 14,8 L 11,6 M 18,8 L 21,6\" stroke=\"#15803d\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>"
  },
  "pomegranate": {
    "key": "pomegranate",
    "name": "석류",
    "viewBox": "0 0 32 32",
    "innerSvg": "<circle cx=\"16\" cy=\"18\" r=\"11\" fill=\"#831843\"/><circle cx=\"16\" cy=\"18\" r=\"10\" fill=\"#be123c\"/><circle cx=\"14\" cy=\"16\" r=\"8\" fill=\"#e11d48\"/><polygon points=\"16,8 14,5 15,3 16,5 17,3 18,5\" fill=\"#9f1239\"/><path d=\"M 16,15 C 13,15 11,18 11,21 C 11,24 13,26 16,26 C 19,26 21,24 21,21 C 21,18 19,15 16,15 Z\" fill=\"#fff1f2\"/><circle cx=\"14\" cy=\"19\" r=\"1.2\" fill=\"#e11d48\"/><circle cx=\"17\" cy=\"19\" r=\"1.2\" fill=\"#be123c\"/><circle cx=\"15\" cy=\"22\" r=\"1.2\" fill=\"#e11d48\"/><circle cx=\"18\" cy=\"22\" r=\"1.2\" fill=\"#9f1239\"/>"
  },
  "orange": {
    "key": "orange",
    "name": "오렌지",
    "viewBox": "0 0 32 32",
    "innerSvg": "<circle cx=\"16\" cy=\"18\" r=\"11\" fill=\"#c2410c\"/><circle cx=\"16\" cy=\"18\" r=\"10\" fill=\"#ea580c\"/><circle cx=\"14\" cy=\"16\" r=\"8\" fill=\"#f97316\"/><ellipse cx=\"12\" cy=\"14\" rx=\"4\" ry=\"2\" fill=\"#fdba74\" opacity=\"0.8\"/><circle cx=\"11\" cy=\"19\" r=\"0.6\" fill=\"#c2410c\"/><circle cx=\"18\" cy=\"20\" r=\"0.6\" fill=\"#c2410c\"/><circle cx=\"19\" cy=\"13\" r=\"0.6\" fill=\"#c2410c\"/><path d=\"M 16,8 Q 19,4 23,6 Q 20,9 16,8 Z\" fill=\"#15803d\"/>"
  },
  "barley": {
    "key": "barley",
    "name": "맥(보리)",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 16,30 L 16,12\" stroke=\"#b45309\" stroke-width=\"2\"/><ellipse cx=\"14\" cy=\"14\" rx=\"2.5\" ry=\"3.5\" fill=\"#facc15\" stroke=\"#b45309\" stroke-width=\"1\"/><ellipse cx=\"18\" cy=\"12\" rx=\"2.5\" ry=\"3.5\" fill=\"#fde047\" stroke=\"#b45309\" stroke-width=\"1\"/><ellipse cx=\"14\" cy=\"9\" rx=\"2.5\" ry=\"3.5\" fill=\"#facc15\" stroke=\"#b45309\" stroke-width=\"1\"/><ellipse cx=\"18\" cy=\"7\" rx=\"2.5\" ry=\"3.5\" fill=\"#fde047\" stroke=\"#b45309\" stroke-width=\"1\"/><ellipse cx=\"16\" cy=\"4\" rx=\"2\" ry=\"3\" fill=\"#fef08a\" stroke=\"#b45309\" stroke-width=\"1\"/><line x1=\"13\" y1=\"13\" x2=\"8\" y2=\"9\" stroke=\"#b45309\" stroke-width=\"1.2\"/><line x1=\"19\" y1=\"11\" x2=\"24\" y2=\"7\" stroke=\"#b45309\" stroke-width=\"1.2\"/><line x1=\"13\" y1=\"8\" x2=\"9\" y2=\"4\" stroke=\"#b45309\" stroke-width=\"1.2\"/><line x1=\"19\" y1=\"6\" x2=\"23\" y2=\"2\" stroke=\"#b45309\" stroke-width=\"1.2\"/><line x1=\"16\" y1=\"3\" x2=\"16\" y2=\"0\" stroke=\"#b45309\" stroke-width=\"1.2\"/>"
  },
  "rice": {
    "key": "rice",
    "name": "쌀",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 6,18 C 6,26 12,28 16,28 C 20,28 26,26 26,18 Z\" fill=\"#334155\"/><path d=\"M 7,18 C 7,25 12.5,27 16,27 C 19.5,27 25,25 25,18 Z\" fill=\"#475569\"/><path d=\"M 6,18 C 6,15 11,10 16,10 C 21,10 26,15 26,18 Z\" fill=\"#f8fafc\"/><ellipse cx=\"16\" cy=\"14\" rx=\"9\" ry=\"5\" fill=\"#ffffff\"/><circle cx=\"12\" cy=\"13\" r=\"1.5\" fill=\"#f1f5f9\"/><circle cx=\"15\" cy=\"12\" r=\"1.5\" fill=\"#f8fafc\"/><circle cx=\"19\" cy=\"13\" r=\"1.5\" fill=\"#f1f5f9\"/><circle cx=\"14\" cy=\"15\" r=\"1.5\" fill=\"#f8fafc\"/><circle cx=\"17\" cy=\"15\" r=\"1.5\" fill=\"#ffffff\"/><circle cx=\"11\" cy=\"16\" r=\"1.5\" fill=\"#f1f5f9\"/><path d=\"M 13,8 Q 14,5 13,3 M 16,8 Q 17,4 16,2 M 19,8 Q 20,5 19,3\" stroke=\"#cbd5e1\" stroke-width=\"1\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.7\"/>"
  },
  "coffee_beans": {
    "key": "coffee_beans",
    "name": "커피콩",
    "viewBox": "0 0 32 32",
    "innerSvg": "<ellipse cx=\"12\" cy=\"18\" rx=\"6\" ry=\"8\" fill=\"#78350f\" transform=\"rotate(-25 12 18)\"/><ellipse cx=\"12\" cy=\"18\" rx=\"5\" ry=\"7\" fill=\"#a16207\" transform=\"rotate(-25 12 18)\"/><path d=\"M 9,12 Q 13,18 10,24\" stroke=\"#451a03\" stroke-width=\"1.8\" fill=\"none\"/><ellipse cx=\"20\" cy=\"14\" rx=\"6\" ry=\"8\" fill=\"#a16207\" transform=\"rotate(35 20 14)\"/><ellipse cx=\"20\" cy=\"14\" rx=\"5\" ry=\"7\" fill=\"#ca8a04\" transform=\"rotate(35 20 14)\"/><path d=\"M 18,8 Q 22,14 19,20\" stroke=\"#78350f\" stroke-width=\"1.8\" fill=\"none\"/><ellipse cx=\"18\" cy=\"11\" rx=\"1.5\" ry=\"3\" fill=\"#eab308\" opacity=\"0.6\" transform=\"rotate(35 18 11)\"/>"
  },
  "red_bean": {
    "key": "red_bean",
    "name": "팥",
    "viewBox": "0 0 32 32",
    "innerSvg": "<ellipse cx=\"11\" cy=\"20\" rx=\"6.5\" ry=\"5.5\" fill=\"#7f1d1d\" transform=\"rotate(-15 11 20)\"/><ellipse cx=\"11\" cy=\"20\" rx=\"5.5\" ry=\"4.5\" fill=\"#991b1b\" transform=\"rotate(-15 11 20)\"/><ellipse cx=\"9.5\" cy=\"18.5\" rx=\"2.5\" ry=\"1.5\" fill=\"#b91c1c\" transform=\"rotate(-15 9.5 18.5)\"/><path d=\"M 7.5,20 Q 11,19 14.5,20\" stroke=\"#ffffff\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"/><ellipse cx=\"21\" cy=\"18\" rx=\"6.5\" ry=\"5.5\" fill=\"#7f1d1d\" transform=\"rotate(25 21 18)\"/><ellipse cx=\"21\" cy=\"18\" rx=\"5.5\" ry=\"4.5\" fill=\"#991b1b\" transform=\"rotate(25 21 18)\"/><ellipse cx=\"20\" cy=\"16.5\" rx=\"2.5\" ry=\"1.5\" fill=\"#b91c1c\" transform=\"rotate(25 20 16.5)\"/><path d=\"M 18,18 Q 21,17 24,18\" stroke=\"#ffffff\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\"/><ellipse cx=\"16\" cy=\"10\" rx=\"6\" ry=\"5\" fill=\"#991b1b\" transform=\"rotate(5 16 10)\"/><ellipse cx=\"16\" cy=\"10\" rx=\"5\" ry=\"4\" fill=\"#b91c1c\" transform=\"rotate(5 16 10)\"/><ellipse cx=\"15\" cy=\"8.5\" rx=\"2\" ry=\"1.2\" fill=\"#dc2626\" transform=\"rotate(5 15 8.5)\"/><path d=\"M 13.5,10 Q 16,9.2 18.5,10\" stroke=\"#ffffff\" stroke-width=\"1.5\" stroke-linecap=\"round\" fill=\"none\"/>"
  },
  "roasted_beans": {
    "key": "roasted_beans",
    "name": "원두",
    "viewBox": "0 0 32 32",
    "innerSvg": "<ellipse cx=\"11\" cy=\"20\" rx=\"6\" ry=\"8\" fill=\"#1c0a00\" transform=\"rotate(-25 11 20)\"/><ellipse cx=\"11\" cy=\"20\" rx=\"5\" ry=\"7\" fill=\"#271004\" transform=\"rotate(-25 11 20)\"/><path d=\"M 8,14 Q 12,20 9,26\" stroke=\"#0a0401\" stroke-width=\"2\" fill=\"none\"/><ellipse cx=\"21\" cy=\"17\" rx=\"6\" ry=\"8\" fill=\"#271004\" transform=\"rotate(35 21 17)\"/><ellipse cx=\"21\" cy=\"17\" rx=\"5\" ry=\"7\" fill=\"#3d1a08\" transform=\"rotate(35 21 17)\"/><path d=\"M 19,11 Q 23,17 20,23\" stroke=\"#1c0a00\" stroke-width=\"2\" fill=\"none\"/><path d=\"M 11,11 Q 9,6 12,2 M 16,10 Q 18,5 15,1\" stroke=\"#cbd5e1\" stroke-width=\"1.6\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.75\"/>"
  },
  "red_bean_porridge": {
    "key": "red_bean_porridge",
    "name": "단팥죽",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 5,16 C 5,26 11,28 16,28 C 21,28 27,26 27,16 Z\" fill=\"#1e293b\"/><path d=\"M 6,16 C 6,25 11.5,27 16,27 C 20.5,27 26,25 26,16 Z\" fill=\"#334155\"/><ellipse cx=\"16\" cy=\"16\" rx=\"10\" ry=\"4.5\" fill=\"#701a28\"/><ellipse cx=\"16\" cy=\"16.5\" rx=\"9\" ry=\"3.8\" fill=\"#831843\"/><circle cx=\"12\" cy=\"15\" r=\"3\" fill=\"#ffffff\"/><circle cx=\"12\" cy=\"15\" r=\"2.2\" fill=\"#f8fafc\"/><circle cx=\"17\" cy=\"14\" r=\"3.2\" fill=\"#ffffff\"/><circle cx=\"17\" cy=\"14\" r=\"2.4\" fill=\"#f8fafc\"/><circle cx=\"21\" cy=\"16\" r=\"2.6\" fill=\"#ffffff\"/><circle cx=\"21\" cy=\"16\" r=\"1.8\" fill=\"#f8fafc\"/><ellipse cx=\"14.5\" cy=\"17\" rx=\"1.4\" ry=\"0.8\" fill=\"#fde047\" transform=\"rotate(-20 14.5 17)\"/><path d=\"M 14,10 Q 13,6 15,3 M 18,10 Q 19,6 17,2\" stroke=\"#cbd5e1\" stroke-width=\"1.4\" stroke-linecap=\"round\" fill=\"none\" opacity=\"0.7\"/>"
  },
  "black_tea": {
    "key": "black_tea",
    "name": "홍차",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 8,10 L 22,10 L 21,24 C 21,27 18,28 15,28 C 12,28 9,27 9,24 Z\" fill=\"#92400e\"/><path d=\"M 9,11 L 21,11 L 20,23 C 20,26 17.5,27 15,27 C 12.5,27 10,26 10,23 Z\" fill=\"#b45309\"/><ellipse cx=\"15\" cy=\"12\" rx=\"5.5\" ry=\"1.5\" fill=\"#d97706\"/><path d=\"M 22,13 C 26,13 26,21 21,21\" stroke=\"#cbd5e1\" stroke-width=\"2.5\" fill=\"none\"/><path d=\"M 8,10 L 22,10 L 21,24 C 21,27 18,28 15,28 C 12,28 9,27 9,24 Z\" stroke=\"#e2e8f0\" stroke-width=\"1.5\" fill=\"none\"/><line x1=\"16\" y1=\"12\" x2=\"13\" y2=\"7\" stroke=\"#ffffff\" stroke-width=\"1\"/><rect x=\"11\" y=\"4\" width=\"4\" height=\"4\" fill=\"#ef4444\"/><rect x=\"12\" y=\"5\" width=\"2\" height=\"2\" fill=\"#fde047\"/>"
  },
  "energy_drink": {
    "key": "energy_drink",
    "name": "에너지드링크",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"3\" width=\"12\" height=\"26\" rx=\"3\" fill=\"#0f172a\"/><rect x=\"11\" y=\"3\" width=\"10\" height=\"26\" fill=\"#1e293b\"/><rect x=\"10\" y=\"2\" width=\"12\" height=\"2\" fill=\"#94a3b8\"/><rect x=\"11\" y=\"1\" width=\"10\" height=\"1\" fill=\"#cbd5e1\"/><rect x=\"10\" y=\"28\" width=\"12\" height=\"2\" fill=\"#0f172a\"/><polygon points=\"17,6 12,17 16,17 14,26 21,14 17,14\" fill=\"#a3e635\"/><polygon points=\"16.5,8 13.5,16 16,16 14.5,23 19.5,15 17,15\" fill=\"#facc15\"/>"
  },
  "ion_drink": {
    "key": "ion_drink",
    "name": "이온음료",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"13\" y=\"1\" width=\"6\" height=\"3\" fill=\"#1d4ed8\"/><rect x=\"14\" y=\"1\" width=\"4\" height=\"1\" fill=\"#60a5fa\"/><rect x=\"14\" y=\"4\" width=\"4\" height=\"4\" fill=\"#e2e8f0\"/><rect x=\"10\" y=\"8\" width=\"12\" height=\"21\" rx=\"2\" fill=\"#ffffff\"/><rect x=\"9\" y=\"9\" width=\"1\" height=\"19\" fill=\"#cbd5e1\"/><rect x=\"22\" y=\"9\" width=\"1\" height=\"19\" fill=\"#94a3b8\"/><rect x=\"10\" y=\"13\" width=\"12\" height=\"11\" fill=\"#2563eb\"/><path d=\"M 10,18 Q 16,14 22,18 L 22,24 L 10,24 Z\" fill=\"#1d4ed8\"/><path d=\"M 10,16 Q 16,20 22,16\" stroke=\"#ffffff\" stroke-width=\"1.5\" fill=\"none\"/>"
  },
  "milksoda": {
    "key": "milksoda",
    "name": "밀크소다",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"4\" width=\"12\" height=\"25\" rx=\"3\" fill=\"#ffffff\"/><rect x=\"9\" y=\"5\" width=\"1\" height=\"23\" fill=\"#cbd5e1\"/><rect x=\"22\" y=\"5\" width=\"1\" height=\"23\" fill=\"#94a3b8\"/><rect x=\"10\" y=\"2\" width=\"12\" height=\"2\" fill=\"#cbd5e1\"/><rect x=\"11\" y=\"1\" width=\"10\" height=\"1\" fill=\"#e2e8f0\"/><circle cx=\"16\" cy=\"14\" r=\"3\" fill=\"#38bdf8\"/><polygon points=\"16,10 17,13 20,14 17,15 16,18 15,15 12,14 15,13\" fill=\"#ffffff\"/><rect x=\"12\" y=\"20\" width=\"8\" height=\"2\" fill=\"#0284c7\"/><circle cx=\"13\" cy=\"25\" r=\"1\" fill=\"#38bdf8\"/><circle cx=\"19\" cy=\"25\" r=\"0.8\" fill=\"#38bdf8\"/>"
  },
  "blue_lemonade": {
    "key": "blue_lemonade",
    "name": "레몬에이드",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 9,8 L 23,8 L 21,27 C 21,28.5 19,29.5 16,29.5 C 13,29.5 11,28.5 11,27 Z\" fill=\"#d97706\"/><path d=\"M 10,9 L 22,9 L 20,26 C 20,27.5 18,28.5 16,28.5 C 14,28.5 12,27.5 12,26 Z\" fill=\"#facc15\"/><ellipse cx=\"16\" cy=\"9.5\" rx=\"5.5\" ry=\"1.5\" fill=\"#fef08a\"/><circle cx=\"14\" cy=\"14\" r=\"4\" fill=\"#eab308\"/><circle cx=\"14\" cy=\"14\" r=\"3\" fill=\"#fef9c3\"/><line x1=\"14\" y1=\"11\" x2=\"14\" y2=\"17\" stroke=\"#ca8a04\" stroke-width=\"0.8\"/><line x1=\"11\" y1=\"14\" x2=\"17\" y2=\"14\" stroke=\"#ca8a04\" stroke-width=\"0.8\"/><line x1=\"19\" y1=\"2\" x2=\"15\" y2=\"24\" stroke=\"#f43f5e\" stroke-width=\"2\" stroke-linecap=\"round\"/><line x1=\"19\" y1=\"2\" x2=\"15\" y2=\"24\" stroke=\"#ffffff\" stroke-width=\"0.8\" stroke-dasharray=\"2,2\"/><circle cx=\"18\" cy=\"18\" r=\"1\" fill=\"#ffffff\" opacity=\"0.7\"/><circle cx=\"13\" cy=\"22\" r=\"1.2\" fill=\"#ffffff\" opacity=\"0.6\"/>"
  },
  "rec_blue_lemon_soju": {
    "key": "rec_blue_lemon_soju",
    "name": "레몬소주",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 8,7 L 24,7 L 22,28 C 22,29.5 20,30.5 16,30.5 C 12,30.5 10,29.5 10,28 Z\" fill=\"#cbd5e1\"/><path d=\"M 9,8 L 23,8 L 21,27.5 C 21,28.8 19.2,29.5 16,29.5 C 12.8,29.5 11,28.8 11,27.5 Z\" fill=\"#fef08a\"/><ellipse cx=\"16\" cy=\"8.5\" rx=\"6\" ry=\"1.5\" fill=\"#ffffff\" opacity=\"0.8\"/><rect x=\"13\" y=\"14\" width=\"5\" height=\"5\" rx=\"1\" fill=\"#ffffff\" opacity=\"0.6\"/><rect x=\"12\" y=\"20\" width=\"4\" height=\"4\" rx=\"1\" fill=\"#ffffff\" opacity=\"0.5\"/><circle cx=\"8\" cy=\"8\" r=\"5\" fill=\"#ca8a04\"/><circle cx=\"8\" cy=\"8\" r=\"4\" fill=\"#facc15\"/><circle cx=\"8\" cy=\"8\" r=\"3\" fill=\"#fef9c3\"/><line x1=\"8\" y1=\"5\" x2=\"8\" y2=\"11\" stroke=\"#ca8a04\" stroke-width=\"0.8\"/><line x1=\"5\" y1=\"8\" x2=\"11\" y2=\"8\" stroke=\"#ca8a04\" stroke-width=\"0.8\"/><line x1=\"11\" y1=\"10\" x2=\"11\" y2=\"25\" stroke=\"#ffffff\" stroke-width=\"1\" opacity=\"0.7\"/>"
  },
  "cider": {
    "key": "cider",
    "name": "사이다",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"4\" width=\"12\" height=\"25\" rx=\"3\" fill=\"#15803d\"/><rect x=\"9\" y=\"5\" width=\"1\" height=\"23\" fill=\"#14532d\"/><rect x=\"22\" y=\"5\" width=\"1\" height=\"23\" fill=\"#14532d\"/><rect x=\"10\" y=\"5\" width=\"2\" height=\"23\" fill=\"#4ade80\"/><rect x=\"12\" y=\"5\" width=\"8\" height=\"23\" fill=\"#22c55e\"/><rect x=\"10\" y=\"2\" width=\"12\" height=\"2\" fill=\"#94a3b8\"/><rect x=\"11\" y=\"1\" width=\"10\" height=\"1\" fill=\"#cbd5e1\"/><polygon points=\"16,11 17.5,14.5 21,14.5 18,17 19.5,20.5 16,18 12.5,20.5 14,17 11,14.5 14.5,14.5\" fill=\"#ef4444\"/><polygon points=\"16,12 17,14.5 19.5,14.5 17.5,16.5 18.5,19 16,17.5 13.5,19 14.5,16.5 12.5,14.5 15,14.5\" fill=\"#ffffff\"/><circle cx=\"13\" cy=\"24\" r=\"0.8\" fill=\"#ffffff\"/><circle cx=\"19\" cy=\"24\" r=\"0.8\" fill=\"#ffffff\"/>"
  },
  "cola": {
    "key": "cola",
    "name": "콜라",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"4\" width=\"12\" height=\"25\" rx=\"3\" fill=\"#991b1b\"/><rect x=\"9\" y=\"5\" width=\"1\" height=\"23\" fill=\"#7f1d1d\"/><rect x=\"22\" y=\"5\" width=\"1\" height=\"23\" fill=\"#7f1d1d\"/><rect x=\"10\" y=\"5\" width=\"2\" height=\"23\" fill=\"#f87171\"/><rect x=\"12\" y=\"5\" width=\"8\" height=\"23\" fill=\"#dc2626\"/><rect x=\"10\" y=\"2\" width=\"12\" height=\"2\" fill=\"#94a3b8\"/><rect x=\"11\" y=\"1\" width=\"10\" height=\"1\" fill=\"#cbd5e1\"/><path d=\"M 10,19 Q 16,13 22,17\" stroke=\"#ffffff\" stroke-width=\"2.5\" fill=\"none\"/><path d=\"M 10,21 Q 16,17 22,20\" stroke=\"#ffffff\" stroke-width=\"1\" fill=\"none\"/>"
  },
  "tomato_juice": {
    "key": "tomato_juice",
    "name": "토마토주스",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"4\" width=\"12\" height=\"25\" rx=\"3\" fill=\"#7f1d1d\"/><rect x=\"11\" y=\"4\" width=\"10\" height=\"25\" fill=\"#b91c1c\"/><rect x=\"10\" y=\"2\" width=\"12\" height=\"2\" fill=\"#94a3b8\"/><circle cx=\"16\" cy=\"17\" r=\"4.5\" fill=\"#ef4444\"/><polygon points=\"16,12.5 14,14 13,12 15,13.5 16,11 17,13.5 19,12 18,14\" fill=\"#15803d\"/><ellipse cx=\"14.5\" cy=\"15.5\" rx=\"1.2\" ry=\"0.8\" fill=\"#ffffff\" opacity=\"0.7\"/>"
  },
  "choco_milk": {
    "key": "choco_milk",
    "name": "초코우유",
    "viewBox": "0 0 32 32",
    "innerSvg": "<polygon points=\"10,10 16,4 22,10\" fill=\"#451a03\"/><rect x=\"10\" y=\"10\" width=\"12\" height=\"18\" fill=\"#451a03\"/><polygon points=\"11,10 16,5 21,10\" fill=\"#78350f\"/><rect x=\"11\" y=\"10\" width=\"10\" height=\"17\" fill=\"#78350f\"/><rect x=\"11\" y=\"10\" width=\"2\" height=\"17\" fill=\"#92400e\"/><rect x=\"11\" y=\"14\" width=\"10\" height=\"8\" fill=\"#ffffff\"/><rect x=\"12\" y=\"16\" width=\"8\" height=\"4\" fill=\"#451a03\"/><circle cx=\"19\" cy=\"6\" r=\"1\" fill=\"#fde047\"/>"
  },
  "banana_milk": {
    "key": "banana_milk",
    "name": "바나나우유",
    "viewBox": "0 0 32 32",
    "innerSvg": "<line x1=\"21\" y1=\"2\" x2=\"17\" y2=\"8\" stroke=\"#ef4444\" stroke-width=\"1.8\" stroke-linecap=\"round\"/><rect x=\"12\" y=\"5\" width=\"8\" height=\"3\" rx=\"1\" fill=\"#16a34a\"/><ellipse cx=\"16\" cy=\"5\" rx=\"4\" ry=\"1.2\" fill=\"#4ade80\"/><ellipse cx=\"16\" cy=\"8\" rx=\"4.5\" ry=\"1.2\" fill=\"#15803d\"/><polygon points=\"12,8 5,16.5 9,27 23,27 27,16.5 20,8\" fill=\"#ca8a04\"/><polygon points=\"12.5,8.5 5.8,16.5 9.6,26.5 22.4,26.5 26.2,16.5 19.5,8.5\" fill=\"#facc15\"/><polygon points=\"12.5,8.5 5.8,16.5 9.6,26.5 13.5,26.5 12.5,16.5 15.5,8.5\" fill=\"#fde047\"/><line x1=\"8.5\" y1=\"16\" x2=\"11.5\" y2=\"24\" stroke=\"#ffffff\" stroke-width=\"1.4\" stroke-linecap=\"round\" opacity=\"0.55\"/><line x1=\"5.8\" y1=\"16.5\" x2=\"26.2\" y2=\"16.5\" stroke=\"#eab308\" stroke-width=\"0.9\" opacity=\"0.8\"/><ellipse cx=\"16\" cy=\"16.5\" rx=\"4\" ry=\"2.2\" fill=\"#16a34a\"/><ellipse cx=\"16\" cy=\"16.5\" rx=\"3\" ry=\"1.4\" fill=\"#ffffff\"/>"
  },
  "sikhye": {
    "key": "sikhye",
    "name": "식혜",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"4\" width=\"12\" height=\"25\" rx=\"3\" fill=\"#ca8a04\"/><rect x=\"11\" y=\"4\" width=\"10\" height=\"25\" fill=\"#facc15\"/><rect x=\"10\" y=\"2\" width=\"12\" height=\"2\" fill=\"#94a3b8\"/><rect x=\"11\" y=\"11\" width=\"10\" height=\"12\" fill=\"#fef08a\"/><ellipse cx=\"14\" cy=\"15\" rx=\"1.5\" ry=\"0.8\" fill=\"#ffffff\" stroke=\"#ca8a04\" stroke-width=\"0.5\"/><ellipse cx=\"18\" cy=\"17\" rx=\"1.5\" ry=\"0.8\" fill=\"#ffffff\" stroke=\"#ca8a04\" stroke-width=\"0.5\"/><ellipse cx=\"15\" cy=\"20\" rx=\"1.5\" ry=\"0.8\" fill=\"#ffffff\" stroke=\"#ca8a04\" stroke-width=\"0.5\"/>"
  },
  "peach_drink": {
    "key": "peach_drink",
    "name": "복숭아음료",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"4\" width=\"12\" height=\"25\" rx=\"3\" fill=\"#be185d\"/><rect x=\"11\" y=\"4\" width=\"10\" height=\"25\" fill=\"#f472b6\"/><rect x=\"10\" y=\"2\" width=\"12\" height=\"2\" fill=\"#94a3b8\"/><circle cx=\"16\" cy=\"17\" r=\"5\" fill=\"#fbcfe8\"/><path d=\"M 16,12 C 14,12 12,14 12,17 C 12,20 14,22 16,21 C 18,22 20,20 20,17 C 20,14 18,12 16,12 Z\" fill=\"#fb7185\"/><path d=\"M 16,12 Q 18,9 21,11 Q 19,13 16,12 Z\" fill=\"#15803d\"/>"
  },
  "pear_drink": {
    "key": "pear_drink",
    "name": "배음료",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"4\" width=\"12\" height=\"25\" rx=\"3\" fill=\"#14532d\"/><rect x=\"11\" y=\"4\" width=\"10\" height=\"25\" fill=\"#166534\"/><rect x=\"10\" y=\"2\" width=\"12\" height=\"2\" fill=\"#94a3b8\"/><circle cx=\"16\" cy=\"17\" r=\"5\" fill=\"#facc15\"/><ellipse cx=\"15\" cy=\"16\" rx=\"3\" ry=\"1.5\" fill=\"#fde047\"/><path d=\"M 16,12 L 16,10\" stroke=\"#78350f\" stroke-width=\"1.5\"/>"
  },
  "pineapple_juice": {
    "key": "pineapple_juice",
    "name": "파인애플주스",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"4\" width=\"12\" height=\"25\" rx=\"3\" fill=\"#ca8a04\"/><rect x=\"11\" y=\"4\" width=\"10\" height=\"25\" fill=\"#eab308\"/><rect x=\"10\" y=\"2\" width=\"12\" height=\"2\" fill=\"#94a3b8\"/><polygon points=\"16,8 14,13 18,13\" fill=\"#15803d\"/><circle cx=\"16\" cy=\"18\" r=\"4.5\" fill=\"#fde047\"/><circle cx=\"16\" cy=\"18\" r=\"1.8\" fill=\"#ca8a04\"/>"
  },
  "yakult": {
    "key": "yakult",
    "name": "요구르트",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"12\" y=\"2\" width=\"8\" height=\"2\" fill=\"#ef4444\"/><rect x=\"13\" y=\"2\" width=\"6\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"4\" width=\"6\" height=\"4\" fill=\"#fed7aa\"/><rect x=\"11\" y=\"8\" width=\"10\" height=\"3\" fill=\"#f97316\"/><rect x=\"12\" y=\"11\" width=\"8\" height=\"2\" fill=\"#fed7aa\"/><rect x=\"10\" y=\"13\" width=\"12\" height=\"14\" rx=\"2\" fill=\"#fed7aa\"/><rect x=\"10\" y=\"13\" width=\"2\" height=\"14\" fill=\"#ffffff\"/><rect x=\"20\" y=\"13\" width=\"2\" height=\"14\" fill=\"#fdba74\"/><rect x=\"10\" y=\"17\" width=\"12\" height=\"2\" fill=\"#ef4444\"/>"
  },
  "pomegranate_juice": {
    "key": "pomegranate_juice",
    "name": "석류주스",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"4\" width=\"12\" height=\"25\" rx=\"3\" fill=\"#4c0519\"/><rect x=\"11\" y=\"4\" width=\"10\" height=\"25\" fill=\"#881337\"/><rect x=\"10\" y=\"2\" width=\"12\" height=\"2\" fill=\"#94a3b8\"/><circle cx=\"16\" cy=\"17\" r=\"4.5\" fill=\"#e11d48\"/><circle cx=\"15\" cy=\"16\" r=\"1\" fill=\"#ffffff\"/>"
  },
  "tonic_water": {
    "key": "tonic_water",
    "name": "토닉워터",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"13\" y=\"1\" width=\"6\" height=\"3\" fill=\"#ca8a04\"/><rect x=\"14\" y=\"1\" width=\"4\" height=\"1\" fill=\"#facc15\"/><rect x=\"14\" y=\"4\" width=\"4\" height=\"5\" fill=\"#cbd5e1\"/><rect x=\"14\" y=\"4\" width=\"1\" height=\"5\" fill=\"#ffffff\"/><rect x=\"11\" y=\"9\" width=\"10\" height=\"3\" fill=\"#94a3b8\"/><rect x=\"9\" y=\"12\" width=\"14\" height=\"17\" fill=\"#cbd5e1\"/><rect x=\"9\" y=\"12\" width=\"2\" height=\"17\" fill=\"#ffffff\"/><rect x=\"11\" y=\"12\" width=\"9\" height=\"17\" fill=\"#f1f5f9\"/><rect x=\"20\" y=\"12\" width=\"3\" height=\"17\" fill=\"#94a3b8\"/><rect x=\"10\" y=\"15\" width=\"12\" height=\"9\" fill=\"#facc15\"/><rect x=\"10\" y=\"15\" width=\"12\" height=\"1\" fill=\"#fde047\"/><rect x=\"10\" y=\"23\" width=\"12\" height=\"1\" fill=\"#ca8a04\"/><rect x=\"12\" y=\"18\" width=\"8\" height=\"3\" fill=\"#1e293b\"/>"
  },
  "calamansi_pouch": {
    "key": "calamansi_pouch",
    "name": "깔라만시 원액",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"19\" y=\"2\" width=\"4\" height=\"4\" fill=\"#ffffff\"/><rect x=\"18\" y=\"2\" width=\"6\" height=\"1\" fill=\"#cbd5e1\"/><polygon points=\"9,9 23,6 25,28 7,28\" fill=\"#365314\"/><polygon points=\"10,10 22,7 24,27 8,27\" fill=\"#65a30d\"/><polygon points=\"11,11 21,8.5 22,25 10,25\" fill=\"#84cc16\"/><circle cx=\"16\" cy=\"18\" r=\"4\" fill=\"#facc15\"/><line x1=\"16\" y1=\"14\" x2=\"16\" y2=\"22\" stroke=\"#365314\" stroke-width=\"0.8\"/>"
  },
  "iced_americano": {
    "key": "iced_americano",
    "name": "아이스 아메리카노",
    "viewBox": "0 0 32 32",
    "innerSvg": "<line x1=\"20\" y1=\"1\" x2=\"16\" y2=\"10\" stroke=\"#16a34a\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M 9,8 C 9,5 23,5 23,8 Z\" fill=\"#cbd5e1\" opacity=\"0.6\"/><path d=\"M 9,8 L 23,8 L 21,28 C 21,29 19,30 16,30 C 13,30 11,29 11,28 Z\" fill=\"#1c0a00\"/><path d=\"M 10,9 L 22,9 L 20,27 C 20,28 18,29 16,29 C 14,29 12,28 12,27 Z\" fill=\"#451a03\"/><rect x=\"12\" y=\"10\" width=\"4\" height=\"4\" fill=\"#e0f2fe\" opacity=\"0.75\" transform=\"rotate(15 14 12)\"/><rect x=\"17\" y=\"12\" width=\"4\" height=\"4\" fill=\"#ffffff\" opacity=\"0.65\" transform=\"rotate(-10 19 14)\"/><rect x=\"13\" y=\"16\" width=\"4\" height=\"4\" fill=\"#bae6fd\" opacity=\"0.7\" transform=\"rotate(25 15 18)\"/><path d=\"M 9,8 L 23,8 L 21,28 C 21,29 19,30 16,30 C 13,30 11,29 11,28 Z\" stroke=\"#ffffff\" stroke-width=\"1\" fill=\"none\" opacity=\"0.5\"/>"
  },
  "hongcho": {
    "key": "hongcho",
    "name": "홍초",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"13\" y=\"1\" width=\"6\" height=\"3\" fill=\"#0f172a\"/><rect x=\"14\" y=\"4\" width=\"4\" height=\"6\" fill=\"#831843\"/><rect x=\"14\" y=\"4\" width=\"1\" height=\"6\" fill=\"#be123c\"/><rect x=\"11\" y=\"10\" width=\"10\" height=\"3\" fill=\"#9f1239\"/><rect x=\"9\" y=\"13\" width=\"14\" height=\"16\" fill=\"#881337\"/><rect x=\"9\" y=\"13\" width=\"2\" height=\"16\" fill=\"#fb7185\"/><rect x=\"11\" y=\"13\" width=\"9\" height=\"16\" fill=\"#be123c\"/><rect x=\"20\" y=\"13\" width=\"3\" height=\"16\" fill=\"#4c0519\"/><rect x=\"10\" y=\"17\" width=\"12\" height=\"8\" fill=\"#1e1b4b\"/><circle cx=\"16\" cy=\"21\" r=\"2\" fill=\"#ef4444\"/>"
  },
  "sugar": {
    "key": "sugar",
    "name": "설탕",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 8,14 L 24,14 L 22,27 C 22,28.5 20,29.5 16,29.5 C 12,29.5 10,28.5 10,27 Z\" fill=\"#94a3b8\"/><path d=\"M 9,15 L 23,15 L 21,26 C 21,27.5 19,28.5 16,28.5 C 13,28.5 11,27.5 11,26 Z\" fill=\"#ffffff\"/><rect x=\"12\" y=\"8\" width=\"8\" height=\"6\" fill=\"#cbd5e1\"/><rect x=\"14\" y=\"4\" width=\"4\" height=\"4\" fill=\"#e2e8f0\"/><circle cx=\"16\" cy=\"18\" r=\"1\" fill=\"#cbd5e1\"/><circle cx=\"13\" cy=\"22\" r=\"1\" fill=\"#cbd5e1\"/><circle cx=\"19\" cy=\"22\" r=\"1\" fill=\"#cbd5e1\"/>"
  },
  "nuruk": {
    "key": "nuruk",
    "name": "누룩",
    "viewBox": "0 0 32 32",
    "innerSvg": "<ellipse cx=\"16\" cy=\"18\" rx=\"12\" ry=\"8\" fill=\"#78350f\"/><ellipse cx=\"16\" cy=\"17\" rx=\"12\" ry=\"8\" fill=\"#92400e\"/><ellipse cx=\"16\" cy=\"16\" rx=\"11\" ry=\"7\" fill=\"#b45309\"/><ellipse cx=\"15\" cy=\"15\" rx=\"9\" ry=\"5.5\" fill=\"#d97706\"/><path d=\"M 10,14 Q 15,16 20,13 M 12,17 Q 16,14 21,17\" stroke=\"#78350f\" stroke-width=\"1.2\" fill=\"none\"/><circle cx=\"13\" cy=\"14\" r=\"0.8\" fill=\"#fef08a\"/><circle cx=\"18\" cy=\"16\" r=\"0.8\" fill=\"#fef08a\"/>"
  },
  "yuzu_cheong": {
    "key": "yuzu_cheong",
    "name": "유자청",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"4\" width=\"12\" height=\"3\" fill=\"#ca8a04\"/><path d=\"M 8,7 Q 16,9 24,7 L 22,10 L 10,10 Z\" fill=\"#facc15\"/><rect x=\"9\" y=\"10\" width=\"14\" height=\"18\" rx=\"2\" fill=\"#ca8a04\"/><rect x=\"10\" y=\"11\" width=\"12\" height=\"16\" rx=\"1\" fill=\"#eab308\"/><rect x=\"10\" y=\"11\" width=\"2\" height=\"16\" fill=\"#fde047\"/><rect x=\"12\" y=\"11\" width=\"8\" height=\"16\" fill=\"#facc15\"/><path d=\"M 12,14 Q 15,16 18,13 M 13,19 Q 16,21 19,18 M 12,23 Q 15,25 18,22\" stroke=\"#ca8a04\" stroke-width=\"1.5\" fill=\"none\"/>"
  },
  "maesil_cheong": {
    "key": "maesil_cheong",
    "name": "매실청",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"10\" y=\"4\" width=\"12\" height=\"3\" fill=\"#92400e\"/><path d=\"M 8,7 Q 16,9 24,7 L 22,10 L 10,10 Z\" fill=\"#d97706\"/><rect x=\"9\" y=\"10\" width=\"14\" height=\"18\" rx=\"2\" fill=\"#92400e\"/><rect x=\"10\" y=\"11\" width=\"12\" height=\"16\" rx=\"1\" fill=\"#b45309\"/><rect x=\"10\" y=\"11\" width=\"2\" height=\"16\" fill=\"#f59e0b\"/><rect x=\"12\" y=\"11\" width=\"8\" height=\"16\" fill=\"#d97706\"/><circle cx=\"14\" cy=\"16\" r=\"2.5\" fill=\"#65a30d\"/><circle cx=\"18\" cy=\"20\" r=\"2.5\" fill=\"#4d7c0f\"/><circle cx=\"14\" cy=\"23\" r=\"2.5\" fill=\"#65a30d\"/>"
  },
  "vinegar": {
    "key": "vinegar",
    "name": "식초",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"14\" y=\"2\" width=\"4\" height=\"3\" fill=\"#ca8a04\"/><rect x=\"14\" y=\"5\" width=\"4\" height=\"6\" fill=\"#e2e8f0\"/><rect x=\"14\" y=\"5\" width=\"1\" height=\"6\" fill=\"#ffffff\"/><rect x=\"11\" y=\"11\" width=\"10\" height=\"3\" fill=\"#cbd5e1\"/><rect x=\"9\" y=\"14\" width=\"14\" height=\"15\" fill=\"#ca8a04\"/><rect x=\"9\" y=\"14\" width=\"2\" height=\"15\" fill=\"#fef08a\"/><rect x=\"11\" y=\"14\" width=\"10\" height=\"15\" fill=\"#facc15\"/><rect x=\"21\" y=\"14\" width=\"2\" height=\"15\" fill=\"#a16207\"/><rect x=\"11\" y=\"17\" width=\"10\" height=\"8\" fill=\"#ffffff\"/><rect x=\"13\" y=\"19\" width=\"6\" height=\"4\" fill=\"#ca8a04\"/>"
  },
  "pomegranate_concentrate": {
    "key": "pomegranate_concentrate",
    "name": "석류농축액",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"14\" y=\"1\" width=\"4\" height=\"5\" fill=\"#0f172a\"/><rect x=\"13\" y=\"6\" width=\"6\" height=\"3\" fill=\"#334155\"/><rect x=\"10\" y=\"9\" width=\"12\" height=\"20\" rx=\"2\" fill=\"#4a044e\"/><rect x=\"10\" y=\"9\" width=\"2\" height=\"20\" fill=\"#a21caf\"/><rect x=\"12\" y=\"9\" width=\"8\" height=\"20\" fill=\"#701a75\"/><rect x=\"20\" y=\"9\" width=\"2\" height=\"20\" fill=\"#2e1065\"/><rect x=\"11\" y=\"14\" width=\"10\" height=\"9\" fill=\"#1e1b4b\"/><circle cx=\"16\" cy=\"18\" r=\"2.5\" fill=\"#dc2626\"/>"
  },
  "melona": {
    "key": "melona",
    "name": "올때메론바",
    "viewBox": "0 0 32 32",
    "innerSvg": "<rect x=\"11\" y=\"3\" width=\"10\" height=\"20\" rx=\"1.5\" fill=\"#15803d\"/><rect x=\"12\" y=\"3\" width=\"8\" height=\"19\" fill=\"#4ade80\"/><rect x=\"12\" y=\"3\" width=\"2\" height=\"19\" fill=\"#86efac\"/><rect x=\"14\" y=\"3\" width=\"5\" height=\"19\" fill=\"#22c55e\"/><rect x=\"19\" y=\"3\" width=\"1\" height=\"19\" fill=\"#16a34a\"/><rect x=\"15\" y=\"23\" width=\"2\" height=\"8\" fill=\"#d97706\"/><rect x=\"15\" y=\"23\" width=\"1\" height=\"8\" fill=\"#fde68a\"/>"
  },
  "jawsbar": {
    "key": "jawsbar",
    "name": "상어바",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 16,2 C 12,2 10,7 10,13 L 10,22 L 22,22 L 22,13 C 22,7 20,2 16,2 Z\" fill=\"#0f172a\"/><path d=\"M 16,3 C 13,3 11,8 11,13 L 11,21 L 21,21 L 21,13 C 21,8 19,3 16,3 Z\" fill=\"#334155\"/><path d=\"M 16,3 C 14,3 12,8 12,13 L 12,21 L 18,21 L 18,13 C 18,8 17,3 16,3 Z\" fill=\"#475569\"/><path d=\"M 18,10 C 16,10 15,12 15,14 C 15,16 17,17 19,16 C 21,15 21,11 18,10 Z\" fill=\"#f43f5e\"/><circle cx=\"18\" cy=\"13\" r=\"1.5\" fill=\"#fda4af\"/><rect x=\"15\" y=\"22\" width=\"2\" height=\"9\" fill=\"#d97706\"/><rect x=\"15\" y=\"22\" width=\"1\" height=\"9\" fill=\"#fde68a\"/>"
  },
  "bibibig": {
    "key": "bibibig",
    "name": "단팥바",
    "viewBox": "0 0 32 32",
    "innerSvg": "<path d=\"M 12.5,6 C 12.5,4.2 13.8,3.2 16,3.2 C 18.2,3.2 19.5,4.2 19.5,6 L 19.5,22 C 19.5,22.6 19.1,23 18.5,23 L 13.5,23 C 12.9,23 12.5,22.6 12.5,22 Z\" fill=\"#3d0c12\"/><path d=\"M 13,6 C 13,4.6 14.1,3.8 16,3.8 C 17.9,3.8 19,4.6 19,6 L 19,21.8 C 19,22.2 18.7,22.5 18.3,22.5 L 13.7,22.5 C 13.3,22.5 13,22.2 13,21.8 Z\" fill=\"#5e1820\"/><path d=\"M 13,6 C 13,4.6 14.1,3.8 15.2,3.8 L 15.2,22.5 L 13.7,22.5 C 13.3,22.5 13,22.2 13,21.8 Z\" fill=\"#78252f\" opacity=\"0.85\"/><line x1=\"14\" y1=\"5.5\" x2=\"14\" y2=\"20.5\" stroke=\"#ffffff\" stroke-width=\"0.7\" stroke-linecap=\"round\" opacity=\"0.25\"/><ellipse cx=\"15.5\" cy=\"8\" rx=\"1.4\" ry=\"0.9\" fill=\"#280509\" transform=\"rotate(-15 15.5 8)\"/><ellipse cx=\"15.3\" cy=\"7.8\" rx=\"0.7\" ry=\"0.4\" fill=\"#78252f\" opacity=\"0.6\" transform=\"rotate(-15 15.3 7.8)\"/><ellipse cx=\"17.2\" cy=\"12.5\" rx=\"1.5\" ry=\"1.0\" fill=\"#280509\" transform=\"rotate(20 17.2 12.5)\"/><ellipse cx=\"17\" cy=\"12.3\" rx=\"0.8\" ry=\"0.5\" fill=\"#78252f\" opacity=\"0.6\" transform=\"rotate(20 17 12.3)\"/><ellipse cx=\"15\" cy=\"16.5\" rx=\"1.4\" ry=\"0.9\" fill=\"#280509\" transform=\"rotate(-10 15 16.5)\"/><ellipse cx=\"17.2\" cy=\"19.5\" rx=\"1.3\" ry=\"0.8\" fill=\"#280509\" transform=\"rotate(25 17.2 19.5)\"/><path d=\"M 14.5,22 L 17.5,22 L 17.5,29.5 C 17.5,30.3 16.8,31 16,31 C 15.2,31 14.5,30.3 14.5,29.5 Z\" fill=\"#b45309\"/><path d=\"M 14.8,22 L 17.2,22 L 17.2,29.3 C 17.2,29.9 16.6,30.5 16,30.5 C 15.4,30.5 14.8,29.9 14.8,29.3 Z\" fill=\"#d97706\"/><path d=\"M 15,22 L 16,22 L 16,29 C 16,29.7 15.4,30 15,30 Z\" fill=\"#fde68a\" opacity=\"0.8\"/>"
  }
};

  const ALIAS_MAP = {
  "3": "melona",
  "4": "beer",
  "5": "soju",
  "11": "ice",
  "12": "sparkling_water",
  "14": "blue_lemonade",
  "15": "milksoda",
  "20": "maesilju",
  "22": "tomato_juice",
  "23": "screwbar",
  "25": "nuruk",
  "26": "makgeolli",
  "28": "chocolate",
  "29": "choco_milk",
  "32": "tankboy",
  "34": "strawberry_milk",
  "35": "banana_milk",
  "36": "yuzu_cheong",
  "37": "maesil_cheong",
  "52": "tonic_water",
  "53": "calamansi_pouch",
  "57": "bokbunjaju",
  "58": "cider",
  "59": "pear_drink",
  "60": "sikhye",
  "61": "misutgaru",
  "62": "vinegar",
  "63": "pomegranate_concentrate",
  "64": "hongcho",
  "65": "iced_americano",
  "66": "jawsbar",
  "67": "bibibig",
  "1": "rec_somaek",
  "2": "rec_kkulju",
  "6": "rec_hongchaju",
  "7": "rec_kibum_tea",
  "8": "rec_energy_soju",
  "9": "rec_blue_lemon_soju",
  "10": "rec_boksosa",
  "13": "rec_icetea",
  "16": "rec_mango_ringo",
  "17": "rec_mango_ringoju",
  "18": "rec_soju_cola",
  "19": "rec_ringelju",
  "21": "rec_maeksato",
  "24": "rec_screwbarju",
  "27": "rec_maksa",
  "30": "rec_choco_soju",
  "31": "rec_golden_somaek",
  "33": "rec_tankboyju",
  "38": "rec_strawberry_makgeolli",
  "39": "rec_honey_makgeolli",
  "40": "rec_yuzu_makgeolli",
  "41": "rec_maesil_makgeolli",
  "42": "rec_sikhye_makgeolli",
  "43": "rec_misutgaru_makgeolli",
  "44": "rec_banana_milk_makgeolli",
  "45": "rec_peach_makgeolli",
  "46": "rec_pear_makgeolli",
  "47": "rec_pineapple_makgeolli",
  "48": "rec_yakult_makgeolli",
  "49": "rec_honey_misutgaru_makgeolli",
  "50": "rec_pomegranate_makgeolli",
  "51": "rec_sotonic",
  "54": "rec_calamansiju",
  "55": "rec_icheon_makgeolli",
  "56": "rec_hallasan_sotonic",
  "68": "rec_tesla",
  "69": "rec_tejina",
  "70": "rec_casscheorom",
  "71": "rec_kelly_is_back",
  "72": "rec_castella",
  "73": "rec_milkisju",
  "74": "rec_gojingamlae",
  "75": "rec_pocariju",
  "76": "rec_energizerju",
  "77": "rec_taegeukju",
  "78": "rec_sowonju",
  "79": "rec_dutch_lager",
  "80": "rec_melonaju",
  "81": "rec_jawsbarju",
  "82": "rec_bibibig_makgeolli",
  "83": "rec_kahlua_milk",
  "101": "soju",
  "102": "beer",
  "103": "bokbunjaju",
  "104": "maesilju",
  "105": "makgeolli",
  "201": "ice",
  "202": "water",
  "203": "fire",
  "204": "sparkling_water",
  "205": "air",
  "206": "snow",
  "301": "lemon",
  "302": "melon",
  "303": "mango",
  "304": "maesil",
  "305": "tomato",
  "306": "apple",
  "307": "strawberry",
  "308": "cacao",
  "309": "pear",
  "310": "banana",
  "311": "yuzu",
  "312": "calamansi",
  "313": "bokbunja",
  "314": "pomegranate",
  "315": "orange",
  "401": "milk",
  "501": "barley",
  "502": "rice",
  "503": "misutgaru",
  "504": "coffee_beans",
  "505": "red_bean",
  "506": "roasted_beans",
  "807": "red_bean_porridge",
  "84": "roasted_beans",
  "85": "red_bean_porridge",
  "601": "black_tea",
  "602": "energy_drink",
  "603": "ion_drink",
  "604": "milksoda",
  "605": "blue_lemonade",
  "606": "cider",
  "607": "cola",
  "608": "tomato_juice",
  "609": "choco_milk",
  "610": "strawberry_milk",
  "611": "banana_milk",
  "612": "sikhye",
  "613": "peach_drink",
  "614": "pear_drink",
  "615": "pineapple_juice",
  "616": "yakult",
  "617": "pomegranate_juice",
  "618": "tonic_water",
  "619": "calamansi_pouch",
  "620": "iced_americano",
  "621": "hongcho",
  "701": "sugar",
  "702": "nuruk",
  "703": "yuzu_cheong",
  "704": "maesil_cheong",
  "705": "honey",
  "706": "vinegar",
  "707": "pomegranate_concentrate",
  "801": "screwbar",
  "802": "chocolate",
  "803": "tankboy",
  "804": "melona",
  "805": "jawsbar",
  "806": "bibibig",
  "soju": "soju",
  "소주": "soju",
  "ing_101": "soju",
  "rec_5": "soju",
  "beer": "beer",
  "맥주": "beer",
  "ing_102": "beer",
  "rec_4": "beer",
  "bokbunjaju": "bokbunjaju",
  "복분자주": "bokbunjaju",
  "ing_103": "bokbunjaju",
  "rec_57": "bokbunjaju",
  "maesilju": "maesilju",
  "매실주": "maesilju",
  "ing_104": "maesilju",
  "rec_20": "maesilju",
  "매화수": "maesilju",
  "makgeolli": "makgeolli",
  "막걸리": "makgeolli",
  "ing_105": "makgeolli",
  "rec_26": "makgeolli",
  "ice": "ice",
  "얼음": "ice",
  "ing_201": "ice",
  "rec_11": "ice",
  "water": "water",
  "물": "water",
  "ing_202": "water",
  "fire": "fire",
  "불": "fire",
  "ing_203": "fire",
  "sparkling_water": "sparkling_water",
  "탄산수": "sparkling_water",
  "ing_204": "sparkling_water",
  "rec_12": "sparkling_water",
  "air": "air",
  "공기": "air",
  "ing_205": "air",
  "snow": "snow",
  "눈": "snow",
  "ing_206": "snow",
  "lemon": "lemon",
  "레몬": "lemon",
  "ing_301": "lemon",
  "melon": "melon",
  "멜론": "melon",
  "ing_302": "melon",
  "mango": "mango",
  "망고": "mango",
  "ing_303": "mango",
  "maesil": "maesil",
  "매실": "maesil",
  "ing_304": "maesil",
  "tomato": "tomato",
  "토마토": "tomato",
  "ing_305": "tomato",
  "apple": "apple",
  "사과": "apple",
  "ing_306": "apple",
  "strawberry": "strawberry",
  "딸기": "strawberry",
  "ing_307": "strawberry",
  "cacao": "cacao",
  "카카오": "cacao",
  "ing_308": "cacao",
  "pear": "pear",
  "배": "pear",
  "ing_309": "pear",
  "banana": "banana",
  "바나나": "banana",
  "ing_310": "banana",
  "yuzu": "yuzu",
  "유자": "yuzu",
  "ing_311": "yuzu",
  "calamansi": "calamansi",
  "깔라만시": "calamansi",
  "ing_312": "calamansi",
  "bokbunja": "bokbunja",
  "복분자": "bokbunja",
  "ing_313": "bokbunja",
  "pomegranate": "pomegranate",
  "석류": "pomegranate",
  "ing_314": "pomegranate",
  "orange": "orange",
  "오렌지": "orange",
  "ing_315": "orange",
  "milk": "milk",
  "우유": "milk",
  "ing_401": "milk",
  "barley": "barley",
  "맥(보리)": "barley",
  "ing_501": "barley",
  "맥": "barley",
  "보리": "barley",
  "rice": "rice",
  "쌀": "rice",
  "ing_502": "rice",
  "misutgaru": "misutgaru",
  "미숫가루": "misutgaru",
  "ing_503": "misutgaru",
  "rec_61": "misutgaru",
  "coffee_beans": "coffee_beans",
  "커피콩": "coffee_beans",
  "생두": "coffee_beans",
  "ing_504": "coffee_beans",
  "red_bean": "red_bean",
  "팥": "red_bean",
  "붉은팥": "red_bean",
  "ing_505": "red_bean",
  "roasted_beans": "roasted_beans",
  "원두": "roasted_beans",
  "볶은원두": "roasted_beans",
  "커피원두": "roasted_beans",
  "ing_506": "roasted_beans",
  "rec_84": "roasted_beans",
  "84": "roasted_beans",
  "red_bean_porridge": "red_bean_porridge",
  "단팥죽": "red_bean_porridge",
  "팥죽": "red_bean_porridge",
  "ing_807": "red_bean_porridge",
  "rec_85": "red_bean_porridge",
  "85": "red_bean_porridge",
  "black_tea": "black_tea",
  "홍차": "black_tea",
  "ing_601": "black_tea",
  "energy_drink": "energy_drink",
  "에너지드링크": "energy_drink",
  "ing_602": "energy_drink",
  "핫식스": "energy_drink",
  "ion_drink": "ion_drink",
  "이온음료": "ion_drink",
  "ing_603": "ion_drink",
  "포카리스웨트": "ion_drink",
  "milksoda": "milksoda",
  "밀크소다": "milksoda",
  "ing_604": "milksoda",
  "rec_15": "milksoda",
  "밀키스": "milksoda",
  "blue_lemonade": "blue_lemonade",
  "블루레몬에이드": "blue_lemonade",
  "레몬에이드": "blue_lemonade",
  "lemonade": "blue_lemonade",
  "레몬소주": "rec_blue_lemon_soju",
  "lemon_soju": "rec_blue_lemon_soju",
  "rec_lemon_soju": "rec_blue_lemon_soju",
  "ing_605": "blue_lemonade",
  "rec_14": "blue_lemonade",
  "cider": "cider",
  "사이다": "cider",
  "ing_606": "cider",
  "rec_58": "cider",
  "칠성사이다": "cider",
  "cola": "cola",
  "콜라": "cola",
  "ing_607": "cola",
  "코카콜라": "cola",
  "tomato_juice": "tomato_juice",
  "토마토주스": "tomato_juice",
  "ing_608": "tomato_juice",
  "rec_22": "tomato_juice",
  "choco_milk": "choco_milk",
  "초코우유": "choco_milk",
  "ing_609": "choco_milk",
  "rec_29": "choco_milk",
  "초코에몽": "choco_milk",
  "strawberry_milk": "strawberry_milk",
  "딸기우유": "strawberry_milk",
  "ing_610": "strawberry_milk",
  "rec_34": "strawberry_milk",
  "banana_milk": "banana_milk",
  "바나나우유": "banana_milk",
  "ing_611": "banana_milk",
  "rec_35": "banana_milk",
  "단지우유": "banana_milk",
  "sikhye": "sikhye",
  "식혜": "sikhye",
  "ing_612": "sikhye",
  "rec_60": "sikhye",
  "비락식혜": "sikhye",
  "peach_drink": "peach_drink",
  "복숭아음료": "peach_drink",
  "ing_613": "peach_drink",
  "2프로": "peach_drink",
  "코코팜": "peach_drink",
  "pear_drink": "pear_drink",
  "배음료": "pear_drink",
  "ing_614": "pear_drink",
  "rec_59": "pear_drink",
  "갈아만든배": "pear_drink",
  "pineapple_juice": "pineapple_juice",
  "파인애플주스": "pineapple_juice",
  "ing_615": "pineapple_juice",
  "yakult": "yakult",
  "요구르트": "yakult",
  "ing_616": "yakult",
  "야쿠르트": "yakult",
  "pomegranate_juice": "pomegranate_juice",
  "석류주스": "pomegranate_juice",
  "ing_617": "pomegranate_juice",
  "미녀는석류를좋아해": "pomegranate_juice",
  "tonic_water": "tonic_water",
  "토닉워터": "tonic_water",
  "ing_618": "tonic_water",
  "rec_52": "tonic_water",
  "calamansi_pouch": "calamansi_pouch",
  "깔라만시 원액": "calamansi_pouch",
  "ing_619": "calamansi_pouch",
  "rec_53": "calamansi_pouch",
  "iced_americano": "iced_americano",
  "아이스 아메리카노": "iced_americano",
  "ing_620": "iced_americano",
  "rec_65": "iced_americano",
  "hongcho": "hongcho",
  "홍초": "hongcho",
  "ing_621": "hongcho",
  "rec_64": "hongcho",
  "sugar": "sugar",
  "설탕": "sugar",
  "ing_701": "sugar",
  "nuruk": "nuruk",
  "누룩": "nuruk",
  "ing_702": "nuruk",
  "rec_25": "nuruk",
  "yuzu_cheong": "yuzu_cheong",
  "유자청": "yuzu_cheong",
  "ing_703": "yuzu_cheong",
  "rec_36": "yuzu_cheong",
  "maesil_cheong": "maesil_cheong",
  "매실청": "maesil_cheong",
  "ing_704": "maesil_cheong",
  "rec_37": "maesil_cheong",
  "honey": "honey",
  "꿀": "honey",
  "ing_705": "honey",
  "vinegar": "vinegar",
  "식초": "vinegar",
  "ing_706": "vinegar",
  "rec_62": "vinegar",
  "양조식초": "vinegar",
  "pomegranate_concentrate": "pomegranate_concentrate",
  "석류농축액": "pomegranate_concentrate",
  "ing_707": "pomegranate_concentrate",
  "rec_63": "pomegranate_concentrate",
  "screwbar": "screwbar",
  "배배꼬인바": "screwbar",
  "ing_801": "screwbar",
  "rec_23": "screwbar",
  "스크류바": "screwbar",
  "chocolate": "chocolate",
  "초콜릿": "chocolate",
  "ing_802": "chocolate",
  "rec_28": "chocolate",
  "가나초콜릿": "chocolate",
  "tankboy": "tankboy",
  "배즙보이": "tankboy",
  "ing_803": "tankboy",
  "rec_32": "tankboy",
  "탱크보이": "tankboy",
  "melona": "melona",
  "올때메론바": "melona",
  "ing_804": "melona",
  "rec_3": "melona",
  "메로나": "melona",
  "jawsbar": "jawsbar",
  "상어바": "jawsbar",
  "ing_805": "jawsbar",
  "rec_66": "jawsbar",
  "죠스바": "jawsbar",
  "bibibig": "bibibig",
  "단팥바": "bibibig",
  "ing_806": "bibibig",
  "rec_67": "bibibig",
  "비비빅": "bibibig",
  "rec_somaek": "rec_somaek",
  "소맥": "rec_somaek",
  "rec_1": "rec_somaek",
  "rec_kkulju": "rec_kkulju",
  "꿀주": "rec_kkulju",
  "rec_2": "rec_kkulju",
  "rec_hongchaju": "rec_hongchaju",
  "홍차주": "rec_hongchaju",
  "rec_6": "rec_hongchaju",
  "rec_kibum_tea": "rec_kibum_tea",
  "만능열쇠 홍차주": "rec_kibum_tea",
  "rec_7": "rec_kibum_tea",
  "기범주": "rec_kibum_tea",
  "rec_energy_soju": "rec_energy_soju",
  "에너지주": "rec_energy_soju",
  "rec_8": "rec_energy_soju",
  "rec_blue_lemon_soju": "rec_blue_lemon_soju",
  "블루레몬주": "rec_blue_lemon_soju",
  "rec_9": "rec_blue_lemon_soju",
  "rec_boksosa": "rec_boksosa",
  "복소사": "rec_boksosa",
  "rec_10": "rec_boksosa",
  "rec_icetea": "rec_icetea",
  "아이스티": "rec_icetea",
  "rec_13": "rec_icetea",
  "rec_mango_ringo": "rec_mango_ringo",
  "망고비어": "rec_mango_ringo",
  "rec_16": "rec_mango_ringo",
  "망고링고": "rec_mango_ringo",
  "rec_mango_ringoju": "rec_mango_ringoju",
  "망고비어주": "rec_mango_ringoju",
  "rec_17": "rec_mango_ringoju",
  "망고링고주": "rec_mango_ringoju",
  "rec_soju_cola": "rec_soju_cola",
  "소콜": "rec_soju_cola",
  "rec_18": "rec_soju_cola",
  "rec_ringelju": "rec_ringelju",
  "링겔주": "rec_ringelju",
  "rec_19": "rec_ringelju",
  "rec_maeksato": "rec_maeksato",
  "맥사토": "rec_maeksato",
  "rec_21": "rec_maeksato",
  "rec_screwbarju": "rec_screwbarju",
  "배배꼬인주": "rec_screwbarju",
  "rec_24": "rec_screwbarju",
  "스크류바주": "rec_screwbarju",
  "rec_maksa": "rec_maksa",
  "막사": "rec_maksa",
  "rec_27": "rec_maksa",
  "rec_choco_soju": "rec_choco_soju",
  "초코방울주": "rec_choco_soju",
  "rec_30": "rec_choco_soju",
  "초코에몽주": "rec_choco_soju",
  "rec_golden_somaek": "rec_golden_somaek",
  "황금소맥": "rec_golden_somaek",
  "rec_31": "rec_golden_somaek",
  "rec_tankboyju": "rec_tankboyju",
  "배즙보이주": "rec_tankboyju",
  "rec_33": "rec_tankboyju",
  "탱크보이주": "rec_tankboyju",
  "rec_strawberry_makgeolli": "rec_strawberry_makgeolli",
  "딸기 막걸리": "rec_strawberry_makgeolli",
  "바나나 막걸리": "rec_banana_milk_makgeolli",
  "딸기우유 막걸리": "rec_strawberry_makgeolli",
  "rec_38": "rec_strawberry_makgeolli",
  "rec_honey_makgeolli": "rec_honey_makgeolli",
  "꿀 막걸리": "rec_honey_makgeolli",
  "rec_39": "rec_honey_makgeolli",
  "rec_yuzu_makgeolli": "rec_yuzu_makgeolli",
  "유자 막걸리": "rec_yuzu_makgeolli",
  "rec_40": "rec_yuzu_makgeolli",
  "rec_maesil_makgeolli": "rec_maesil_makgeolli",
  "매실 막걸리": "rec_maesil_makgeolli",
  "rec_41": "rec_maesil_makgeolli",
  "rec_sikhye_makgeolli": "rec_sikhye_makgeolli",
  "식혜 막걸리": "rec_sikhye_makgeolli",
  "rec_42": "rec_sikhye_makgeolli",
  "rec_misutgaru_makgeolli": "rec_misutgaru_makgeolli",
  "미숫가루 막걸리": "rec_misutgaru_makgeolli",
  "rec_43": "rec_misutgaru_makgeolli",
  "rec_banana_milk_makgeolli": "rec_banana_milk_makgeolli",
  "바나나우유 막걸리": "rec_banana_milk_makgeolli",
  "rec_44": "rec_banana_milk_makgeolli",
  "rec_peach_makgeolli": "rec_peach_makgeolli",
  "복숭아 막걸리": "rec_peach_makgeolli",
  "rec_45": "rec_peach_makgeolli",
  "rec_pear_makgeolli": "rec_pear_makgeolli",
  "배 막걸리": "rec_pear_makgeolli",
  "rec_46": "rec_pear_makgeolli",
  "rec_pineapple_makgeolli": "rec_pineapple_makgeolli",
  "파인애플 막걸리": "rec_pineapple_makgeolli",
  "rec_47": "rec_pineapple_makgeolli",
  "rec_yakult_makgeolli": "rec_yakult_makgeolli",
  "요구르트 막걸리": "rec_yakult_makgeolli",
  "rec_48": "rec_yakult_makgeolli",
  "rec_honey_misutgaru_makgeolli": "rec_honey_misutgaru_makgeolli",
  "꿀 미숫가루 막걸리": "rec_honey_misutgaru_makgeolli",
  "rec_49": "rec_honey_misutgaru_makgeolli",
  "rec_pomegranate_makgeolli": "rec_pomegranate_makgeolli",
  "석류 막걸리": "rec_pomegranate_makgeolli",
  "rec_50": "rec_pomegranate_makgeolli",
  "rec_sotonic": "rec_sotonic",
  "소토닉": "rec_sotonic",
  "rec_51": "rec_sotonic",
  "rec_calamansiju": "rec_calamansiju",
  "깔라만시주": "rec_calamansiju",
  "rec_54": "rec_calamansiju",
  "rec_icheon_makgeolli": "rec_icheon_makgeolli",
  "이천 수라상 생막걸리": "rec_icheon_makgeolli",
  "rec_55": "rec_icheon_makgeolli",
  "이천 임금님표 생막걸리": "rec_icheon_makgeolli",
  "rec_hallasan_sotonic": "rec_hallasan_sotonic",
  "제주 화산 쏘토닉": "rec_hallasan_sotonic",
  "rec_56": "rec_hallasan_sotonic",
  "한라산 21 쏘토닉": "rec_hallasan_sotonic",
  "rec_tesla": "rec_tesla",
  "테스형라": "rec_tesla",
  "rec_68": "rec_tesla",
  "테슬라": "rec_tesla",
  "rec_tejina": "rec_tejina",
  "테진아": "rec_tejina",
  "rec_69": "rec_tejina",
  "rec_casscheorom": "rec_casscheorom",
  "카아스처럼": "rec_casscheorom",
  "rec_70": "rec_casscheorom",
  "카스처럼": "rec_casscheorom",
  "rec_kelly_is_back": "rec_kelly_is_back",
  "캘리포니아 이즈백": "rec_kelly_is_back",
  "rec_71": "rec_kelly_is_back",
  "캘리이즈백": "rec_kelly_is_back",
  "rec_castella": "rec_castella",
  "카스텔라": "rec_castella",
  "rec_72": "rec_castella",
  "rec_milkisju": "rec_milkisju",
  "밀키스주": "rec_milkisju",
  "rec_73": "rec_milkisju",
  "암바사주": "rec_milkisju",
  "rec_gojingamlae": "rec_gojingamlae",
  "고진감래주": "rec_gojingamlae",
  "rec_74": "rec_gojingamlae",
  "rec_pocariju": "rec_pocariju",
  "뽕가리스웨트": "rec_pocariju",
  "rec_75": "rec_pocariju",
  "포카리주": "rec_pocariju",
  "rec_energizerju": "rec_energizerju",
  "에너자이저주": "rec_energizerju",
  "rec_76": "rec_energizerju",
  "rec_taegeukju": "rec_taegeukju",
  "태극주": "rec_taegeukju",
  "rec_77": "rec_taegeukju",
  "rec_sowonju": "rec_sowonju",
  "소원주": "rec_sowonju",
  "rec_78": "rec_sowonju",
  "rec_dutch_lager": "rec_dutch_lager",
  "더치 라거": "rec_dutch_lager",
  "rec_79": "rec_dutch_lager",
  "커피맥주": "rec_dutch_lager",
  "rec_melonaju": "rec_melonaju",
  "올때메론주": "rec_melonaju",
  "rec_80": "rec_melonaju",
  "메로나주": "rec_melonaju",
  "rec_jawsbarju": "rec_jawsbarju",
  "상어바주": "rec_jawsbarju",
  "rec_81": "rec_jawsbarju",
  "죠스바주": "rec_jawsbarju",
  "rec_bibibig_makgeolli": "rec_bibibig_makgeolli",
  "단팥 막걸리": "rec_bibibig_makgeolli",
  "rec_82": "rec_bibibig_makgeolli",
  "비비빅 막걸리": "rec_bibibig_makgeolli",
  "rec_kahlua_milk": "rec_kahlua_milk",
  "조선 깔루아 밀크": "rec_kahlua_milk",
  "rec_83": "rec_kahlua_milk",
  "깔루아밀크": "rec_kahlua_milk",
  // [상세 재료 13종 도트 스프라이트 매핑]
  "이천 임금님쌀": "rice",
  "철원 두루미쌀": "rice",
  "김제 황금지평선쌀": "rice",
  "해남 땅끝해풍쌀": "rice",
  "상주 낙동강삼백쌀": "rice",
  "참방울 후레쉬": "soju",
  "두꺼비 이즈백": "soju",
  "처음부터 부드럽게": "soju",
  "부산 파도소주": "soju",
  "제주 화산암반 21": "soju",
  "카아스 프레시": "beer",
  "청정라거 테라피": "beer",
  "더블숙성 켈리포니아": "beer"
};

  const THEME_STORAGE_KEY = 'ksool_icon_theme';
  const VALID_THEMES = ['hd', 'dot', 'emoji'];
  let currentTheme = 'hd'; // Default: 'hd' (고급형태)

  try {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'emoji' || savedTheme === 'dot' || savedTheme === 'hd') {
        currentTheme = savedTheme;
      } else if (savedTheme === 'pixel') {
        // Legacy migration
        currentTheme = 'hd';
      }
    }
  } catch (e) {}

  const THEME_METAS = {
    hd: { key: 'hd', label: '고급형태', icon: '💎', title: '32px 고화질 디테일 아트', badgeText: '💎 고급' },
    dot: { key: 'dot', label: '도트형태', icon: '👾', title: '16px 레트로 클래식 도트', badgeText: '👾 도트' },
    emoji: { key: 'emoji', label: '기본이모지', icon: '✨', title: '순수 유니코드 이모지', badgeText: '✨ 이모지' }
  };

  const PixelIconRegistry = {
    /**
     * Get current icon theme ('hd', 'dot', or 'emoji')
     */
    getTheme: function() {
      return currentTheme;
    },

    /**
     * Get metadata for a theme or current theme
     */
    getThemeMeta: function(theme) {
      const t = theme || currentTheme;
      return THEME_METAS[t] || THEME_METAS.hd;
    },

    /**
     * Set icon theme ('hd', 'dot', or 'emoji')
     */
    setTheme: function(theme) {
      if (theme === 'emoji') {
        currentTheme = 'emoji';
      } else if (theme === 'dot') {
        currentTheme = 'dot';
      } else {
        currentTheme = 'hd';
      }

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
        }
      } catch (e) {}
      return currentTheme;
    },

    /**
     * Toggle cyclically: 'hd' -> 'dot' -> 'emoji' -> 'hd'
     */
    toggleTheme: function() {
      const nextMap = {
        hd: 'dot',
        dot: 'emoji',
        emoji: 'hd'
      };
      const next = nextMap[currentTheme] || 'hd';
      return this.setTheme(next);
    },

    /**
     * Resolve any item or key to its primary sprite key
     */
    resolveKey: function(item) {
      if (!item) return null;
      if (typeof item === 'string' || typeof item === 'number') {
        const str = String(item).trim();
        if (SPRITE_DATA_DOT[str] || SPRITE_DATA_HD[str]) return str;
        if (ALIAS_MAP[str]) return ALIAS_MAP[str];
        if (ALIAS_MAP[item]) return ALIAS_MAP[item];
        // Strip common prefixes
        const clean = str.replace(/^(ing_|rec_)/, '');
        if (SPRITE_DATA_DOT[clean] || SPRITE_DATA_HD[clean]) return clean;
        if (ALIAS_MAP[clean]) return ALIAS_MAP[clean];
        if (SPRITE_DATA_DOT['rec_' + clean] || SPRITE_DATA_HD['rec_' + clean]) return 'rec_' + clean;
        if (SPRITE_DATA_DOT['ing_' + clean] || SPRITE_DATA_HD['ing_' + clean]) return 'ing_' + clean;
        return null;
      }
      
      // Object inspection
      const candidates = [
        item.key,
        item.recipe_id,
        item.ingredient_id,
        item.unlocks_ingredient_id,
        item.id,
        item.display_name,
        item.real_name,
        item.name
      ];

      for (let i = 0; i < candidates.length; i++) {
        const val = candidates[i];
        if (val !== undefined && val !== null) {
          if (ALIAS_MAP[val]) return ALIAS_MAP[val];
          const str = String(val).trim();
          if (ALIAS_MAP[str]) return ALIAS_MAP[str];
        }
      }

      return null;
    },

    /**
     * Get SVG string for the specified item or key
     * @param {string|number|object} item - Item object, ID, or key
     * @param {object} options - { size: 24, className: '', style: '', fallbackEmoji: '', theme: 'hd'|'dot'|'emoji' }
     * @returns {string} SVG HTML string or fallback
     */
    getSvg: function(item, options) {
      const opts = options || {};
      const size = opts.size || 24;
      const cls = opts.className ? ' ' + opts.className : '';
      const extraStyle = opts.style ? ';' + opts.style : '';
      const activeTheme = opts.theme || currentTheme;

      // 1. [기본이모지 모드]
      if (activeTheme === 'emoji') {
        const key = this.resolveKey(item);
        const emoji = (item && typeof item === 'object' && (item.emoji || item.icon))
          || (key && EMOJI_MAP[key])
          || (typeof item === 'string' && EMOJI_MAP[item])
          || opts.fallbackEmoji
          || '🍶';
        return '<span class="k-pixel-icon-fallback' + cls + '" style="display:inline-block;font-size:' + (size * 0.85) + 'px;line-height:1;vertical-align:middle' + extraStyle + '">' + emoji + '</span>';
      }

      const key = this.resolveKey(item);

      // 2. [도트형태 모드] - 16x16 순수 레트로 클래식 도트
      if (activeTheme === 'dot') {
        if (key && SPRITE_DATA_DOT[key]) {
          const sprite = SPRITE_DATA_DOT[key];
          return '<svg class="k-pixel-icon k-theme-dot' + cls + '" viewBox="0 0 16 16" width="' + size + '" height="' + size + '" ' +
                 'style="shape-rendering:crispEdges;image-rendering:pixelated;vertical-align:middle;flex-shrink:0' + extraStyle + '" ' +
                 'aria-label="' + (sprite.name || key) + '">' +
                 sprite.innerSvg +
                 '</svg>';
        }
      }

      // 3. [고급형태 모드] - 32x32 고화질 디테일 아트 (미보유 항목은 DOT 자동 폴백)
      if (activeTheme === 'hd') {
        const sprite = (key && SPRITE_DATA_HD[key]) || (key && SPRITE_DATA_DOT[key]);
        if (sprite) {
          const vb = sprite.viewBox || '0 0 16 16';
          const isHdClass = (key && SPRITE_DATA_HD[key]) ? ' k-theme-hd' : ' k-theme-dot-fallback';
          return '<svg class="k-pixel-icon' + isHdClass + cls + '" viewBox="' + vb + '" width="' + size + '" height="' + size + '" ' +
                 'style="shape-rendering:crispEdges;image-rendering:pixelated;vertical-align:middle;flex-shrink:0' + extraStyle + '" ' +
                 'aria-label="' + (sprite.name || key) + '">' +
                 sprite.innerSvg +
                 '</svg>';
        }
      }

      // Fallback: if emoji is available
      const fallback = (item && typeof item === 'object' && (item.emoji || item.icon)) || (key && EMOJI_MAP[key]) || opts.fallbackEmoji || '🍶';
      return '<span class="k-pixel-icon-fallback' + cls + '" style="display:inline-block;font-size:' + (size * 0.85) + 'px;line-height:1;vertical-align:middle' + extraStyle + '">' + fallback + '</span>';
    },

    /**
     * Render as an HTML wrapper element
     */
    render: function(item, options) {
      return this.getSvg(item, options);
    },

    /**
     * Get Data URL for use in CSS background or src
     */
    getDataUrl: function(item, options) {
      const opts = Object.assign({ size: 48 }, options);
      const svg = this.getSvg(item, opts);
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    },

    /**
     * Check if a sprite exists for the given item
     */
    has: function(item) {
      return !!this.resolveKey(item);
    },

    /**
     * Check if an item has a dedicated 32x32 HD design
     */
    hasHd: function(item) {
      const key = this.resolveKey(item);
      return !!(key && SPRITE_DATA_HD[key]);
    },

        /**
     * Get raw 16x16 Dot sprite definition { key, name, innerSvg } for an item or key
     */
    getDotSprite: function(item) {
      const key = this.resolveKey(item);
      return (key && SPRITE_DATA_DOT[key]) ? SPRITE_DATA_DOT[key] : null;
    },

    /**
     * Get raw 32x32 HD sprite definition { key, name, innerSvg } for an item or key
     */
    getHdSprite: function(item) {
      const key = this.resolveKey(item);
      return (key && SPRITE_DATA_HD[key]) ? SPRITE_DATA_HD[key] : null;
    },

    /**
     * Dynamically register or update a custom sprite at runtime (Dot & HD)
     * @param {object} config - { key, name, dotInnerSvg, hdInnerSvg, aliases }
     */
    registerCustomSprite: function(config) {
      if (!config || !config.key) return false;
      const key = String(config.key).trim();
      const name = config.name || key;
      if (config.dotInnerSvg) {
        SPRITE_DATA_DOT[key] = {
          key: key,
          name: name,
          innerSvg: config.dotInnerSvg
        };
      }
      if (config.hdInnerSvg) {
        SPRITE_DATA_HD[key] = {
          key: key,
          name: name,
          innerSvg: config.hdInnerSvg
        };
      }
      if (Array.isArray(config.aliases)) {
        config.aliases.forEach(a => {
          if (a !== undefined && a !== null) ALIAS_MAP[String(a)] = key;
        });
      }
      ALIAS_MAP[key] = key;
      ALIAS_MAP[name] = key;
      return true;
    },

    /**
     * Get all registered keys
     */
    getAllKeys: function() {
      return Object.keys(SPRITE_DATA_DOT);
    },

    /**
     * Get detailed list of comparisons across all 3 styles
     * @returns {Array<{ key: string, name: string, isHdSpecial: boolean }>}
     */
    getComparisonList: function() {
      const keys = Object.keys(SPRITE_DATA_DOT);
      return keys.map(k => ({
        key: k,
        name: SPRITE_DATA_DOT[k].name || k,
        isHdSpecial: !!SPRITE_DATA_HD[k]
      }));
    }
  };

  // Attach to window.KSool
  window.KSool.PixelIconRegistry = PixelIconRegistry;

  /**
   * Global shorthand helper
   * @param {string|number|object} item
   * @param {number} [size=24]
   * @param {string} [className='']
   * @param {object} [extraOpts={}]
   * @returns {string}
   */
  window.KSool.pixelIcon = function(item, size, className, extraOpts) {
    const opts = Object.assign({ size: size || 24, className: className || '' }, extraOpts);
    return PixelIconRegistry.render(item, opts);
  };

  console.log('[PixelIconRegistry] Initialized with 3 styles: 117 Dot sprites + ' + Object.keys(SPRITE_DATA_HD).length + ' HD sprites.');
})();
