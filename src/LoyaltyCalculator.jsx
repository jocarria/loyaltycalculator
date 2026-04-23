import React, { useMemo, useState } from 'react';
import {
  Wallet,
  ShieldCheck,
  Landmark,
  CreditCard,
  TrendingUp,
  Sparkles,
  RefreshCcw,
  BadgeCheck,
  Info,
  Gift,
  Star,
  Ticket,
  BriefcaseBusiness,
  Crown,
  Trophy,
  Rocket,
} from 'lucide-react';

const LEVELS = [
  { key: 1, name: 'Nivel 1', min: 0, max: 299, nextTarget: 300 },
  { key: 2, name: 'Nivel 2', min: 300, max: 899, nextTarget: 900 },
  { key: 3, name: 'Nivel 3', min: 900, max: Infinity, nextTarget: null },
];

const INITIAL_STATE = {
  paqueteProductos: false,
  acreditacionHaberesMensual: false,
  prestamos: 0,
  debitosAutomaticos: 0,
  segurosMensuales: 0,

  altaHaberes: false,
  altaUpgradePaquete: false,
  altaTarjetaCredito: false,
  altaSeguro: false,

  businessDays: 22,
  saldoVistaArs: 0,
  saldoVistaUsdPesificado: 0,
  inversionesBmArs: 0,
  inversionesBmUsdPesificado: 0,

  consumosTarjetas: 0,
  debitosPagosServiciosRecargas: 0,
};

const TABS = [
  { id: 'tenencia', label: 'Tenencia', icon: Wallet },
  { id: 'altas', label: 'Altas', icon: BadgeCheck },
  { id: 'ahorro', label: 'Ahorrá / Invertí', icon: TrendingUp },
  { id: 'compra', label: 'Comprá y Pagá', icon: CreditCard },
];

const LEVEL_THEME = {
  1: {
    board: 'from-slate-950 via-slate-900 to-blue-950 text-white border-slate-800',
    accent: 'bg-blue-500',
    soft: 'bg-white/10 border-white/10 text-white',
    badge: 'bg-blue-500/20 text-blue-100 border-blue-300/20',
    ring: 'ring-blue-400/30',
    glow: 'shadow-[0_0_0_1px_rgba(96,165,250,.15),0_25px_60px_-20px_rgba(37,99,235,.45)]',
    label: 'Vinculación inicial',
  },
  2: {
    board: 'from-[#0b1537] via-[#1e3a8a] to-[#0f172a] text-white border-blue-800/40',
    accent: 'bg-amber-400',
    soft: 'bg-white/10 border-white/10 text-white',
    badge: 'bg-amber-300/20 text-amber-100 border-amber-200/20',
    ring: 'ring-amber-300/30',
    glow: 'shadow-[0_0_0_1px_rgba(251,191,36,.18),0_25px_60px_-20px_rgba(37,99,235,.45)]',
    label: 'Vinculación media',
  },
  3: {
    board: 'from-[#1a1333] via-[#312e81] to-[#0f172a] text-white border-violet-800/40',
    accent: 'bg-fuchsia-400',
    soft: 'bg-white/10 border-white/10 text-white',
    badge: 'bg-fuchsia-300/20 text-fuchsia-100 border-fuchsia-200/20',
    ring: 'ring-fuchsia-300/30',
    glow: 'shadow-[0_0_0_1px_rgba(217,70,239,.18),0_25px_60px_-20px_rgba(168,85,247,.45)]',
    label: 'Máxima vinculación',
  },
};

const REWARDS_BY_LEVEL = {
  1: [
    {
      category: 'Tus beneficios / ahorros',
      icon: Gift,
      items: [
        { title: 'Gastronomía', description: 'Todos los días con Tarjeta de Crédito · 30% de ahorro · Tope $30.000' },
        { title: 'Supermercados', description: 'Beneficios con MODO en supermercados' },
      ],
    },
  ],
  2: [
    {
      category: 'Tus beneficios / ahorros',
      icon: Gift,
      items: [
        { title: 'Gastronomía', description: 'Todos los días con Tarjeta de Crédito · 30% de ahorro · Tope $60.000' },
        { title: 'Supermercados', description: 'Miércoles con Tarjeta de Crédito · 30% de ahorro · Tope $40.000' },
      ],
    },
    {
      category: 'Tus experiencias',
      icon: Ticket,
      items: [{ title: 'Tickets para espectáculos', description: 'Preventa exclusiva + 6 cuotas sin interés' }],
    },
  ],
  3: [
    {
      category: 'Tus beneficios / ahorros',
      icon: Gift,
      items: [
        { title: 'Gastronomía', description: 'Todos los días con Tarjetas de Crédito y Débito · 30% ahorro · Tope $120.000' },
        { title: 'Turismo by Almundo', description: '12 cuotas sin interés + 30% de ahorro · Tope $300.000' },
      ],
    },
    { category: 'Tus productos', icon: Star, items: [{ title: 'Inversiones', description: 'Plazo fijo con tasa preferencial en canales digitales' }] },
    { category: 'Tu servicio', icon: BriefcaseBusiness, items: [{ title: 'Modelo de atención', description: 'Ejecutivo Macro Selecta + salas VIP' }] },
  ],
};

function parseMoney(value) {
  if (value === '' || value === null || value === undefined) return 0;
  const number = Number(String(value).replace(/,/g, '.'));
  return Number.isFinite(number) ? number : 0;
}

function clamp(value, min = 0, max = Infinity) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-AR').format(Number(value) || 0);
}

function getCurrentLevel(totalPoints) {
  return LEVELS.find((level) => totalPoints >= level.min && totalPoints <= level.max);
}

function getProgress(totalPoints) {
  const current = getCurrentLevel(totalPoints);
  if (!current || current.nextTarget === null) {
    return { currentLevel: current?.name || 'Nivel 3', currentLevelNumber: current?.key || 3, nextLevel: null, missing: 0, progressPct: 100 };
  }
  const range = current.nextTarget - current.min;
  const done = totalPoints - current.min;
  const nextLevelObj = LEVELS.find((level) => level.min === current.nextTarget);
  return {
    currentLevel: current.name,
    currentLevelNumber: current.key,
    nextLevel: nextLevelObj?.name || null,
    missing: current.nextTarget - totalPoints,
    progressPct: Math.max(0, Math.min(100, (done / range) * 100)),
  };
}

function buildActionSuggested(form, results, activeTab) {
  if (!results.nextLevel) {
    return {
      title: 'Cliente en Nivel 3',
      subtitle: 'La prioridad es sostener el vínculo y maximizar uso de beneficios.',
      headline: 'Acción recomendada',
      primary: {
        title: 'Potenciar uso de beneficios premium',
        category: 'Fidelización',
        points: 0,
        finalMessage: 'El cliente ya alcanzó el máximo nivel disponible.',
        message: 'Usá el Nivel 3 como argumento de retención y mayor vinculación.',
      },
    };
  }

  const missing = results.missing;
  if (activeTab === 'compra') {
    return {
      title: `Ruta sugerida hacia ${results.nextLevel}`,
      subtitle: `Faltan ${formatNumber(missing)} puntos para subir.`,
      headline: 'Acción de mayor impacto',
      primary: {
        title: `Concentrar ${formatCurrency(missing * 10000)} en consumos y pagos`,
        category: 'Comprá y Pagá',
        points: missing,
        finalMessage: `Si se ejecuta esta acción, el cliente podría alcanzar ${results.nextLevel}.`,
        message: 'Ruta directa para cerrar brecha por volumen transaccional.',
      },
    };
  }

  const tenenciaAction = !form.acreditacionHaberesMensual
    ? { title: 'Activar acreditación mensual de haberes', category: 'Tenencia', points: 100 }
    : { title: 'Sumar débitos automáticos', category: 'Tenencia', points: 25 };

  return {
    title: `Ruta sugerida hacia ${results.nextLevel}`,
    subtitle: `Faltan ${formatNumber(missing)} puntos para subir.`,
    headline: 'Acción recomendada',
    primary: {
      ...tenenciaAction,
      finalMessage: tenenciaAction.points >= missing
        ? `Si se ejecuta esta acción, el cliente podría alcanzar ${results.nextLevel}.`
        : `Luego de esta acción restarían ${formatNumber(missing - tenenciaAction.points)} puntos.`,
      message: 'Prioriza acciones simples y de alto impacto comercial.',
    },
  };
}

const SectionCard = ({ title, subtitle, children, badge }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {badge ? <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{badge}</span> : null}
    </div>
    {children}
  </div>
);

const StatCard = ({ title, value, helper, icon: Icon }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="rounded-2xl bg-slate-100 p-3 w-fit"><Icon className="h-5 w-5 text-slate-700" /></div>
    <div className="mt-4 text-sm text-slate-500">{title}</div>
    <div className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{value}</div>
    {helper ? <div className="mt-2 text-sm text-slate-500">{helper}</div> : null}
  </div>
);

const SwitchField = ({ label, helper, checked, onChange }) => (
  <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100">
    <div>
      <div className="text-sm font-medium text-slate-900">{label}</div>
      {helper ? <div className="mt-1 text-xs text-slate-500">{helper}</div> : null}
    </div>
    <button type="button" onClick={onChange} className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  </label>
);

const NumberField = ({ label, value, onChange, max, helper }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
    <input type="number" min="0" max={max} value={value} onChange={(e) => onChange(String(clamp(e.target.value, 0, max)))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm" />
    {helper ? <span className="mt-2 block text-xs text-slate-500">{helper}</span> : null}
  </label>
);

const CurrencyField = ({ label, value, onChange }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
    <input type="number" min="0" step="1000" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm" />
  </label>
);

const RewardCategoryCard = ({ category, icon: Icon, items }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-blue-50 p-3"><Icon className="h-5 w-5 text-blue-700" /></div><h4 className="text-base font-semibold text-slate-900">{category}</h4></div>
    <div className="space-y-3">{items.map((item) => <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-sm font-semibold text-slate-900">{item.title}</div><div className="mt-1 text-sm text-slate-600">{item.description}</div></div>)}</div>
  </div>
);

function LoyaltyCalculator() {
  const [form, setForm] = useState(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState('tenencia');
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const results = useMemo(() => {
    const totalTenencia = (form.paqueteProductos ? 25 : 0) + (form.acreditacionHaberesMensual ? 100 : 0) + clamp(form.prestamos, 0, 5) * 25 + clamp(form.debitosAutomaticos, 0, 5) * 25 + clamp(form.segurosMensuales, 0, 5) * 25;
    const totalAltas = (form.altaHaberes ? 200 : 0) + (form.altaUpgradePaquete ? 100 : 0) + (form.altaTarjetaCredito ? 50 : 0) + (form.altaSeguro ? 100 : 0);
    const businessDays = clamp(form.businessDays, 0, 22);
    const totalSaldoDiario = parseMoney(form.saldoVistaArs) + parseMoney(form.saldoVistaUsdPesificado) + parseMoney(form.inversionesBmArs) + parseMoney(form.inversionesBmUsdPesificado);
    const puntosDiariosConTope = Math.min(Math.floor(totalSaldoDiario / 100000), 80);
    const totalAhorro = puntosDiariosConTope * businessDays;
    const totalCompraPaga = parseMoney(form.consumosTarjetas) + parseMoney(form.debitosPagosServiciosRecargas);
    const puntosCompraPaga = Math.floor(totalCompraPaga / 10000);
    const total = totalTenencia + totalAltas + totalAhorro + puntosCompraPaga;
    return { totalTenencia, totalAltas, businessDays, totalSaldoDiario, puntosDiariosConTope, totalAhorro, totalCompraPaga, puntosCompraPaga, total, ...getProgress(total) };
  }, [form]);

  const unlockedRewards = REWARDS_BY_LEVEL[results.currentLevelNumber] || [];
  const unlockedCount = unlockedRewards.reduce((acc, group) => acc + group.items.length, 0);
  const actionSuggested = useMemo(() => buildActionSuggested(form, results, activeTab), [form, results, activeTab]);
  const theme = LEVEL_THEME[results.currentLevelNumber] || LEVEL_THEME[1];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className={`rounded-[32px] border bg-gradient-to-br p-6 ${theme.board} ${theme.glow}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Calculadora de Niveles y Recompensas</h1>
              <p className="mt-2 text-white/80">Puntaje mensual del cliente y próxima acción sugerida.</p>
            </div>
            <button onClick={() => { setForm(INITIAL_STATE); setActiveTab('tenencia'); }} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm"><RefreshCcw className="h-4 w-4" />Resetear</button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className={`rounded-2xl border p-4 ${theme.soft}`}><div className="text-sm">Nivel actual</div><div className="text-2xl font-bold">{results.currentLevel}</div></div>
            <div className={`rounded-2xl border p-4 ${theme.soft}`}><div className="text-sm">Puntos totales</div><div className="text-2xl font-bold">{formatNumber(results.total)} pts</div></div>
            <div className={`rounded-2xl border p-4 ${theme.soft}`}><div className="text-sm">Beneficios activos</div><div className="text-2xl font-bold">{unlockedCount}</div></div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tenencia" value={`${formatNumber(results.totalTenencia)} pts`} helper="Meta 1" icon={Wallet} />
          <StatCard title="Altas" value={`${formatNumber(results.totalAltas)} pts`} helper="Meta 2" icon={ShieldCheck} />
          <StatCard title="Ahorrá / Invertí" value={`${formatNumber(results.totalAhorro)} pts`} helper="Meta 3" icon={Landmark} />
          <StatCard title="Comprá y Pagá" value={`${formatNumber(results.puntosCompraPaga)} pts`} helper="Meta 4" icon={CreditCard} />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{TABS.map((tab) => { const Icon = tab.icon; const isActive = activeTab === tab.id; return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700'}`}><Icon className="h-4 w-4" /><span>{tab.label}</span></button>; })}</div></div>

        {activeTab === 'tenencia' && <SectionCard title="Tenencia mensual" subtitle="Recurrencia mensual" badge="Meta 1"><div className="grid gap-4 md:grid-cols-2"><SwitchField label="Paquete de productos" checked={form.paqueteProductos} onChange={() => update('paqueteProductos', !form.paqueteProductos)} /><SwitchField label="Acreditación de haberes" checked={form.acreditacionHaberesMensual} onChange={() => update('acreditacionHaberesMensual', !form.acreditacionHaberesMensual)} /><NumberField label="Préstamos" value={form.prestamos} onChange={(v) => update('prestamos', v)} max={5} helper="25 pts c/u" /><NumberField label="Débitos automáticos" value={form.debitosAutomaticos} onChange={(v) => update('debitosAutomaticos', v)} max={5} helper="25 pts c/u" /></div></SectionCard>}

        {activeTab === 'altas' && <SectionCard title="Altas" subtitle="Acciones one-shot" badge="Meta 2"><div className="grid gap-4 md:grid-cols-2"><SwitchField label="Alta haberes" checked={form.altaHaberes} onChange={() => update('altaHaberes', !form.altaHaberes)} /><SwitchField label="Upgrade paquete" checked={form.altaUpgradePaquete} onChange={() => update('altaUpgradePaquete', !form.altaUpgradePaquete)} /><SwitchField label="Alta tarjeta crédito" checked={form.altaTarjetaCredito} onChange={() => update('altaTarjetaCredito', !form.altaTarjetaCredito)} /><SwitchField label="Alta seguro" checked={form.altaSeguro} onChange={() => update('altaSeguro', !form.altaSeguro)} /></div></SectionCard>}

        {activeTab === 'ahorro' && <SectionCard title="Ahorrá / Invertí" subtitle="Acumulado diario" badge="Meta 3"><div className="grid gap-4 md:grid-cols-2"><NumberField label="Días hábiles" value={form.businessDays} onChange={(v) => update('businessDays', v)} max={22} /><CurrencyField label="Saldo vista ARS" value={form.saldoVistaArs} onChange={(v) => update('saldoVistaArs', v)} /><CurrencyField label="Saldo vista USD pesificado" value={form.saldoVistaUsdPesificado} onChange={(v) => update('saldoVistaUsdPesificado', v)} /><CurrencyField label="Inversiones ARS" value={form.inversionesBmArs} onChange={(v) => update('inversionesBmArs', v)} /></div><div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><Info className="h-4 w-4 mt-0.5" /> Cada $100.000 diarios equivalen a 1 punto (tope 80/día).</div></SectionCard>}

        {activeTab === 'compra' && <SectionCard title="Comprá y Pagá" subtitle="Volumen mensual" badge="Meta 4"><div className="grid gap-4 md:grid-cols-2"><CurrencyField label="Consumos con tarjetas" value={form.consumosTarjetas} onChange={(v) => update('consumosTarjetas', v)} /><CurrencyField label="Débitos + pagos + recargas" value={form.debitosPagosServiciosRecargas} onChange={(v) => update('debitosPagosServiciosRecargas', v)} /></div></SectionCard>}

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700"><Sparkles className="h-4 w-4" />Acción sugerida</div>
          <h3 className="mt-4 text-xl font-bold text-slate-950">{actionSuggested.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{actionSuggested.subtitle}</p>
          <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/40 p-4">
            <div className="text-sm font-semibold text-slate-900">{actionSuggested.primary.title}</div>
            <div className="mt-1 text-sm text-slate-600">{actionSuggested.primary.finalMessage}</div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">{unlockedRewards.map((group) => <RewardCategoryCard key={group.category} {...group} />)}</div>
      </div>
    </div>
  );
}

export default LoyaltyCalculator;
