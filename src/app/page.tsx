"use client";
import {useEffect,useMemo,useState} from "react";
import {createClient,type User} from "@supabase/supabase-js";
import {ArrowRight,BookOpen,CheckCircle2,Compass,FileText,GraduationCap,LogIn,Menu,ShieldCheck,Sparkles,X} from "lucide-react";
type Subject={id:string;name:string;slug:string;description:string|null;gs_papers:string[]};
type Affair={id:string;title:string;summary:string;source_url:string;source_name:string;published_on:string;gs_paper:string|null;subject_id:string|null;subjects?:{name:string;slug:string}|null;content_type:"current_affair"|"scheme";scheme_jurisdiction:"india"|"tamil_nadu"|null;ministry:string|null};
type Mcq={id:string;topic:string;question:string;options:string[];explanation:string;source_url:string|null;source_label:string|null;subjects?:{name:string}|null};
type Mains={id:string;question:string;year:number|null;question_type:"pyq"|"practice";gs_paper:string;marks:number|null;word_limit:number|null;source_url:string|null;source_label:string|null;model_answers?:{introduction:string;body:unknown;conclusion:string;examples:string[]}[]};
const fallback:Subject[]=[["Polity & Governance","Constitution, Parliament and governance","GS II"],["History & Culture","Indian history and heritage","GS I"],["Geography","Physical and Indian geography","GS I"],["Economy","Growth, inflation and inclusive development","GS III"],["Environment","Ecology, biodiversity and climate","GS III"],["Science & Technology","Research, space, health and technology","GS III"],["International Relations","India’s bilateral ties and global institutions","GS II"],["Ethics & Integrity","Ethics, attitude and case studies","GS IV"],["Security & Disaster Management","Internal security and resilience","GS III"],["Society & Social Justice","Welfare, inclusion and social issues","GS I / II"]].map((x,i)=>({id:String(i),slug:String(i),name:x[0],description:x[1],gs_papers:[x[2]]}));
const indiaMinistries: string[] = [
 "Ministry of Women and Child Development", "Ministry of Education",
 "Ministry of Health and Family Welfare", "Ministry of Agriculture and Farmers Welfare",
 "Ministry of Rural Development", "Ministry of Finance",
 "Ministry of Environment, Forest and Climate Change", "Ministry of Jal Shakti",
 "Ministry of Housing and Urban Affairs", "Ministry of Social Justice and Empowerment",
 "Ministry of Labour and Employment", "Ministry of Micro, Small and Medium Enterprises",
 "Ministry of Electronics and Information Technology", "Ministry of Power",
 "Ministry of Tribal Affairs", "Ministry of Youth Affairs and Sports",
 "Ministry of Consumer Affairs, Food and Public Distribution", "Ministry of Food Processing Industries",
 "Ministry of Skill Development and Entrepreneurship", "Ministry of Fisheries, Animal Husbandry and Dairying",
 "Ministry of Tourism", "Ministry of Commerce and Industry",
 "Ministry of Road Transport and Highways", "Ministry of Petroleum and Natural Gas",
 "Ministry of Defence"
];
const tamilNaduDepartments: string[] = [
 "Social Welfare and Women Empowerment Department", "School Education Department",
 "Higher Education Department", "Health and Family Welfare Department",
 "Agriculture and Farmers Welfare Department", "Rural Development and Panchayat Raj Department",
 "Finance Department", "Environment and Climate Change Department", "Water Resources Department",
 "Housing and Urban Development Department", "Adi Dravidar and Tribal Welfare Department",
 "Backward Classes, Most Backward Classes and Minorities Welfare Department",
 "Labour Welfare and Skill Development Department", "Micro, Small and Medium Enterprises Department",
 "Information Technology and Digital Services Department", "Energy Department",
 "Co-operation, Food and Consumer Protection Department", "Youth Welfare and Sports Development Department",
 "Animal Husbandry, Dairying, Fisheries and Fishermen Welfare Department",
 "Industries, Investment Promotion and Commerce Department",
 "Municipal Administration and Water Supply Department", "Public Works Department",
 "Transport Department", "Tourism, Culture and Religious Endowments Department"
];

export default function HomePage(){
 const db=useMemo(()=>{const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return u&&k?createClient(u,k):null},[]);
 const [user,setUser]=useState<User|null>(null),[subjects,setSubjects]=useState(fallback),[affairs,setAffairs]=useState<Affair[]>([]),[affairFilter,setAffairFilter]=useState("all"),[schemeJurisdiction,setSchemeJurisdiction]=useState("all"),[schemeMinistry,setSchemeMinistry]=useState("all"),[mcqs,setMcqs]=useState<Mcq[]>([]),[mains,setMains]=useState<Mains[]>([]),[loading,setLoading]=useState(true),[mobile,setMobile]=useState(false),[mode,setMode]=useState<"signin"|"signup">("signin"),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[message,setMessage]=useState(""),[canResend,setCanResend]=useState(false),[choice,setChoice]=useState<Record<string,number>>({}),[show,setShow]=useState<Record<string,boolean>>({});
 useEffect(()=>{if(!db){setLoading(false);return}let live=true;void db.auth.getUser().then(({data})=>{if(live)setUser(data.user)});const {data:sub}=db.auth.onAuthStateChange((_e,s)=>{setUser(s?.user??null);if(_e==="SIGNED_IN")setMessage("Signed in successfully. Your account is ready.")});void Promise.all([db.from("subjects").select("id,name,slug,description,gs_papers").order("sort_order"),db.from("current_affairs").select("id,title,summary,source_url,source_name,published_on,gs_paper,subject_id,content_type,scheme_jurisdiction,ministry,subjects(name,slug)").eq("status","published").order("published_on",{ascending:false}).limit(100),db.from("mcq_questions").select("id,topic,question,options,explanation,source_url,source_label,subjects(name)").eq("status","published").limit(5),db.from("mains_questions").select("id,question,year,question_type,gs_paper,marks,word_limit,source_url,source_label,model_answers(introduction,body,conclusion,examples)").eq("status","published").order("created_at",{ascending:false}).limit(5)]).then(([s,a,q,m])=>{if(!live)return;if(s.data?.length)setSubjects(s.data as Subject[]);if(a.data)setAffairs(a.data as Affair[]);if(q.data)setMcqs(q.data as unknown as Mcq[]);if(m.data)setMains(m.data as unknown as Mains[]);setLoading(false)});return()=>{live=false;sub.subscription.unsubscribe()}},[db]);
 useEffect(()=>{const params=new URLSearchParams(window.location.hash.slice(1));const description=params.get("error_description");if(description){setMessage(description);window.history.replaceState({},document.title,window.location.pathname+window.location.search)}},[]);
 function authRedirectUrl(){return process.env.NEXT_PUBLIC_SITE_URL||window.location.origin}

 async function auth(e:React.FormEvent){
  e.preventDefault();setMessage("");setCanResend(false);
  if(!db){setMessage("Supabase is not configured for this deployment.");return}
  const r=mode==="signin"
   ?await db.auth.signInWithPassword({email:email.trim(),password})
   :await db.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:authRedirectUrl()}});
  if(r.error){setMessage(r.error.message);return}
  if(mode==="signup"&&!r.data.session){
   setCanResend(true);
   setMessage("Check your inbox for a CutoffClub verification email. Confirm your email address before signing in, and check spam or junk if it is missing.");
   return;
  }
  setMessage(mode==="signup"?"Account created successfully.":"Signed in successfully.");
 }
 async function resendConfirmation(){
  if(!db||!email.trim())return;
  const {error}=await db.auth.resend({type:"signup",email:email.trim(),options:{emailRedirectTo:authRedirectUrl()}});
  if(error){setMessage(error.message);return}
  setMessage("If an unconfirmed account exists for this email, a new confirmation email has been sent.");
 }
 async function signOut(){if(db)await db.auth.signOut();setUser(null)}
 const admin=user?.app_metadata?.role==="admin";
 const filteredAffairs=useMemo(()=>affairs.filter(a=>{
  if(affairFilter==="pib")return (a.source_name||"").toLowerCase().includes("pib")||(a.source_url||"").toLowerCase().includes("pib.gov.in");
  if(affairFilter==="schemes"){
   if(a.content_type!=="scheme")return false;
   if(schemeJurisdiction!=="all"&&a.scheme_jurisdiction!==schemeJurisdiction)return false;
   if(schemeMinistry!=="all"&&a.ministry!==schemeMinistry)return false;
   return true;
  }
  return affairFilter==="all"||a.subject_id===affairFilter||a.subjects?.slug===affairFilter;
 }),[affairs,affairFilter,schemeJurisdiction,schemeMinistry]);
 const empty=(title:string,desc:string)=><div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7"><h3 className="font-extrabold text-[#0b1d3a]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p></div>;
 return <main className="min-h-screen bg-slate-50 text-slate-800">
 <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6"><a href="#home" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b1d3a] text-white"><BookOpen size={21}/></span><span><strong className="block text-lg font-black text-[#0b1d3a]">CutoffClub</strong><small className="block text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Prepare with purpose</small></span></a><nav className="hidden gap-1 lg:flex">{[["#affairs","Current affairs"],["#prelims","Prelims MCQs"],["#mains","Mains practice"],["#subjects","Subjects"],["#account","Account"]].map(([h,l])=><a key={h} href={h} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">{l}</a>)}</nav><div className="flex items-center gap-2">{user?<><span className="hidden max-w-36 truncate text-xs text-slate-500 sm:inline">{user.email}</span><button className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={()=>void signOut()}>Sign out</button></>:<a href="#account" className="hidden rounded-lg bg-[#0b1d3a] px-4 py-2 text-sm font-bold text-white sm:inline-flex"><LogIn size={14} className="mr-2"/>Sign in</a>}<button className="rounded-lg border p-2 lg:hidden" onClick={()=>setMobile(v=>!v)} aria-label="Toggle navigation">{mobile?<X size={18}/>:<Menu size={18}/>}</button></div></div>{mobile&&<nav className="grid gap-1 border-t p-3 lg:hidden">{[["#affairs","Current affairs"],["#prelims","Prelims MCQs"],["#mains","Mains practice"],["#subjects","Subjects"],["#account","Account"]].map(([h,l])=><a key={h} href={h} onClick={()=>setMobile(false)} className="rounded-lg px-3 py-2 text-sm font-semibold">{l}</a>)}</nav>}</header>
 <section id="home" className="relative overflow-hidden bg-[#0b1d3a] text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_.85fr] lg:items-center"><div><div className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-white/5 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-200"><Sparkles size={14}/> Exam-oriented learning</div><h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">Prepare with purpose.<br/><span className="text-amber-400">Practice with clarity.</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">Verified current affairs, focused Prelims practice and structured Mains writing — organised by subject, without content overload.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#affairs" className="inline-flex items-center rounded-xl bg-amber-400 px-5 py-3 font-extrabold text-slate-900">Start learning <ArrowRight size={16} className="ml-2"/></a><a href="#subjects" className="rounded-xl border border-white/20 px-5 py-3 font-bold">Browse subjects</a></div></div><div className="grid grid-cols-2 gap-3">{[{i:Compass,t:"Current affairs",n:affairs.length},{i:CheckCircle2,t:"Prelims MCQs",n:mcqs.length},{i:FileText,t:"Mains questions",n:mains.length},{i:GraduationCap,t:"Subjects",n:subjects.length}].map(x=><div key={x.t} className="rounded-2xl border border-white/10 bg-white/[.06] p-5"><x.i size={20} className="text-amber-300"/><p className="mt-4 text-3xl font-black">{loading?"—":String(x.n).padStart(2,"0")}</p><p className="mt-1 text-sm font-bold">{x.t}</p><p className="mt-1 text-xs text-slate-400">Published content</p></div>)}</div></div></section>
 <section className="mx-auto grid max-w-7xl gap-3 px-5 py-9 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">{[{h:"#affairs",t:"Daily current affairs",d:"Context, key facts and cited sources",i:Compass},{h:"#prelims",t:"Prelims practice",d:"Questions and explanations",i:CheckCircle2},{h:"#mains",t:"Mains writing",d:"Practice prompts and model answers",i:FileText},{h:"#subjects",t:"Subject dashboard",d:"Browse by General Studies paper",i:GraduationCap}].map(x=><a key={x.t} href={x.h} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-300"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><x.i size={20}/></span><span><b className="text-sm text-[#0b1d3a]">{x.t}</b><span className="mt-1 block text-xs leading-5 text-slate-500">{x.d}</span></span></a>)}</section>
 <section id="affairs" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-7 sm:px-8">
  <h2 className="text-2xl font-black text-[#0b1d3a]">Daily current affairs</h2>
  <p className="mb-5 mt-2 text-sm text-slate-500">Browse updates by subject, PIB releases, or government schemes by jurisdiction and ministry.</p>
  <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <label htmlFor="affair-subject-filter" className="block text-xs font-extrabold uppercase tracking-wide text-slate-600">Subject-wise
     <select id="affair-subject-filter" value={affairFilter} onChange={e=>{setAffairFilter(e.target.value);setSchemeJurisdiction("all");setSchemeMinistry("all")}} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold normal-case tracking-normal text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100">
      <option value="all">All current affairs</option>
      {subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
      <option value="pib">PIB (Press Information Bureau)</option>
      <option value="schemes">Schemes</option>
     </select>
    </label>
    {affairFilter==="schemes"?<>
     <label htmlFor="scheme-jurisdiction-filter" className="block text-xs font-extrabold uppercase tracking-wide text-slate-600">Government
      <select id="scheme-jurisdiction-filter" value={schemeJurisdiction} onChange={e=>{setSchemeJurisdiction(e.target.value);setSchemeMinistry("all")}} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold normal-case tracking-normal text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100">
       <option value="all">India or Tamil Nadu</option>
       <option value="india">India — Union Government</option>
       <option value="tamil_nadu">Tamil Nadu Government</option>
      </select>
     </label>
     <label htmlFor="scheme-ministry-filter" className="block text-xs font-extrabold uppercase tracking-wide text-slate-600">Ministry / Department
      <select id="scheme-ministry-filter" disabled={schemeJurisdiction==="all"} value={schemeMinistry} onChange={e=>setSchemeMinistry(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold normal-case tracking-normal text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
       <option value="all">All ministries / departments</option>
       {(schemeJurisdiction==="india"?indiaMinistries:schemeJurisdiction==="tamil_nadu"?tamilNaduDepartments:[]).map(name=><option key={name} value={name}>{name}</option>)}
      </select>
     </label>
    </>:<div className="flex items-center rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 sm:col-span-1 lg:col-span-2">Choose a subject, view PIB-source releases, or select Schemes to filter India and Tamil Nadu programmes by ministry or department.</div>}
   </div>
  </div>
  {filteredAffairs.length?<div className="grid gap-4 md:grid-cols-2">{filteredAffairs.map(a=><article key={a.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
   <div className="flex flex-wrap gap-2 text-[10px] font-extrabold uppercase text-amber-800">
    <span className="rounded bg-amber-50 px-2 py-1">{a.gs_paper||"Current affairs"}</span>
    <span className="rounded bg-blue-50 px-2 py-1 text-blue-800">{a.content_type==="scheme"?"Schemes":a.subjects?.name||"Current affairs"}</span>
    {a.content_type==="scheme"&&<span className="rounded bg-violet-50 px-2 py-1 text-violet-800">{a.scheme_jurisdiction==="india"?"India":"Tamil Nadu"}{a.ministry ? " · " + a.ministry : ""}</span>}
    <span className="rounded bg-slate-100 px-2 py-1">{a.published_on}</span>
   </div>
   <h3 className="mt-4 text-lg font-extrabold text-[#0b1d3a]">{a.title}</h3>
   <p className="mt-2 text-sm leading-6 text-slate-600">{a.summary}</p>
   <a href={a.source_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center text-sm font-bold text-amber-700">{a.source_name}<ArrowRight size={14} className="ml-2"/></a>
  </article>)}</div>:empty(loading?"Loading current affairs…":affairFilter!=="all"?"No published items match these filters yet":"No current-affairs stories published yet",loading?"Loading verified stories.":"Try another subject or check back after a verified item is published.")}
 </section>
 <section id="prelims" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-7 sm:px-8"><h2 className="text-2xl font-black text-[#0b1d3a]">Prelims MCQs</h2><p className="mb-5 mt-2 text-sm text-slate-500">Choose an option to reveal the explanation. Quiz answer keys are protected separately.</p>{mcqs.length?<div className="grid gap-4 lg:grid-cols-2">{mcqs.map((q,i)=><article key={q.id} className="rounded-2xl border bg-white p-6"><div className="flex justify-between gap-3 text-xs font-bold text-amber-700"><span>Question {i+1}</span><span className="text-slate-500">{q.subjects?.name||q.topic}</span></div><h3 className="mt-4 font-extrabold leading-6 text-[#0b1d3a]">{q.question}</h3><div className="mt-4 space-y-2">{q.options.map((o,n)=><button key={n} onClick={()=>{setChoice(p=>({...p,[q.id]:n}));setShow(p=>({...p,[q.id]:false}))}} className={`block w-full rounded-xl border px-3 py-3 text-left text-sm ${choice[q.id]===n?"border-amber-400 bg-amber-50":"border-slate-200 hover:bg-slate-50"}`}><b className="mr-2">{String.fromCharCode(65+n)}.</b>{o}</button>)}</div><button disabled={choice[q.id]===undefined} onClick={()=>setShow(p=>({...p,[q.id]:true}))} className="mt-4 rounded-lg bg-[#0b1d3a] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-40">Show explanation</button>{show[q.id]&&<div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><b>Explanation</b><p>{q.explanation}</p>{q.source_url&&<a className="underline" target="_blank" rel="noreferrer" href={q.source_url}>{q.source_label||"Source"}</a>}</div>}</article>)}</div>:empty(loading?"Loading questions…":"No published MCQs available","Published questions will appear once verified items are added to the question bank.")}</section>
 <section id="mains" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-7 sm:px-8"><h2 className="text-2xl font-black text-[#0b1d3a]">Mains questions & model answers</h2><p className="mb-5 mt-2 text-sm text-slate-500">A question is labelled as a PYQ only when the year and a traceable source are supplied.</p>{mains.length?<div className="space-y-4">{mains.map(q=><article key={q.id} className="rounded-2xl border bg-white p-6"><div className="flex flex-wrap gap-2 text-[10px] font-extrabold"><span className="rounded bg-slate-100 px-2 py-1">{q.question_type==="pyq"?"UPSC PYQ · "+q.year:"Practice question"}</span><span className="rounded bg-blue-50 px-2 py-1 text-blue-800">{q.gs_paper}</span>{q.marks&&<span className="rounded bg-amber-50 px-2 py-1 text-amber-800">{q.marks} marks</span>}</div><h3 className="mt-4 font-extrabold leading-7 text-[#0b1d3a]">{q.question}</h3><p className="mt-2 text-xs text-slate-500">{q.word_limit? q.word_limit+" words · ":""}{q.source_label||"Exam-oriented practice"}</p>{q.source_url&&<a className="mt-2 inline-block text-xs font-bold text-amber-700 underline" target="_blank" rel="noreferrer" href={q.source_url}>Question source</a>}{q.model_answers?.length?<details className="mt-4 rounded-xl bg-slate-50 p-4"><summary className="cursor-pointer text-sm font-extrabold text-[#0b1d3a]">Read model answer</summary><div className="mt-3 space-y-3 text-sm leading-6 text-slate-600"><p>{q.model_answers[0].introduction}</p><p>{typeof q.model_answers[0].body==="string"?q.model_answers[0].body:JSON.stringify(q.model_answers[0].body)}</p><p>{q.model_answers[0].conclusion}</p></div></details>:<p className="mt-3 text-xs text-slate-500">No model answer published yet.</p>}</article>)}</div>:empty(loading?"Loading Mains questions…":"No Mains prompts published yet","Practice prompts and source-verified previous-year questions will appear here when published.")}</section>
 <section id="subjects" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-7 sm:px-8"><h2 className="text-2xl font-black text-[#0b1d3a]">Subject-wise dashboard</h2><p className="mb-5 mt-2 text-sm text-slate-500">Ten subject buckets aligned with the General Studies syllabus.</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{subjects.map(s=><article key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex justify-between"><GraduationCap size={20} className="text-[#0b1d3a]"/></div><h3 className="mt-3 font-extrabold text-[#0b1d3a]">{s.name}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{s.description}</p></article>)}</div></section>
 <section id="account" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-10 sm:px-8"><div className="grid gap-7 rounded-3xl border border-slate-200 bg-white p-6 sm:grid-cols-2 sm:p-9"><div><p className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Your workspace</p><h2 className="mt-2 text-2xl font-black text-[#0b1d3a]">{user?"Welcome back":"Sign in or create an account"}</h2><p className="mt-3 text-sm leading-6 text-slate-500">Learner access is governed by Supabase authentication and row-level security. Admin roles must be granted through trusted server-side metadata.</p>{user&&<p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900"><CheckCircle2 size={15} className="mr-2 inline"/> Signed in as {user.email}</p>}{admin&&<p id="admin" className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900"><ShieldCheck size={15} className="mr-2 inline"/> Admin role recognised.</p>}</div>{user?<button className="self-start rounded-xl border px-4 py-3 text-sm font-bold" onClick={()=>void signOut()}>Sign out</button>:<form onSubmit={auth} className="space-y-3"><div className="flex gap-2"><button type="button" onClick={()=>setMode("signin")} className={`rounded-lg px-4 py-2 text-sm font-bold ${mode==="signin"?"bg-[#0b1d3a] text-white":"bg-slate-100"}`}>Sign in</button><button type="button" onClick={()=>setMode("signup")} className={`rounded-lg px-4 py-2 text-sm font-bold ${mode==="signup"?"bg-[#0b1d3a] text-white":"bg-slate-100"}`}>Create account</button></div><label className="block text-sm font-bold">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" className="mt-1 block w-full rounded-xl border px-4 py-3 font-normal"/></label><label className="block text-sm font-bold">Password<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==="signin"?"current-password":"new-password"} className="mt-1 block w-full rounded-xl border px-4 py-3 font-normal"/></label><button className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-extrabold text-slate-900">{mode==="signin"?"Sign in":"Create account"}</button>{message&&<p className="text-sm text-slate-600" role="status">{message}</p>}{canResend&&mode==="signup"&&<button type="button" onClick={()=>void resendConfirmation()} className="text-sm font-bold text-amber-700 underline">Resend confirmation email</button>}</form>}</div></section>
 <footer className="mt-8 border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-7 text-xs text-slate-500 sm:px-8"><span><b className="text-[#0b1d3a]">CutoffClub</b> · Learn · Practise · Improve</span><a href="#home" className="font-bold text-amber-700">Back to top ↑</a></div></footer></main>;
}
