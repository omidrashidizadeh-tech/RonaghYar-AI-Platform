'use client';

import {useEffect, useState} from 'react';
import {Sidebar} from '../components/layout/Sidebar';
import {Topbar} from '../components/layout/Topbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const tools = [
  ['caption','کپشن'],['reels','سناریو ریلز'],['stories','استوری'],['carousel','کاروسل'],
  ['ideas','ایده محتوا'],['ads','تبلیغات'],['hooks','هوک'],['hashtags','هشتگ هوشمند'],
  ['rewrite','بازنویسی'],['director','مدیر رشد'],['calendar','تقویم ۳۰ روزه'],
];
const libraryBooks = [
  {id:1,title:"استراتژی بازاریابی دیجیتال",author:"مرجع منتخب رونق‌یار",category:"دیجیتال مارکتینگ",language:"fa",format:"کتاب الکترونیکی"},
  {id:2,title:"مدیریت برند در عصر هوش مصنوعی",author:"مرجع منتخب رونق‌یار",category:"مدیریت برند",language:"fa",format:"کتاب الکترونیکی"},
  {id:3,title:"AI for Marketing Leaders",author:"RonaghYar Editorial",category:"هوش مصنوعی و بازاریابی",language:"en",format:"eBook"},
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
  const [strategy,setStrategy] = useState<any>(null);
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
  const [libraryQuery,setLibraryQuery] = useState("");
  const [libraryCategory,setLibraryCategory] = useState("همه");
  const [brandStep,setBrandStep] = useState(0);
  const [brandSaveState,setBrandSaveState] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const brandWizard = [
    {title:'هویت برند',description:'اطلاعات پایه و جایگاه کسب‌وکار',fields:['brand_name','slogan','website','business_type','business_description']},
    {title:'مخاطب',description:'شناخت دقیق مشتری ایده‌آل',fields:['audience','audience_pains','audience_goals','city','country']},
    {title:'لحن و پیام',description:'شخصیت، واژگان و قواعد ارتباطی',fields:['tone','brand_personality','value_proposition','preferred_cta','preferred_words','forbidden_words']},
    {title:'محصولات',description:'محصولات و خدماتی که رونق‌یار باید بشناسد',fields:[]},
    {title:'رقبا',description:'فضای رقابتی و جایگاه بازار',fields:[]},
  ];

  const completionFields = ['brand_name','business_type','business_description','audience','audience_pains','audience_goals','tone','brand_personality','value_proposition','preferred_cta'];
  const brandCompletion = Math.round((completionFields.filter(key=>String(brand[key]||'').trim().length>0).length / completionFields.length) * 100);

  const loadUser = async()=>{try{setUser(await request('/me'))}catch{setUser(null)}};
  const loadProviders = async()=>{try{const d=await request('/ai/providers');setProviders(d.available||[])}catch{}};
  const loadBrand = async()=>{try{const d=await request('/brand');setBrandData(d);setBrand(d.profile||{})}catch(e:any){alert(e.message)}};
  const loadHistory = async()=>{try{setHistory(await request('/history'))}catch(e:any){alert(e.message)}};

  useEffect(()=>{loadUser()},[]);
  useEffect(()=>{if(user){loadProviders();loadBrand();loadHistory()}},[user]);
  useEffect(()=>{
    if(!user) return;
    if(Object.keys(brand).length===0) return;
    setBrandSaveState('idle');
    const timer=setTimeout(()=>{saveBrand(false)},900);
    return ()=>clearTimeout(timer);
  },[brand,user]);


  const auth = async()=>{
    try {
      const payload = mode==='register' ? {email,full_name:name,password} : {email,password};
      const data = await request(`/auth/${mode}`,{method:'POST',body:JSON.stringify(payload)});
      localStorage.setItem('token',data.access_token);
      await loadUser();
    } catch(e:any) { alert(e.message); }
  };

  const generate = async()=>{
    setBusy(true); setOutput(''); setGenerationId(null); setStrategy(null);
    try {
      const data = await request('/generate',{method:'POST',body:JSON.stringify({feature,text,preferred_provider:provider||null,compare})});
      if(data.mode==='compare') {
        setOutput(data.results.map((r:any)=>`【${r.provider} / ${r.model}】\nامتیاز: ${r.quality_score}\n${r.output}`).join('\n\n────────────────\n\n'));
      } else {
        setOutput(data.output); setGenerationId(data.id); setStrategy(data.ai?.strategy||null);
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
      setOutput(data.output); setGenerationId(data.id); setStrategy(data.ai?.strategy||null); await loadHistory();
    } catch(e:any){alert(e.message)} finally{setBusy(false)}
  };

  const saveBrand = async(showMessage=true)=>{
    try{
      setBrandSaveState('saving');
      await request('/brand',{method:'PUT',body:JSON.stringify(brand)});
      setBrandSaveState('saved');
      if(showMessage) alert('Brand Brain ذخیره شد.');
    }catch(e:any){
      setBrandSaveState('error');
      if(showMessage) alert(e.message);
    }
  };
  const addProduct = async()=>{
    try{await request('/brand/products',{method:'POST',body:JSON.stringify({...product,price:product.price?Number(product.price):null})});setProduct({name:'',description:'',benefits:'',price:''});await loadBrand()}catch(e:any){alert(e.message)}
  };
  const addCompetitor = async()=>{
    try{await request('/brand/competitors',{method:'POST',body:JSON.stringify(competitor)});setCompetitor({name:'',strengths:'',weaknesses:'',positioning:''});await loadBrand()}catch(e:any){alert(e.message)}
  };
  const deleteProduct = async(id:number)=>{await request(`/brand/products/${id}`,{method:'DELETE'});await loadBrand()};
  const deleteCompetitor = async(id:number)=>{await request(`/brand/competitors/${id}`,{method:'DELETE'});await loadBrand()};
  const favorite = async(id:number)=>{await request(`/generations/${id}/favorite`,{method:'POST'});await loadHistory()};

  if(!user) return <main className="min-h-screen grid place-items-center p-6"><section className="glass w-full max-w-md rounded-3xl p-8"><h1 className="text-3xl font-black mb-2">رونق‌یار AI</h1><p className="text-slate-400 mb-6">سیستم‌عامل هوشمند بازاریابی</p>{mode==='register'&&<input className="field" placeholder="نام" value={name} onChange={e=>setName(e.target.value)}/>}<input className="field" placeholder="ایمیل" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" className="field" placeholder="رمز عبور" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={auth} className="primary w-full">{mode==='register'?'ساخت حساب':'ورود'}</button><button onClick={()=>setMode(mode==='register'?'login':'register')} className="w-full mt-3 text-sky-300">{mode==='register'?'حساب دارم':'ساخت حساب جدید'}</button></section></main>;

  return <div className="min-h-screen grid md:grid-cols-[280px_1fr] bg-[#07111f]">
    <Sidebar
      view={view}
      onNavigate={(nextView)=>{
        setView(nextView);
        if(nextView==='history') loadHistory();
        if(nextView==='brand') loadBrand();
      }}
    />
    <main className="min-w-0 p-5 md:p-8 lg:p-10">
      <Topbar user={user} />

      {view==='studio'&&<><section className="glass rounded-3xl p-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">{tools.map(([k,l])=><button key={k} onClick={()=>setFeature(k)} className={`rounded-xl p-3 ${feature===k?'bg-sky-500':'bg-slate-900/70'}`}>{l}</button>)}</div><div className="grid md:grid-cols-2 gap-3 mb-4"><select className="field" value={provider} onChange={e=>setProvider(e.target.value)}><option value="">انتخاب خودکار مدل</option>{providers.map(p=><option key={p} value={p}>{p}</option>)}</select><label className="field flex items-center gap-3"><input type="checkbox" checked={compare} onChange={e=>setCompare(e.target.checked)}/> مقایسه چند مدل (Pro/Business)</label></div><textarea value={text} onChange={e=>setText(e.target.value)} className="field min-h-40" placeholder="هدف، محصول، مخاطب یا مسئله بازاریابی را توضیح بده..."/><button disabled={busy} onClick={generate} className="primary mt-4">{busy?'در حال تحلیل...':'اجرا با رونق‌یار'}</button></section><section className="glass rounded-3xl p-6 mt-5"><div className="flex justify-between"><h3 className="font-bold mb-4">خروجی</h3>{generationId&&<button onClick={improve} className="rounded-xl bg-emerald-600 px-4 py-2">بهبود خروجی</button>}</div><pre className="whitespace-pre-wrap leading-8 text-slate-200">{output||'هنوز خروجی‌ای تولید نشده است.'}</pre>{strategy&&<div className="mt-5 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
<h4 className="font-bold mb-4">چرا این خروجی ساخته شد؟</h4>
<div className="grid md:grid-cols-2 gap-3 text-sm">
<div><span className="text-slate-400">هدف:</span> {strategy.objective}</div>
<div><span className="text-slate-400">مرحله قیف:</span> {strategy.funnel_stage}</div>
<div><span className="text-slate-400">چارچوب:</span> {strategy.framework}</div>
<div><span className="text-slate-400">احساس:</span> {strategy.emotion}</div>
<div><span className="text-slate-400">CTA:</span> {strategy.cta_type}</div>
<div><span className="text-slate-400">لحن:</span> {strategy.tone}</div>
</div>
<ul className="mt-4 space-y-2 text-slate-300 text-sm">{strategy.rationale?.map((item:string,index:number)=><li key={index}>✓ {item}</li>)}</ul>
</div>}</section></>}

      {view==='brand'&&<section className="space-y-5">
        <div className="glass rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Brand Brain</h2>
              <p className="text-slate-400 mt-1">مغز برندت را مرحله‌به‌مرحله کامل کن.</p>
            </div>
            <div className="min-w-56">
              <div className="flex justify-between text-sm mb-2"><span>درصد تکمیل Brand Brain</span><b>{brandCompletion}%</b></div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all" style={{width:`${brandCompletion}%`}}/></div>
              <div className="text-xs text-slate-400 mt-2">{brandSaveState==='saving'?'در حال ذخیره...':brandSaveState==='saved'?'ذخیره شد':brandSaveState==='error'?'خطا در ذخیره':'ذخیره خودکار فعال است'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-7">
            {brandWizard.map((step:any,index:number)=><button key={step.title} onClick={()=>setBrandStep(index)} className={`rounded-xl p-3 text-sm transition ${brandStep===index?'bg-sky-500 text-white':'bg-slate-900/70 text-slate-300'}`}>
              <span className="block font-bold">{index+1}. {step.title}</span>
            </button>)}
          </div>

          <div className="mb-5">
            <h3 className="text-xl font-bold">{brandWizard[brandStep].title}</h3>
            <p className="text-slate-400 mt-1">{brandWizard[brandStep].description}</p>
          </div>

          {brandStep<3&&<div className="grid md:grid-cols-2 gap-3">
            {brandWizard[brandStep].fields.map((key:string)=>{
              const field=brandFields.find(([k])=>k===key);
              const label=field?.[1]||key;
              const longField=['business_description','audience','audience_pains','audience_goals','brand_personality','value_proposition','preferred_cta','preferred_words','forbidden_words'].includes(key);
              return longField
                ? <textarea key={key} className="field min-h-28" placeholder={label} value={brand[key]||''} onChange={e=>setBrand({...brand,[key]:e.target.value})}/>
                : <input key={key} className="field" placeholder={label} value={brand[key]||''} onChange={e=>setBrand({...brand,[key]:e.target.value})}/>;
            })}
          </div>}

          {brandStep===3&&<div className="grid lg:grid-cols-[1fr_1.15fr] gap-5">
            <div className="rounded-2xl bg-slate-950/40 p-4">
              <input className="field" placeholder="نام محصول یا خدمت" value={product.name} onChange={e=>setProduct({...product,name:e.target.value})}/>
              <textarea className="field min-h-24" placeholder="توضیح محصول" value={product.description} onChange={e=>setProduct({...product,description:e.target.value})}/>
              <textarea className="field min-h-24" placeholder="مزیت‌ها و نتایج اصلی" value={product.benefits} onChange={e=>setProduct({...product,benefits:e.target.value})}/>
              <input className="field" placeholder="قیمت (اختیاری)" value={product.price} onChange={e=>setProduct({...product,price:e.target.value})}/>
              <button className="primary w-full" onClick={addProduct}>افزودن محصول</button>
            </div>
            <div className="space-y-3">
              {brandData.products?.length===0&&<p className="text-slate-400">هنوز محصولی ثبت نشده است.</p>}
              {brandData.products?.map((p:any)=><article key={p.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <div className="flex justify-between gap-3"><b>{p.name}</b><button onClick={()=>deleteProduct(p.id)} className="text-rose-300">حذف</button></div>
                {p.description&&<p className="text-slate-300 mt-2">{p.description}</p>}
                {p.benefits&&<p className="text-emerald-300 mt-2 text-sm">{p.benefits}</p>}
              </article>)}
            </div>
          </div>}

          {brandStep===4&&<div className="grid lg:grid-cols-[1fr_1.15fr] gap-5">
            <div className="rounded-2xl bg-slate-950/40 p-4">
              <input className="field" placeholder="نام رقیب" value={competitor.name} onChange={e=>setCompetitor({...competitor,name:e.target.value})}/>
              <textarea className="field min-h-24" placeholder="نقاط قوت" value={competitor.strengths} onChange={e=>setCompetitor({...competitor,strengths:e.target.value})}/>
              <textarea className="field min-h-24" placeholder="نقاط ضعف" value={competitor.weaknesses} onChange={e=>setCompetitor({...competitor,weaknesses:e.target.value})}/>
              <textarea className="field min-h-24" placeholder="جایگاه بازار" value={competitor.positioning} onChange={e=>setCompetitor({...competitor,positioning:e.target.value})}/>
              <button className="primary w-full" onClick={addCompetitor}>افزودن رقیب</button>
            </div>
            <div className="space-y-3">
              {brandData.competitors?.length===0&&<p className="text-slate-400">هنوز رقیبی ثبت نشده است.</p>}
              {brandData.competitors?.map((c:any)=><article key={c.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <div className="flex justify-between gap-3"><b>{c.name}</b><button onClick={()=>deleteCompetitor(c.id)} className="text-rose-300">حذف</button></div>
                {c.positioning&&<p className="text-slate-300 mt-2">{c.positioning}</p>}
              </article>)}
            </div>
          </div>}

          <div className="flex flex-wrap justify-between gap-3 mt-6 border-t border-slate-800 pt-5">
            <button disabled={brandStep===0} onClick={()=>setBrandStep(Math.max(0,brandStep-1))} className="rounded-xl bg-slate-800 px-5 py-3 disabled:opacity-40">مرحله قبل</button>
            <div className="flex gap-3">
              <button onClick={saveBrand} className="rounded-xl bg-emerald-600 px-5 py-3 font-bold">ذخیره اطلاعات</button>
              {brandStep<brandWizard.length-1
                ? <button onClick={()=>setBrandStep(brandStep+1)} className="primary">مرحله بعد</button>
                : <button onClick={()=>{saveBrand();setView('studio')}} className="primary">تکمیل و ورود به استودیو</button>}
            </div>
          </div>
        </div>
      </section>}

      {view==='library'&&<section className="space-y-5">
        <div className="glass rounded-3xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">کتابخانه و فروشگاه کتاب</h2>
              <p className="text-slate-400 mt-2">منابع منتخب مدیریت، برند، فروش و دیجیتال مارکتینگ.</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 text-emerald-300 px-4 py-2 text-sm">نسخه Alpha</span>
          </div>
          <div className="grid md:grid-cols-[1fr_260px] gap-3 mb-6">
            <input className="field mb-0" placeholder="جست‌وجوی عنوان، نویسنده یا موضوع..." value={libraryQuery} onChange={e=>setLibraryQuery(e.target.value)}/>
            <select className="field mb-0" value={libraryCategory} onChange={e=>setLibraryCategory(e.target.value)}>
              {['همه','دیجیتال مارکتینگ','مدیریت برند','هوش مصنوعی و بازاریابی'].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {libraryBooks.filter((book:any)=>(libraryCategory==='همه'||book.category===libraryCategory)&&`${book.title} ${book.author} ${book.category}`.toLowerCase().includes(libraryQuery.toLowerCase())).map((book:any)=><article key={book.id} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-5 flex flex-col min-h-64">
              <div className="h-24 rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 grid place-items-center mb-4"><span className="text-4xl">📚</span></div>
              <span className="text-xs text-sky-300">{book.category}</span>
              <h3 className="text-lg font-bold mt-2">{book.title}</h3>
              <p className="text-slate-400 text-sm mt-2">{book.author}</p>
              <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-300">{book.format} · {book.language.toUpperCase()}</span>
                <button className="primary text-sm">مشاهده جزئیات</button>
              </div>
            </article>)}
          </div>
        </div>
      </section>}

      {view==='history'&&<section className="glass rounded-3xl p-6"><h2 className="text-2xl font-bold mb-5">تاریخچه و خروجی‌های منتخب</h2><div className="space-y-4">{history.map(item=><article key={item.id} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4"><div className="flex justify-between gap-3"><b>{item.feature} — امتیاز {item.quality_score}</b><button onClick={()=>favorite(item.id)}>{item.favorite?'★':'☆'}</button></div><p className="whitespace-pre-wrap leading-7 mt-3 text-slate-300">{item.output_text}</p></article>)}</div></section>}

      {view==='plans'&&<section className="grid md:grid-cols-3 gap-5">{['FREE','PRO','BUSINESS'].map(p=><div key={p} className="glass rounded-3xl p-6"><h3 className="text-2xl font-bold">{p}</h3><p className="text-slate-400 my-4">{p==='FREE'?'یک خروجی و مدل اقتصادی':p==='PRO'?'چند خروجی، Compare و ابزارهای رشد':'تیم، ظرفیت بیشتر و API'}</p><button className="primary" onClick={async()=>{await request('/plan',{method:'POST',body:JSON.stringify({plan:p})});await loadUser()}}>فعال‌سازی تستی</button></div>)}</section>}
    </main>
  </div>;
}
