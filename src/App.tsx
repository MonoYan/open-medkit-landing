import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import {
  ArrowUpRight,
  BellRing,
  Bot,
  Boxes,
  Command,
  Database,
  Eye,
  Lock,
  Pill,
  Plug2,
  ScanSearch,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  Brain
} from 'lucide-react';

type IconComponent = typeof Sparkles;

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

interface CardItem {
  title: string;
  description: string;
  icon: IconComponent;
}

const featureCards: CardItem[] = [
  {
    title: '智能录入',
    description: '一句话描述或拍张药品包装照，AI 自动拆解名称、规格、数量、有效期和位置，无需手动填表。',
    icon: Sparkles,
  },
  {
    title: '一句话检索',
    description: '像聊天一样提问库存状态，快速知道有没有退烧药、谁快过期、什么放在抽屉最里层。',
    icon: Search,
  },
  {
    title: '自动过期提醒',
    description: '即将到期和已经过期的药品会被高亮标记，Telegram / Discord / Lark 推送让家庭药箱保持始终在线。',
    icon: BellRing,
  },
  {
    title: '兼容任意模型',
    description: '只要支持 OpenAI 风格接口，就能接入 OpenAI、DeepSeek、Ollama 或你自己的网关。',
    icon: Bot,
  },
];

const workflowSteps = [
  {
    title: '把杂乱描述交给 AI',
    description: '输入“布洛芬 300mg，两盒，明年 3 月到期”或直接拍张包装照，OpenMedKit 会自动生成结构化字段录入系统。',
  },
  {
    title: '按家庭视角整理库存',
    description: '把药品分类到常备药、维生素、儿童用药或具体位置，整个药箱一眼就能读懂。',
  },
  {
    title: '按风险优先处理',
    description: '库存、过期、提醒三个维度同时呈现，下一次要补货还是清理旧药都更明确。',
  },
];

interface HeroCapability {
  text: string;
  icon: IconComponent;
  mono?: boolean;
}

interface HeroCapabilityGroup {
  title: string;
  countLabel: string;
  tone: 'warm' | 'tech';
  items: HeroCapability[];
}

const heroCapabilityGroups: HeroCapabilityGroup[] = [
  {
    title: '日常体验',
    countLabel: '5 项高频能力',
    tone: 'warm',
    items: [
      { text: '自然语言录入', icon: Sparkles },
      { text: '拍照识别', icon: ScanSearch },
      { text: '对话式检索', icon: Search },
      { text: '分类与筛选', icon: SlidersHorizontal },
      { text: '过期提醒', icon: BellRing },
    ],
  },
  {
    title: '系统能力',
    countLabel: '6 项可控特性',
    tone: 'tech',
    items: [
      { text: 'MCP Server', icon: Plug2, mono: true },
      { text: 'SQLite 存储', icon: Database, mono: true },
      { text: 'OpenClaw Skill 调用', icon: Brain, mono: true },
      { text: '自部署可控', icon: Lock, mono: true },
      { text: 'OpenAI 兼容', icon: Bot, mono: true },
      { text: 'Telegram / Discord / Lark 推送', icon: Send, mono: true },
    ],
  },
];

const mcpClients = [
  { name: 'Claude Code', detail: '.mcp.json 自动识别' },
  { name: 'Cursor', detail: '全局 / 项目级配置' },
  { name: 'Claude Desktop', detail: 'Desktop config 接入' },
  { name: 'OpenClaw', detail: 'Skill 系统调用' },
];

const MCP_CONFIG = `{
  "mcpServers": {
    "open-medkit": {
      "command": "npx",
      "args": ["tsx", "backend/src/mcp-server.ts"],
      "env": {
        "DB_PATH": "./backend/data/medicine.db"
      }
    }
  }
}`;

const mcpExamples = [
  { cmd: '帮我加个布洛芬缓释胶囊', tool: 'add_medicine' },
  { cmd: '有没有快过期的药？', tool: 'list_medicines' },
  { cmd: '把创可贴数量改成 15 片', tool: 'update_medicine' },
  { cmd: '药箱统计看看', tool: 'get_stats' },
];

const mcpToolNames = [
  'list_medicines',
  'get_medicine',
  'add_medicine',
  'update_medicine',
  'delete_medicine',
  'get_stats',
  'search_medicines',
];

const deployCards = [
  {
    title: 'Docker 部署',
    detail: '推荐方式。配置环境变量后直接启动，SQLite 数据和通知能力都保留在你可控的环境里。',
    command: 'cp .env.example .env\ndocker compose up -d',
    icon: Boxes,
  },
  {
    title: '本地开发',
    detail: '前端 React 18 + Vite，后端 Hono + TypeScript，方便继续改界面、接模型或扩展提醒渠道。',
    command: 'npm install\nnpm run dev',
    icon: Command,
  },
];

const principles: CardItem[] = [
  {
    title: '本地优先',
    description: '药品库存默认保存在你的 SQLite 数据库中，不把家庭信息默认托管到第三方平台。',
    icon: Database,
  },
  {
    title: '可控上传',
    description: '只有在启用 AI 解析或聊天时，提交的文本才会发送到你配置的模型服务。',
    icon: Lock,
  },
  {
    title: '开源透明',
    description: '前后端代码完全开源，任何人都可以审计数据流向和 AI 调用逻辑，没有隐藏的数据收集。',
    icon: Eye,
  },
  {
    title: '为家庭场景设计',
    description: '它不是诊疗工具，而是帮助你更稳地管理药箱、减少遗忘与误用风险的日常助手。',
    icon: Pill,
  },
];

function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

function BrandMark() {
  return <img className="brand-mark" src="/medkit-icon-rounded.png" alt="" aria-hidden="true" />;
}

/** X (Twitter) logo — inline SVG for brand-accurate mark */
function XLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

/* ---- Animated Add-Medicine Demo ---- */

const DEMO_INPUT =
  '布洛芬缓释胶囊，0.3g×20粒，2027-06-18，客厅抽屉，备注：芬必得牌，企业名称：中美天津史克制药有限公司';
const DEMO_STREAM = [
  '{',
  '  "name": "布洛芬缓释胶囊",',
  '  "name_en": "Ibuprofen SR Capsules",',
  '  "spec": "0.3g×20粒/盒",',
  '  "quantity": "1盒",',
  '  "expires_at": "2027-06-18",',
  '  "category": "解热镇痛",',
  '  "usage_desc": "退烧、止痛、抗炎",',
  '  "location": "客厅抽屉",',
  '  "notes": "芬必得牌，中美天津史克制药有限公司"',
  '}',
].join('\n');

const DEMO_CARD_INFO = { name: '布洛芬缓释胶囊', en: 'Ibuprofen SR Capsules', exp: '2027/06/18' };
const DEMO_GRID: { k: string; l: string; v: string; w?: boolean }[] = [
  { k: 'spec', l: '规格', v: '0.3g×20粒/盒' },
  { k: 'qty', l: '剩余数量', v: '1盒' },
  { k: 'cat', l: '分类', v: '解热镇痛' },
  { k: 'loc', l: '存放位置', v: '客厅抽屉' },
  { k: 'use', l: '用途 / 适应症', v: '退烧、止痛、抗炎', w: true },
  { k: 'notes', l: '备注', v: '芬必得牌，中美天津史克制药有限公司', w: true },
];
const FILL_SEQ = ['name', 'en', 'exp', 'spec', 'qty', 'cat', 'loc', 'use', 'notes'];

type DemoPhase =
  | 'idle'
  | 'typing'
  | 'clicked'
  | 'streaming'
  | 'done'
  | 'collapsing'
  | 'filling'
  | 'complete'
  | 'fadeout';

function AddMedicineDemo() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [chars, setChars] = useState(0);
  const [sChars, setSChars] = useState(0);
  const [filled, setFilled] = useState<Set<string>>(new Set());
  const tm = useRef<ReturnType<typeof setTimeout>>();
  const iv = useRef<ReturnType<typeof setInterval>>();

  const reset = useCallback(() => {
    setPhase('idle');
    setChars(0);
    setSChars(0);
    setFilled(new Set());
  }, []);

  useEffect(() => {
    clearTimeout(tm.current);
    clearInterval(iv.current);

    switch (phase) {
      case 'idle':
        tm.current = setTimeout(() => setPhase('typing'), 600);
        break;
      case 'typing': {
        let i = 0;
        iv.current = setInterval(() => {
          if (++i > DEMO_INPUT.length) {
            clearInterval(iv.current!);
            tm.current = setTimeout(() => setPhase('clicked'), 500);
            return;
          }
          setChars(i);
        }, 55);
        break;
      }
      case 'clicked':
        tm.current = setTimeout(() => setPhase('streaming'), 500);
        break;
      case 'streaming': {
        let i = 0;
        iv.current = setInterval(() => {
          i += 3;
          if (i >= DEMO_STREAM.length) {
            clearInterval(iv.current!);
            setSChars(DEMO_STREAM.length);
            tm.current = setTimeout(() => setPhase('done'), 400);
            return;
          }
          setSChars(i);
        }, 18);
        break;
      }
      case 'done':
        tm.current = setTimeout(() => setPhase('collapsing'), 1200);
        break;
      case 'collapsing':
        tm.current = setTimeout(() => setPhase('filling'), 450);
        break;
      case 'filling': {
        let i = 0;
        iv.current = setInterval(() => {
          if (i >= FILL_SEQ.length) {
            clearInterval(iv.current!);
            tm.current = setTimeout(() => setPhase('complete'), 500);
            return;
          }
          const key = FILL_SEQ[i];
          setFilled((p) => new Set([...p, key]));
          i++;
        }, 180);
        break;
      }
      case 'complete':
        tm.current = setTimeout(() => setPhase('fadeout'), 4000);
        break;
      case 'fadeout':
        tm.current = setTimeout(reset, 700);
        break;
    }

    return () => {
      clearTimeout(tm.current);
      clearInterval(iv.current);
    };
  }, [phase, reset]);

  const showStream = phase === 'streaming' || phase === 'done' || phase === 'collapsing';
  const showCard = phase === 'filling' || phase === 'complete' || phase === 'fadeout';
  const isStep2 = showStream || showCard;

  return (
    <div className="hero-demo" aria-label="Open MedKit 添加药品流程演示">
      <div className="hero-demo__halo hero-demo__halo--one" />
      <div className="hero-demo__halo hero-demo__halo--two" />

      <div className={`demo-frame${phase === 'fadeout' ? ' demo-frame--fade' : ''}`}>
        {/* Window chrome */}
        <div className="demo-chrome">
          <div className="demo-dots">
            <i />
            <i />
            <i />
          </div>
          <span>添加药品</span>
        </div>

        {/* Step tabs */}
        <div className="demo-tabs">
          <div className={`demo-tab${!isStep2 ? ' demo-tab--on' : ' demo-tab--done'}`}>
            <b>1</b>输入描述
          </div>
          <div className={`demo-tab${isStep2 ? ' demo-tab--on' : ''}`}>
            <b>2</b>核对信息
          </div>
        </div>

        {/* Body */}
        <div className="demo-body">
          {/* Step 1 — text input */}
          {!showCard && !showStream && (
            <div className="demo-input-area">
              <div className="demo-input-label">
                <i />
                输入药品描述
              </div>
              <div className="demo-textarea">
                <span>{DEMO_INPUT.slice(0, chars)}</span>
                {phase === 'typing' && <span className="demo-caret" />}
              </div>
              {chars > 0 && (
                <div className="demo-input-foot">
                  <span className={`demo-btn${phase === 'clicked' ? ' demo-btn--press' : ''}`}>
                    <Sparkles size={13} /> AI 解析
                  </span>
                </div>
              )}
            </div>
          )}

          {/* AI stream box */}
          {showStream && (
            <div
              className={`demo-stream${phase === 'collapsing' ? ' demo-stream--collapse' : ''}`}
            >
              <div className="demo-stream__hd">
                <span
                  className={`demo-stream__dot${phase !== 'streaming' ? ' demo-stream__dot--ok' : ''}`}
                />
                {phase === 'streaming' ? 'AI 正在解析' : 'AI 解析完成'}
              </div>
              <div className="demo-stream__body">
                {DEMO_STREAM.slice(0, sChars)}
                {phase === 'streaming' && <span className="demo-caret demo-caret--vi" />}
              </div>
            </div>
          )}

          {/* Medicine preview card */}
          {showCard && (
            <div className="demo-card">
              <div className="demo-card__hd">
                <div className="demo-card__icon">
                  <Pill size={15} />
                </div>
                <div className="demo-card__titles">
                  <div className="demo-card__name">
                    {filled.has('name') ? (
                      DEMO_CARD_INFO.name
                    ) : (
                      <span className="demo-sk demo-sk--lt" style={{ width: 96 }} />
                    )}
                  </div>
                  <div className="demo-card__en">
                    {filled.has('en') ? (
                      DEMO_CARD_INFO.en
                    ) : (
                      <span className="demo-sk demo-sk--lt" style={{ width: 64 }} />
                    )}
                  </div>
                </div>
                <div className="demo-card__exp">
                  {filled.has('exp') ? (
                    `有效期 ${DEMO_CARD_INFO.exp}`
                  ) : (
                    <span className="demo-sk demo-sk--lt" style={{ width: 80 }} />
                  )}
                </div>
              </div>
              <div className="demo-card__grid">
                {DEMO_GRID.map((f) => (
                  <div key={f.k} className={`demo-card__cell${f.w ? ' demo-card__cell--w' : ''}`}>
                    <div className="demo-card__lbl">{f.l}</div>
                    <div className="demo-card__val">
                      {filled.has(f.k) ? (
                        f.v
                      ) : (
                        <span className="demo-sk" style={{ width: f.w ? '90%' : 64 }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hero-demo__caption">实时演示 · 自动循环</div>
    </div>
  );
}

export default function App() {
  return (
    <div className="page-shell">
      <div className="page-noise" aria-hidden="true" />
      <header className="site-header">
        <div className="container site-header__inner">
          <a className="brand" href="#top" aria-label="Open MedKit Home">
            <BrandMark />
            <div>
              <strong>OpenMedKit</strong>
              <span>AI 家庭药箱管理工具</span>
            </div>
          </a>

          <nav className="site-nav" aria-label="主导航">
            <a href="#features">亮点</a>
            <a href="#workflow">流程</a>
            <a href="#mcp">MCP</a>
            <a href="#deploy">部署</a>
            <a href="#privacy">隐私</a>
          </nav>

          <a
            className="button button--ghost"
            href="https://github.com/MonoYan/open-medkit"
            target="_blank"
            rel="noreferrer"
          >
            查看 GitHub
            <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="container hero-layout">
            <div className="hero-copy">
              <div className="hero-copy__intro">
                <Tag>Open-source · Self-hosted · MCP Agent · OpenAI Compatible</Tag>
              </div>

              <h1>
                <span className="hero-copy__line">对着药箱说句话，</span>
                <span className="hero-copy__line">剩下的交给 AI。</span>
              </h1>
              <p className="hero-copy__lead">
                OpenMedKit 把家庭药箱管理从“翻抽屉 + 填表单”变成自然对话。你负责描述或拍照，AI
                负责录入、检索、分类和提醒，让库存状态始终清晰可见。
              </p>

              <div className="hero-actions">
                <a
                  className="button button--primary"
                  href="https://github.com/MonoYan/open-medkit"
                  target="_blank"
                  rel="noreferrer"
                >
                  立即查看项目
                  <ArrowUpRight size={18} />
                </a>
                <a className="button button--secondary" href="#features">
                  看核心亮点
                </a>
              </div>

              <div className="hero-cap-panel" aria-label="核心能力">
                <div className="hero-cap-panel__header">
                  <span className="hero-cap-panel__eyebrow">核心能力</span>
                </div>

                <div className="hero-cap-groups">
                  {heroCapabilityGroups.map((group) => (
                    <section key={group.title} className={`hero-cap-group hero-cap-group--${group.tone}`}>
                      <div className="hero-cap-group__header">
                        <span className="hero-cap-group__title">{group.title}</span>
                        <span className="hero-cap-group__count">{group.countLabel}</span>
                      </div>

                      <div className="hero-cap-group__grid">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <span
                              key={item.text}
                              className={[
                                'hero-cap',
                                group.tone === 'tech' ? 'hero-cap--tech' : '',
                                item.mono ? 'hero-cap--mono' : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                            >
                              <span className="hero-cap__icon">
                                <Icon size={16} strokeWidth={1.8} />
                              </span>
                              <span className="hero-cap__label">{item.text}</span>
                            </span>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>

            <AddMedicineDemo />
          </div>
        </section>

        <section className="section-block" id="features">
          <div className="container">
            <SectionHeading
              eyebrow="Product Highlights"
              title="熟悉的药箱场景，用更聪明的交互方式重做"
              description="暖色基调和高信息密度，表达更聚焦，让人一眼就能理解它解决的家庭药箱问题。"
            />

            <div className="card-grid">
              {featureCards.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="feature-card">
                    <div className="feature-card__icon">
                      <Icon size={20} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-block section-block--contrast" id="workflow">
          <div className="container workflow-layout">
            <SectionHeading
              eyebrow="How It Works"
              title="从一句描述到一整套库存视图，交互链路尽量短"
              description="超级方便的交互链路，让你快速上手使用。"
            />

            <div className="workflow-cards">
              {workflowSteps.map((step, index) => (
                <article key={step.title} className="workflow-card">
                  <span className="workflow-card__index">0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block" id="mcp">
          <div className="container">
            <SectionHeading
              eyebrow="MCP Integration"
              title="终端里说句话，药品就入库"
              description="内置 MCP Server，让 Claude Code、Cursor 等 AI 客户端直接调用工具管理药箱——不需要打开浏览器。"
            />

            <div className="mcp-panel">
              <div className="mcp-panel__left">
                <div className="mcp-clients">
                  {mcpClients.map((c) => (
                    <div key={c.name} className="mcp-client">
                      <Terminal size={16} />
                      <div>
                        <strong>{c.name}</strong>
                        <span>{c.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mcp-stats-row">
                  <span className="mcp-badge">7 tools</span>
                  <span className="mcp-badge">2 resources</span>
                  <span className="mcp-badge">stdio transport</span>
                </div>

                <div className="mcp-tool-list">
                  {mcpToolNames.map((t) => (
                    <code key={t} className="mcp-tool-name">{t}</code>
                  ))}
                </div>
              </div>

              <div className="mcp-panel__right">
                <div className="mcp-code-block">
                  <div className="mcp-code-chrome">
                    <div className="demo-dots"><i /><i /><i /></div>
                    <span>.mcp.json</span>
                  </div>
                  <pre className="mcp-code-body">{MCP_CONFIG}</pre>
                </div>

                <div className="mcp-examples">
                  <div className="mcp-examples__hd">
                    <Plug2 size={13} />
                    对话示例
                  </div>
                  {mcpExamples.map((ex) => (
                    <div key={ex.cmd} className="mcp-example">
                      <span className="mcp-example__cmd">&gt; {ex.cmd}</span>
                      <span className="mcp-example__tool">{ex.tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-block" id="deploy">
          <div className="container">
            <SectionHeading
              eyebrow="Setup & Extend"
              title="部署和二次开发都足够直接"
              description="无论你是想先给家里用起来，还是准备继续增加功能或界面，都可以从一个清晰的起点开始。"
            />

            <div className="deploy-grid">
              {deployCards.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="deploy-card">
                    <div className="deploy-card__header">
                      <div className="feature-card__icon">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.detail}</p>
                      </div>
                    </div>
                    <pre>{item.command}</pre>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-block section-block--soft" id="privacy">
          <div className="container">
            <SectionHeading
              eyebrow="Privacy & Safety"
              title="对家庭药箱来说，安心感和易用性同样重要"
              description="从默认存储方式到 AI 调用边界，产品把数据去向和使用场景尽量讲清楚。"
            />

            <div className="principle-grid">
              {principles.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="principle-card">
                    <div className="feature-card__icon">
                      <Icon size={20} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-block">
          <div className="container">
            <div className="cta-panel">
              <div>
                <span className="eyebrow">OpenMedKit</span>
                <h2>从一句话录入开始，把家庭药箱整理成可搜索的系统。</h2>
                <p>
                  OpenMedKit 适合解决家里药品杂乱、快过期和找不到的问题。内置 MCP Server，还能让 AI 客户端直接管药箱。
                </p>
              </div>

              <div className="cta-panel__actions">
                <a
                  className="button button--primary"
                  href="https://github.com/MonoYan/open-medkit"
                  target="_blank"
                  rel="noreferrer"
                >
                  去看主项目
                  <ArrowUpRight size={18} />
                </a>
                <a className="button button--secondary" href="#top">
                  返回顶部
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div className="site-footer__brand">
            <BrandMark />
            <div>
              <strong>OpenMedKit</strong>
              <span>家庭药箱管理，不必再像做库存盘点一样费劲。</span>
            </div>
          </div>

          <div className="site-footer__meta">
            <div className="site-footer__links-row">
              <a href="https://github.com/MonoYan/open-medkit" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="#mcp">MCP 接入</a>
              <a href="#privacy">隐私说明</a>
              <a href="#deploy">部署方式</a>
            </div>
            <div className="site-footer__author-row">
              <span className="site-footer__author-label"></span>
              <a
                className="site-footer__x-link"
                href="https://x.com/sensh85"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="作者 sensh85（X）"
              >
                <XLogo className="site-footer__x-icon" />
                <span className="site-footer__x-handle">sensh85</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
