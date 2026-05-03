export interface Style {
  id: string;
  name: string;
  emoji: string;
  description: string;
  keywords: string;
}

export const PRESET_STYLES: Style[] = [
  { id: 'modern_minimalist', name: '现代简约 (Modern Minimalist)', emoji: '🏢', description: '追求极致的简洁与功能性，强调空间感与自然光。', keywords: 'Neutral palette (whites, grays, blacks), clean architectural lines, hidden storage, expansive natural light, open-plan layout, high-quality matte finishes, minimal ornamentation, functional elegance.' },
  { id: 'modern_luxury', name: '现代轻奢 (Modern Luxury)', emoji: '💎', description: '在现代简约基础上，融入高品质材质与精致细节。', keywords: 'Sophisticated materials (Italian marble, brushed brass, velvet), layered ambient lighting, deep textures, metallic accents, designer furniture, rich neutral color palette with jewel-tone accents, refined elegance.' },
  { id: 'italian_highend', name: '意式高定 (Italian High-End)', emoji: '🇮🇹', description: '融合意式美学与顶级工艺，展现极致的艺术格调。', keywords: 'Exquisite Italian craftsmanship, premium leathers, exotic stone surfaces, sculptural furniture silhouettes, dramatic lighting, warm neutral tones, seamless integration of art and architecture.' },
  { id: 'natural_wood', name: '原木风 (Natural Wood)', emoji: '🪵', description: '以木质材料为主，营造温馨、自然、治愈的居住氛围。', keywords: 'Light oak or ash wood textures, linen fabrics, indoor greenery, soft diffused sunlight, warm white walls, organic shapes, breathable space, cozy and serene atmosphere.' },
  { id: 'mid_century_modern', name: '中古风格 (Mid-Century Modern)', emoji: '🪑', description: '复古时尚，色彩丰富，强调经典的几何造型。', keywords: 'Iconic 1950s furniture designs, tapered legs, bold geometric patterns, warm teak or walnut wood, vibrant accent colors (mustard, teal, orange), retro-modern fusion.' },
  { id: 'wabi_sabi', name: '侘寂风 (Wabi-Sabi)', emoji: '🍃', description: '接受不完美之美，强调自然质朴与静谧的禅意。', keywords: 'Raw organic materials, imperfect textures (micro-cement, rough stone), earthy muted tones, minimalist layout, soft natural shadows, weathered wood, linen, sense of profound tranquility and simplicity.' },
  { id: 'nordic_natural', name: '北欧自然 (Nordic Natural)', emoji: '❄️', description: '明亮清爽，简约实用，强调功能与自然的平衡。', keywords: 'Scandi-minimalism, light wood, white walls, pops of muted color, functional furniture, cozy textiles (hygge), large windows, clean and airy environment.' },
  { id: 'creamy_minimalist', name: '极简奶油风 (Creamy Minimalist)', emoji: '☁️', description: '明亮柔和的色调，营造如奶油般丝滑温馨的包裹感。', keywords: 'Monochromatic warm whites, beige and cream tones, rounded furniture edges, soft indirect lighting, bouclé fabrics, minimalist aesthetic with a soft, cozy, and inviting touch.' },
  { id: 'new_chinese', name: '新中式 (New Chinese)', emoji: '🏯', description: '传统中式元素与现代设计的碰撞，清雅脱俗。', keywords: 'Modern interpretation of Chinese motifs, dark wood framing, silk textures, ink-wash art, symmetrical balance, lattice screens, refined oriental palette (vermilion, jade, charcoal), serene elegance.' },
  { id: 'french_romantic', name: '法式浪漫 (French Romantic)', emoji: '🌹', description: '优雅、柔和且富有诗意，强调石膏线与精致软装。', keywords: 'Ornate plaster moldings, herringbone wood floors, soft pastel palette (cream, dusty rose, sage), crystal chandeliers, curved furniture, romantic textiles, airy and luminous feel.' },
  { id: 'french_vintage', name: '法式复古 (French Vintage)', emoji: '🎭', description: '经典怀旧与高雅格调的结合，充满历史底蕴。', keywords: 'Antique brass details, dark wood accents, velvet upholstery, classical art pieces, moody yet elegant lighting, rich color palette (burgundy, forest green, gold), timeless sophistication.' },
  { id: 'zen_oriental', name: '禅意东方 (Zen Oriental)', emoji: '🧘', description: '宁静简约，意境深远，强调虚实结合。', keywords: 'Minimalist Zen aesthetics, bamboo elements, tatami textures, soft paper lamp lighting, natural stone, open meditative spaces, neutral earthy palette, focus on silence and light.' },
  { id: 'american_classic', name: '美式经典 (American Classic)', emoji: '🏛️', description: '稳重大气，色彩饱满，展现经典的美式居家感。', keywords: 'Sturdy dark wood furniture, classical moldings, warm color palette, comfortable leather or fabric seating, symmetrical layouts, traditional patterns, grand and welcoming atmosphere.' },
  { id: 'american_country', name: '美式田园 (American Country)', emoji: '🌾', description: '自然温馨，充满生活气息，强调舒适与休闲。', keywords: 'Floral patterns, distressed wood, warm earthy tones, cozy textiles, rustic decor, natural materials, relaxed and homey feel.' },
  { id: 'industrial_loft', name: '工业硬核 (Industrial Loft)', emoji: '🏭', description: '酷感十足，展现粗犷的都市感与原始材质美。', keywords: 'Exposed brick walls, concrete floors, visible piping, black metal accents, reclaimed wood, large industrial windows, moody lighting, raw and edgy urban aesthetic.' },
  { id: 'mediterranean', name: '地中海风 (Mediterranean)', emoji: '🌊', description: '蓝白清爽，自然明快，展现浪漫的海滨风情。', keywords: 'Blue and white color scheme, arched doorways, textured plaster walls, terracotta tiles, wrought iron details, natural light, breezy and coastal atmosphere.' },
  { id: 'southeast_asian', name: '东南亚风 (South East Asian)', emoji: '🌺', description: '热带风情，色彩浓郁，强调自然材质与异域感。', keywords: 'Dark teak wood, rattan and bamboo textures, tropical greenery, vibrant silk fabrics, intricate carvings, warm ambient lighting, exotic and lush feel.' },
  { id: 'bohemian', name: '波西米亚 (Bohemian)', emoji: '🎪', description: '自由浪漫，艺术感强，强调色彩与纹理的混搭。', keywords: 'Eclectic mix of patterns, macramé details, layered rugs, indoor plants, warm earthy colors with bold accents, vintage finds, artistic and unconventional vibe.' },
  { id: 'bauhaus', name: '包豪斯 (Bauhaus)', emoji: '🎨', description: '几何简约，现代大胆，强调形式追随功能。', keywords: 'Primary colors (red, blue, yellow), geometric shapes, steel tubing furniture, functional design, industrial materials, clean and rational aesthetic.' },
  { id: 'cyberpunk', name: '赛博朋克 (Futuristic/Cyber)', emoji: '🤖', description: '未来科技感，霓虹色彩，展现科幻都市的视觉冲击。', keywords: 'Neon lights (pink, cyan, purple), dark metallic surfaces, futuristic technology elements, high-contrast lighting, urban grit, sci-fi aesthetic.' },
  { id: 'simplified_european', name: '简欧风格 (Simplified European)', emoji: '🏰', description: '优雅大方，明快精致，简化了古典欧式的繁琐。', keywords: 'Light neutral palette, subtle moldings, elegant furniture silhouettes, refined textiles, balanced symmetry, sophisticated and airy European feel.' },
  { id: 'classic_european', name: '古典欧式 (Classic European)', emoji: '👑', description: '华丽宏伟，细节丰富，展现皇室般的尊贵感。', keywords: 'Ornate gold leafing, heavy drapery, classical columns, marble floors, grand chandeliers, rich intricate patterns, majestic and luxurious atmosphere.' },
  { id: 'memphis', name: '孟菲斯 (Memphis)', emoji: '🔷', description: '活泼时尚，几何撞色，挑战传统的视觉趣味。', keywords: 'Bold clashing colors, squiggly lines, geometric patterns, pop art influence, playful and energetic design, unconventional materials.' },
  { id: 'victorian', name: '维多利亚 (Victorian)', emoji: '🎩', description: '华丽复古，装饰感强，展现工业革命时期的精致。', keywords: 'Dark rich colors, intricate woodwork, floral wallpapers, velvet upholstery, antique ornaments, dramatic and highly decorative aesthetic.' }
];

export const PRESET_SPACES = [
  '客厅', '餐客一体', '开放式厨房客厅', '厨房', '开放式厨房', '主人卧室', '客人卧室',
  '儿童房', '卫生间', '阳台', '走道', '杂物间', '书房', '电竞房', '茶室'
];
