'use client';

import {useEffect, useState} from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const tools = [
  ['caption','کپشن'],['reels','سناریو ریلز'],['stories','استوری'],['carousel','کاروسل'],
  ['ideas','ایده محتوا'],['ads','تبلیغات'],['hooks','هوک'],['hashtags','هشتگ هوشمند'],
  ['rewrite','بازنویسی'],['director','مدیر رشد'],['calendar','تقویم ۳۰ روزه'],
];
const brandFields = [
  ['brand_name','نام برند'],['slogan','شعار'],['website','وب‌سایت'],['business_type','حوزه فعالیت'],
  ['business_description','شرح کسب‌وکار'],['audience','مخاطب هدف'],['audience_pains','دردهای مخاطب'],
  ['audience_goals','اهداف مخاطب'],['tone','لحن برند'],['brand_personality','شخصیت برند'],
  ['value_proposition','ارزش پیشنهادی'],['preferred_cta','CTA ترجیحی'],['preferred_words','واژه‌های ترجیحی'],
  ['forbidden_words','واژه‌های ممنوع'],['city','شهر'],['country','کشور'],
];

async function request(path:string, options:any={}) {
  const token = localStorage.getItem('token');
  const response = await fetch(API + path, {
    ...options,
    headers: {'Content-Type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(options.headers || {})},
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'خطای نامشخص');
  return data;
}

export default function Home() {
  const [user,setUser] = useState<any>(null);
  const [mode,setMode] = useState<'login'|'register'>('register');
  const [email,setEmail] = useState('');
  const [name,setName] = useState('');
  const [password,setPassword] = useState('');
  const [feature,setFeature] = useState('caption');
  const [text,setText] = useState('');
  const [output,setOutput] = useState('');
  const [generationId,setGenerationId] = useState<number|null>(null);
  const [busy,setBusy] = useState(false);
  const [view,setView] = useState('studio');
  const [providers,setProviders] = useState<string[]>([]);
  const [provider,setProvider] = useState('');
  const [compare,setCompare] = useState(false);
  const [brand,setBrand] = useState<Record<string,string>>({});
  const [history,setHistory] = useState<any[]>([]);
  const [product,setProduct] = useState({name:'',description:'',benefits:'',price:''});
  const [competitor,setCompetitor] = useState({name:'',strengths:'',weaknesses:'',positioning:''});
  const [brandData,setBrandData] = useState<any>({profile:{},products:[],competitors:[]});

  const loadUser = async()=>{try{setUser(await request('/me'))}catch{setUser(null)}};
  const loadProviders = async()=>{try{const d=await request('/ai/providers');setProviders(d.available||[])}catch{}};
  const loadBrand = async()=>{try{const d=await request('/brand');setBrandData(d);setBrand(d.profile||{})}catch(e:any){alert(e.message)}};
  const loadHistory = async()=>{try{setHistory(await request('/history'))}catch(e:any){alert(e.message)}};

  useEffect(()=>{loadUser()},[]);
  useEffect(()=>{if(user){loadProviders();loadBrand();loadHistory()}},[user]);

  const auth = async()=>{
    try {
      const payload = mode==='register' ? {email,full_name:name,password} : {email,password};
      const data = await request(`/auth/${mode}`,{method:'POST',body:JSON.stringify(payload)});
      localStorage.setItem('token',data.access_token);
      await loadUser();
    } catch(e:any) { alert(e.message); }
  };

  const generate = async()=>{
    setBusy(true); setOutput(''); setGenerationId(null);
    try {
      const data = await request('/generate',{method:'POST',body:JSON.stringify({feature,text,preferred_provider:provider||null,compare})});
      if(data.mode==='compare') {
        setOutput(data.results.map((r:any)=>`【${r.provider} / ${r.model}】\nامتیاز: ${r.quality_score}\n${r.output}`).join('\n\n────────────────\n\n'));
      } else {
        setOutput(data.output); setGenerationId(data.id);
      }
      await loadUser(); await loadHistory();
    } catch(e:any) { setOutput('خطا: '+e.message); }
    finally { setBusy(false); }
  };

  const improve = async()=>{
    if(!generationId) return;
    setBusy(true);
    try {
      const data=await request(`/generations/${generationId}/improve`,{method:'POST',body:JSON.stringify({preferred_provider:provider||null})});
      setOutput(data.output); setGenerationId(data.id); await loadHistory();
    } catch(e:any){alert(e.message)} finally{setBusy(false)}
  };

  const saveBrand = async()=>{
    try{await request('/brand',{method:'PUT',body:JSON.stringify(brand)});await loadBrand();alert('DNA برند ذخیره شد.')}catch(e:any){alert(e.message)}
  };
  const addProduct = async()=>{
    try{await request('/brand/products',{method:'POST',body:JSON.stringify({...product,price:product.price?Number(product.price):null})});setProduct({name:'',description:'',benefits:'',price:''});await loadBrand()}catch(e:any){alert(e.message)}
  };
  const addCompetitor = async()=>{
    try{await request('/brand/competitors',{method:'POST',body:JSON.stringify(competitor)});setCompetitor({name:'',strengths:'',weaknesses:'',positioning:''});await loadBrand()}catch(e:any){alert(e.message)}
  };
  const favorite = async(id:number)=>{await request(`/generations/${id}/favorite`,{method:'POST'});await loadHistory()};

  if(!user) return <main className="min-h-screen grid place-items-center p-6"><section className="glass w-full max-w-md rounded-3xl p-8"><h1 className="text-3xl font-black mb-2">رونق‌یار AI</h1><p className="text-slate-400 mb-6">سیستم‌عامل هوشمند بازاریابی</p>{mode==='register'&&<input className="field" placeholder="نام" value={name} onChange={e=>setName(e.target.value)}/>}<input className="field" placeholder="ایمیل" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" className="field" placeholder="رمز عبور" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={auth} className="primary w-full">{mode==='register'?'ساخت حساب':'ورود'}</button><button onClick={()=>setMode(mode==='register'?'login':'register')} className="w-full mt-3 text-sky-300">{mode==='register'?'حساب دارم':'ساخت حساب جدید'}</button></section></main>;

  return <div className="min-h-screen grid md:grid-cols-[250px_1fr]">
    <aside className="glass p-6 md:min-h-screen"><h2 className="text-2xl font-black mb-8">رونق‌یار <span className="text-sky-400">AI</span></h2>{[['studio','استودیو'],['brand','Brand Brain'],['history','تاریخچه'],['plans','اشتراک']].map(([k,l])=><button key={k} onClick={()=>{setView(k);if(k==='history')loadHistory();if(k==='brand')loadBrand()}} className={`w-full text-right p-3 rounded-xl mb-2 ${view===k?'bg-sky-500':'bg-slate-900/50'}`}>{l}</button>)}</aside>
    <main className="p-5 md:p-10"><header className="flex flex-wrap gap-4 justify-between items-center mb-8"><div><h1 className="text-3xl font-black">مرکز فرماندهی بازاریابی</h1><p className="text-slate-400">Brand Brain، چند هوش مصنوعی و ابزارهای رشد</p></div><span className="rounded-full bg-slate-800 px-4 py-2">{user.full_name} | {user.plan} | {user.daily_usage}</span></header>

      {view==='studio'&&<><section className="glass rounded-3xl p-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">{tools.map(([k,l])=><button key={k} onClick={()=>setFeature(k)} className={`rounded-xl p-3 ${feature===k?'bg-sky-500':'bg-slate-900/70'}`}>{l}</button>)}</div><div className="grid md:grid-cols-2 gap-3 mb-4"><select className="field" value={provider} onChange={e=>setProvider(e.target.value)}><option value="">انتخاب خودکار مدل</option>{providers.map(p=><option key={p} value={p}>{p}</option>)}</select><label className="field flex items-center gap-3"><input type="checkbox" checked={compare} onChange={e=>setCompare(e.target.checked)}/> مقایسه چند مدل (Pro/Business)</label></div><textarea value={text} onChange={e=>setText(e.target.value)} className="field min-h-40" placeholder="هدف، محصول، مخاطب یا مسئله بازاریابی را توضیح بده..."/><button disabled={busy} onClick={generate} className="primary mt-4">{busy?'در حال تحلیل...':'اجرا با رونق‌یار'}</button></section><section className="glass rounded-3xl p-6 mt-5"><div className="flex justify-between"><h3 className="font-bold mb-4">خروجی</h3>{generationId&&<button onClick={improve} className="rounded-xl bg-emerald-600 px-4 py-2">بهبود خروجی</button>}</div><pre className="whitespace-pre-wrap leading-8 text-slate-200">{output||'هنوز خروجی‌ای تولید نشده است.'}</pre></section></>}

      {view==='brand'&&<section className="space-y-5"><div className="glass rounded-3xl p-6"><h2 className="text-2xl font-bold mb-5">DNA برند</h2><div className="grid md:grid-cols-2 gap-3">{brandFields.map(([k,l])=><textarea key={k} className="field min-h-14" placeholder={l} value={brand[k]||''} onChange={e=>setBrand({...brand,[k]:e.target.value})}/>)}</div><button onClick={saveBrand} className="primary mt-4">ذخیره Brand Brain</button></div><div className="grid lg:grid-cols-2 gap-5"><div className="glass rounded-3xl p-6"><h3 className="font-bold mb-3">محصول یا خدمت</h3><input className="field" placeholder="نام" value={product.name} onChange={e=>setProduct({...product,name:e.target.value})}/><textarea className="field" placeholder="توضیح" value={product.description} onChange={e=>setProduct({...product,description:e.target.value})}/><textarea className="field" placeholder="مزایا" value={product.benefits} onChange={e=>setProduct({...product,benefits:e.target.value})}/><input className="field" placeholder="قیمت" value={product.price} onChange={e=>setProduct({...product,price:e.target.value})}/><button className="primary" onClick={addProduct}>افزودن محصول</button><div className="mt-4 space-y-2">{brandData.products?.map((p:any)=><div key={p.id} className="bg-slate-900/60 p-3 rounded-xl">{p.name}</div>)}</div></div><div className="glass rounded-3xl p-6"><h3 className="font-bold mb-3">رقبا</h3><input className="field" placeholder="نام رقیب" value={competitor.name} onChange={e=>setCompetitor({...competitor,name:e.target.value})}/><textarea className="field" placeholder="نقاط قوت" value={competitor.strengths} onChange={e=>setCompetitor({...competitor,strengths:e.target.value})}/><textarea className="field" placeholder="نقاط ضعف" value={competitor.weaknesses} onChange={e=>setCompetitor({...competitor,weaknesses:e.target.value})}/><textarea className="field" placeholder="جایگاه بازار" value={competitor.positioning} onChange={e=>setCompetitor({...competitor,positioning:e.target.value})}/><button className="primary" onClick={addCompetitor}>افزودن رقیب</button><div className="mt-4 space-y-2">{brandData.competitors?.map((c:any)=><div key={c.id} className="bg-slate-900/60 p-3 rounded-xl">{c.name}</div>)}</div></div></div></section>}

      {view==='history'&&<section className="glass rounded-3xl p-6"><h2 className="text-2xl font-bold mb-5">تاریخچه و خروجی‌های منتخب</h2><div className="space-y-4">{history.map(item=><article key={item.id} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4"><div className="flex justify-between gap-3"><b>{item.feature} — امتیاز {item.quality_score}</b><button onClick={()=>favorite(item.id)}>{item.favorite?'★':'☆'}</button></div><p className="whitespace-pre-wrap leading-7 mt-3 text-slate-300">{item.output_text}</p></article>)}</div></section>}

      {view==='plans'&&<section className="grid md:grid-cols-3 gap-5">{['FREE','PRO','BUSINESS'].map(p=><div key={p} className="glass rounded-3xl p-6"><h3 className="text-2xl font-bold">{p}</h3><p className="text-slate-400 my-4">{p==='FREE'?'یک خروجی و مدل اقتصادی':p==='PRO'?'چند خروجی، Compare و ابزارهای رشد':'تیم، ظرفیت بیشتر و API'}</p><button className="primary" onClick={async()=>{await request('/plan',{method:'POST',body:JSON.stringify({plan:p})});await loadUser()}}>فعال‌سازی تستی</button></div>)}</section>}
    </main>
  </div>;
}
