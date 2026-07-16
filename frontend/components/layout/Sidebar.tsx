'use client';

type SidebarProps = { view: string; onNavigate: (view: string) => void; };

const navigation = [
  {key:'studio', label:'استودیو', icon:'✦'},
  {key:'brand', label:'Brand Brain', icon:'◈'},
  {key:'library', label:'کتابخانه و فروشگاه', icon:'▣'},
  {key:'history', label:'تاریخچه', icon:'◷'},
  {key:'plans', label:'اشتراک', icon:'◇'},
];

export function Sidebar({view,onNavigate}:SidebarProps) {
  return (
    <aside className="glass border-l border-slate-800/70 p-5 md:min-h-screen md:p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-xl font-black text-white">R</div>
        <div><h2 className="text-xl font-black text-white">رونق‌یار</h2><p className="text-xs text-slate-500">AI Growth Operating System</p></div>
      </div>
      <nav className="space-y-2">
        {navigation.map(item=>(
          <button key={item.key} type="button" onClick={()=>onNavigate(item.key)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-right transition ${view===item.key?'bg-sky-500 text-white shadow-lg shadow-sky-500/15':'bg-slate-900/45 text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}>
            <span className="text-lg">{item.icon}</span><span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-8 rounded-3xl border border-emerald-500/15 bg-emerald-500/5 p-4">
        <div className="text-sm font-bold text-emerald-300">رونق‌یار Alpha</div>
        <p className="mt-2 text-xs leading-6 text-slate-400">هسته هوش مصنوعی، Brand Brain و ابزارهای رشد فعال هستند.</p>
      </div>
    </aside>
  );
}
