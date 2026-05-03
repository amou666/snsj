import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'interior.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
    initTables(db);
    seedData(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    -- ========== AUTH & CREDITS ==========
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'user',
      credits INTEGER NOT NULL DEFAULT 0,
      plan_id INTEGER,
      onboarded INTEGER NOT NULL DEFAULT 0,
      last_active_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS credits_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      type TEXT NOT NULL,
      tool_key TEXT,
      request_id TEXT,
      model_used TEXT,
      status TEXT NOT NULL DEFAULT 'success',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_no TEXT NOT NULL UNIQUE,
      plan_id INTEGER,
      amount REAL NOT NULL,
      credits INTEGER NOT NULL,
      payment_method TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      paid_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- ========== AI CONFIG ==========
    CREATE TABLE IF NOT EXISTS model_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      model_id TEXT NOT NULL,
      type TEXT NOT NULL,
      api_key TEXT NOT NULL,
      api_base_url TEXT NOT NULL DEFAULT 'https://api.apiyi.com/v1/chat/completions',
      credits_per_call INTEGER NOT NULL DEFAULT 1,
      timeout_ms INTEGER NOT NULL DEFAULT 60000,
      max_tokens INTEGER NOT NULL DEFAULT 16384,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tool_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool_key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      emoji TEXT NOT NULL DEFAULT '🛠',
      color TEXT NOT NULL DEFAULT 'indigo',
      workbench TEXT DEFAULT 'realistic',
      has_analysis INTEGER NOT NULL DEFAULT 1,
      has_generation INTEGER NOT NULL DEFAULT 1,
      default_model_id TEXT,
      default_system_prompt TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS generation_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tool_key TEXT NOT NULL,
      project_id INTEGER,
      request_id TEXT NOT NULL UNIQUE,
      model_used TEXT NOT NULL,
      input_image TEXT,
      output_image TEXT,
      style TEXT,
      prompt_used TEXT,
      credits_charged INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'success',
      error TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      record_id INTEGER,
      original_image TEXT,
      result_image TEXT NOT NULL,
      tool_key TEXT,
      style TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- ========== PROJECT MANAGEMENT ==========
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      client_name TEXT,
      client_phone TEXT,
      client_wechat TEXT,
      client_email TEXT,
      address TEXT,
      building_name TEXT,
      area REAL,
      house_type TEXT,
      budget_min REAL,
      budget_max REAL,
      stage TEXT DEFAULT 'client_filing',
      priority TEXT DEFAULT 'normal',
      deadline DATE,
      source TEXT,
      tags TEXT,
      status TEXT DEFAULT 'active',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS project_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'designer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS project_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      folder_path TEXT NOT NULL DEFAULT '/',
      filename TEXT NOT NULL,
      file_type TEXT,
      file_data TEXT,
      file_size INTEGER,
      version INTEGER DEFAULT 1,
      description TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS project_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assignee_id INTEGER,
      task_type TEXT,
      due_date DATE,
      priority TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'todo',
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS project_communications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      channel TEXT,
      summary TEXT NOT NULL,
      detail TEXT,
      action_taken TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS project_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      milestone TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      paid_at DATETIME,
      payment_method TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS design_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL UNIQUE,
      rooms TEXT,
      style_preferences TEXT,
      functional_needs TEXT,
      special_requirements TEXT,
      family_members TEXT,
      lifestyle_info TEXT,
      reference_images TEXT,
      ai_report TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- ========== PLANS & BILLING ==========
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price_monthly REAL,
      price_yearly REAL,
      credits_per_month INTEGER DEFAULT 0,
      max_projects INTEGER DEFAULT 3,
      max_members INTEGER DEFAULT 1,
      max_storage_mb INTEGER DEFAULT 100,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========== HELP & CONTENT ==========
    CREATE TABLE IF NOT EXISTS help_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT,
      content TEXT NOT NULL,
      cover_image TEXT,
      sort_order INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ========== AI CHAT ==========
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      tool_key TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- ========== NOTIFICATIONS ==========
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'system',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- ========== SYSTEM SETTINGS ==========
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedData(db: Database.Database) {
  // Seed admin user
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@qq.com');
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('Amou12345600', 10);
    db.prepare('INSERT INTO users (email, password, name, role, credits) VALUES (?, ?, ?, ?, ?)').run(
      'admin@qq.com', hash, '管理员', 'admin', 99999
    );
  }

  // Seed model configs
  const modelCount = (db.prepare('SELECT COUNT(*) as count FROM model_configs').get() as any).count;
  if (modelCount === 0) {
    const insertModel = db.prepare(`
      INSERT INTO model_configs (name, model_id, type, api_key, api_base_url, credits_per_call, timeout_ms, max_tokens)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertModel.run('Nano Banana 2', 'nano-banana-2', 'analysis',
      process.env.AI_API_KEY_NANO_BANANA_2 || '',
      'https://api.apiyi.com/v1/chat/completions', 1, 60000, 16384);
    insertModel.run('Nano Banana Pro', 'nano-banana-pro', 'generation',
      process.env.AI_API_KEY_NANO_BANANA_PRO || '',
      'https://api.apiyi.com/v1/chat/completions', 1, 150000, 16384);
  }

  // Seed tool configs (merged workbench structure)
  const toolCount = (db.prepare('SELECT COUNT(*) as count FROM tool_configs').get() as any).count;
  if (toolCount === 0) {
    const insertTool = db.prepare(`
      INSERT INTO tool_configs (tool_key, name, description, emoji, color, workbench, has_analysis, has_generation, default_model_id, default_system_prompt, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tools = [
      { key: 'bw-to-color', name: '黑白转彩色', desc: '上传黑白户型图，AI 自动识别房间功能并生成彩色平面图', emoji: '🎨', color: 'indigo', wb: 'floorplan', has_a: 1, has_g: 1, model: 'nano-banana-2',
        prompt: 'You are a professional interior designer AI assistant specialized in floor plan colorization.', sort: 1 },
      { key: 'color-to-3d', name: '彩色转3D', desc: '上传彩色平面图，AI 生成 3D 透视效果图', emoji: '📐', color: 'purple', wb: 'floorplan', has_a: 1, has_g: 1, model: 'nano-banana-2',
        prompt: 'You are a professional interior designer AI specialized in converting 2D floor plans into realistic 3D interior visualizations.', sort: 2 },
      { key: 'rough-to-real', name: '毛坯转实拍', desc: '上传毛坯房实拍照片，AI 生成精装修后的实景效果图', emoji: '🏗️', color: 'amber', wb: 'realistic', has_a: 1, has_g: 1, model: 'nano-banana-2',
        prompt: 'CRITICAL: You are a renovation AI. When provided with a reference image, you are strictly FORBIDDEN from copying its room structure or layout. You may ONLY borrow style, furniture designs, colors, and materials. The original image\'s architectural structure must remain 100% unchanged. Always generate and return an image.', sort: 3 },
      { key: 'color-to-real', name: '平面转实拍', desc: '上传平面图，AI 生成逼真的室内实景效果图', emoji: '🖼️', color: 'emerald', wb: 'realistic', has_a: 1, has_g: 1, model: 'nano-banana-2',
        prompt: 'You are a professional interior designer AI specialized in transforming 2D floor plans into photorealistic interior photographs.', sort: 4 },
      { key: 'model-3d-to-real', name: '3D转实拍', desc: '上传 3D 渲染图，AI 生成照片级真实感效果图', emoji: '🧊', color: 'cyan', wb: 'realistic', has_a: 1, has_g: 1, model: 'nano-banana-2',
        prompt: 'You are a professional interior designer AI specialized in converting 3D renderings into photorealistic interior photographs.', sort: 5 },
      { key: 'space-decompose', name: '空间拆解', desc: '上传室内图片，AI 自动识别并拆解空间中的所有设计元素', emoji: '🔍', color: 'red', wb: 'analyze', has_a: 1, has_g: 0, model: 'nano-banana-2',
        prompt: 'You are an interior design analysis AI. Analyze the provided interior image and identify all design elements, materials, furniture, colors, and spatial characteristics. Provide a detailed breakdown.', sort: 6 },
      { key: 'layout-plan', name: '布局规划', desc: '基于平面图生成多种空间布局方案', emoji: '📐', color: 'indigo', wb: 'assistant', has_a: 1, has_g: 0, model: 'nano-banana-2',
        prompt: 'You are an interior design layout planning AI. Analyze the space and propose optimal furniture layouts considering traffic flow, functionality, and aesthetics.', sort: 7 },
      { key: 'material-recommend', name: '选材推荐', desc: 'AI 分析空间风格并推荐匹配的装修材料', emoji: '🪵', color: 'amber', wb: 'assistant', has_a: 1, has_g: 1, model: 'nano-banana-2',
        prompt: 'You are a professional interior materials consultant AI. Recommend suitable materials, finishes, and products based on the design style and requirements.', sort: 8 },
      { key: 'budget-estimate', name: '预算估算', desc: '基于选材和面积自动估算装修预算', emoji: '💰', color: 'emerald', wb: 'assistant', has_a: 1, has_g: 0, model: 'nano-banana-2',
        prompt: 'You are a construction budget estimation AI. Provide detailed budget estimates based on the area, materials, and design requirements.', sort: 9 },
      { key: 'construction-drawing', name: '施工图生成', desc: '基于效果图生成天花/灯具/插座等施工图', emoji: '📋', color: 'purple', wb: 'detail', has_a: 1, has_g: 1, model: 'nano-banana-2',
        prompt: 'You are a technical drawing AI specialized in generating construction drawings from interior design images.', sort: 10 },
      { key: 'panorama-generate', name: '全景图生成', desc: '生成 360° 全景效果图用于 VR 预览', emoji: '🌐', color: 'cyan', wb: 'detail', has_a: 1, has_g: 0, model: 'nano-banana-2',
        prompt: 'You are a panoramic visualization AI. Generate immersive 360° panoramic descriptions for VR preview from interior design images.', sort: 11 },
    ];
    for (const t of tools) {
      insertTool.run(t.key, t.name, t.desc, t.emoji, t.color, t.wb, t.has_a, t.has_g, t.model, t.prompt, t.sort);
    }
  }

  // Seed plans
  const planCount = (db.prepare('SELECT COUNT(*) as count FROM plans').get() as any).count;
  if (planCount === 0) {
    const insertPlan = db.prepare('INSERT INTO plans (name, price_monthly, price_yearly, credits_per_month, max_projects, max_members, max_storage_mb, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    insertPlan.run('免费版', 0, null, 0, 3, 1, 100, 1);
    insertPlan.run('专业版', 299, 2999, 500, 50, 3, 2048, 2);
    insertPlan.run('企业版', 899, 8999, 2000, 0, 10, 10240, 3);
  }

  // Seed system settings
  const settingsCount = (db.prepare('SELECT COUNT(*) as count FROM system_settings').get() as any).count;
  if (settingsCount === 0) {
    const insertSetting = db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)');
    insertSetting.run('analysis_credits', '1');
    insertSetting.run('generation_credits', '1');
    insertSetting.run('site_name', 'InteriorAI');
    insertSetting.run('site_description', 'AI 室内设计工作台');
    insertSetting.run('contact_email', 'support@interiorai.com');
    insertSetting.run('contact_phone', '');
  }
}
