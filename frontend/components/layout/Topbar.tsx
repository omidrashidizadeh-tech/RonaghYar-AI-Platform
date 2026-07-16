type TopbarProps = { user: { full_name?: string; plan?: string; daily_usage?: number; }; };

export function Topbar({user}:TopbarProps) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800/70 bg-slate-950/45 p-5 backdrop-blur-xl">
      <div><p className="mb-2 text-xs font-bold tracking-wider text-sky-400">COMMAND CENTER</p><h1 className="text-2xl font-black text-white md:text-3xl">مرکز فرماندهی بازاریابی</h1><p className="mt-2 text-sm text-slate-400">Brand Brain، چند هوش مصنوعی و ابزارهای رشد</p></div>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-2 pl-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 font-black text-white">{(user.full_name || 'ک').slice(0,1)}</div>
        <div><div className="text-sm font-bold text-white">{user.full_name || 'کاربر رونق‌یار'}</div><div className="mt-1 text-xs text-slate-500">{user.plan || 'FREE'} · مصرف امروز: {user.daily_usage ?? 0}</div></div>
      </div>
    </header>
  );
}
