const $=id=>document.getElementById(id), key='apmilk_entries_v1';
let entries=JSON.parse(localStorage.getItem(key)||'[]');
$('date').value=new Date().toISOString().slice(0,10);
const money=n=>'₹'+Number(n||0).toFixed(2);
function save(){localStorage.setItem(key,JSON.stringify(entries));render()}
function render(){
 const q=$('search').value.toLowerCase();
 const list=entries.filter(x=>(x.customer+' '+x.code).toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date));
 $('records').innerHTML=list.map(x=>`<div class="entry"><b>${esc(x.customer)} (${esc(x.code)})</b><br>${x.date} • ${x.session} • ${x.litres} L × ${money(x.rate)} = <b>${money(x.amount)}</b></div>`).join('')||'<p class="muted">अभी कोई एंट्री नहीं है।</p>';
 const total=entries.reduce((s,x)=>s+Number(x.litres),0), amount=entries.reduce((s,x)=>s+Number(x.amount),0);
 $('totalLitres').textContent=total.toFixed(2);$('totalMoney').textContent=money(amount);
 const now=new Date(), start=new Date(now);start.setDate(now.getDate()-6);
 const month=now.toISOString().slice(0,7);
 $('weekly').textContent=money(entries.filter(x=>new Date(x.date+'T00:00:00')>=start).reduce((s,x)=>s+x.amount,0));
 $('monthly').textContent=money(entries.filter(x=>x.date.startsWith(month)).reduce((s,x)=>s+x.amount,0));
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('save').onclick=()=>{
 const customer=$('customer').value.trim(),code=$('code').value.trim(),litres=Number($('litres').value),rate=Number($('rate').value);
 if(!customer||!code||!$('date').value||litres<=0||rate<0){$('notice').textContent='कृपया नाम, कोड, तारीख, दूध और सही रेट भरें।';return}
 entries.push({customer,code,date:$('date').value,session:$('session').value,litres,rate,amount:litres*rate});
 $('litres').value='';$('notice').textContent='एंट्री सेव हो गई।';save();
};
$('search').oninput=render;
$('share').onclick=()=>{
 const lines=entries.slice(-20).map(x=>`${x.date} ${x.session}: ${x.litres}L × ₹${x.rate} = ${money(x.amount)}`);
 const msg='AP MILK बिल\n'+lines.join('\n')+'\nकुल: '+money(entries.reduce((s,x)=>s+x.amount,0));
 if(navigator.share)navigator.share({text:msg}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(msg).then(()=>$('notice').textContent='बिल कॉपी हो गया। WhatsApp में पेस्ट करें।');
};
$('export').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(entries,null,2)],{type:'application/json'}));a.download='AP-MILK-backup.json';a.click();URL.revokeObjectURL(a.href)};
$('restore').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(Array.isArray(data)){entries=data;save();$('notice').textContent='Backup वापस आ गया।'}}catch{$('notice').textContent='Backup फाइल सही नहीं है।'}};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();