(function(){'use strict';let d=data();function data(){let r=localStorage.getItem('q');if(!r||!(JSON.parse(r).books)){let n=['English','Literature','Science','Mathematics','History','Technology','Art','Philosophy'];let a=(i,s)=>n[i%8];let l=(i)=>({id:i+1,title:`Book Title ${i+1}`,author:`Author ${i+1}`,isbn:`978-${String(i+1).padStart(7,'0')}`,genre:a(i),qty:Math.floor(Math.random()*5)+1,year:2015+Math.floor(Math.random()*10)});let b=Array.from({length:40},(_,i)=>l(i));let m=Array.from({length:20},(_,i)=>({id:i+1,name:`Member ${i+1}`,email:`member${i+1}@mail.com`,phone:`0${String(555+Math.floor(Math.random()*444)).padStart(10,'0')}`,joined:new Date(2020+Math.floor(Math.random()*5),Math.floor(Math.random()*12),Math.floor(Math.random()*28)+1).toISOString().slice(0,10)}));let t=Array.from({length:30},(_,i)=>{let bk=b[Math.floor(Math.random()*b.length)];let mb=m[Math.floor(Math.random()*m.length)];let d1=new Date(2024,Math.floor(Math.random()*8),Math.floor(Math.random()*28)+1);let d2=new Date(d1);d2.setDate(d2.getDate()+14+Math.floor(Math.random()*14));return{id:i+1,bookTitle:bk.title,memberName:mb.name,borrowDate:d1.toISOString().slice(0,10),dueDate:d2.toISOString().slice(0,10),returnDate:Math.random()>0.3?function(){let r=new Date(d2);r.setDate(r.getDate()+Math.floor(Math.random()*5)-2);return r.toISOString().slice(0,10)}():null,renewCount:Math.floor(Math.random()*2)}});let rv={books:b,members:m,transactions:t};localStorage.setItem('q',JSON.stringify(rv));return rv}else{return JSON.parse(r)}}
function sv(){localStorage.setItem('q',JSON.stringify(d))}
function id(){return Math.max(...d.books.map(b=>b.id),...d.members.map(m=>m.id),...d.transactions.map(t=>t.id),0)+1}

let cv='dashboard';let cp={books:1,members:1,borrowing:1,overdue:1};let pp=10;let memberPage=1;let cs={books:{col:'',dir:''},borrowing:{col:'',dir:''},members:{col:'',dir:''},overdue:{col:'',dir:''}};let is=0;

let $=s=>document.querySelector(s);let $$=s=>document.querySelectorAll(s);let vv=s=>document.getElementById('view-'+s);

function toast(m,t){let p=$('#toast-pool');let e=document.createElement('div');e.className='toast '+t;e.innerHTML=(t=='info'?'<i class="fa-solid fa-circle-info"></i>':t=='s'?'<i class="fa-solid fa-circle-check"></i>':t=='e'?'<i class="fa-solid fa-circle-exclamation"></i>':'<i class="fa-solid fa-triangle-exclamation"></i>')+m;p.appendChild(e);setTimeout(()=>{e.style.animation='so .25s ease forwards';setTimeout(()=>e.remove(),260)},3000)}

function esc(e){e&&e.preventDefault();$('#modal-root').hidden=true;$('#modal-bg').onclick=null;document.body.classList.remove('mo')}

function gen(n){return n>0?'<span class="genre">'+n+'</span>':''}

function navView(v){Object.values(cs).forEach(s=>{s.col='';s.dir=''});cv=v;$$('.tb-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==v));$$('.view').forEach(x=>x.classList.toggle('active',x.id=='view-'+v));render(v)}

function processBorrowData(bk,id){let view=vv('borrowing');let f=view.querySelector('#f-borrow-book');if(bk){f.value=bk.title}let mi=view.querySelector('#f-borrow-member');if(id){mi.value=id}}

function confirmDel(msg,cb){$('#modal-title').textContent='Confirm';$('#modal-bd').innerHTML='<p style="font-size:0.88rem;color:var(--t2)">'+msg+'</p>';$('#modal-ft').innerHTML='<button class="btn btn-g" data-act="cancel">Cancel</button><button class="btn btn-d" data-act="confirm" data-cb="'+cb+'">Delete</button>';$('#modal-root').hidden=false;$('#modal-root').className='modal-bx slim';document.body.classList.add('mo');$('#modal-bg').onclick=esc}

function badge(t){let n=0;d.transactions.forEach(x=>{if(t=='overdue'&&!x.returnDate){let d2=new Date(x.dueDate);if(d2<new Date())n++}else if(t=='borrowed'&&!x.returnDate){n++}});return n}

function overdueCount(){let n=0;d.transactions.forEach(x=>{if(!x.returnDate&&new Date(x.dueDate)<new Date())n++});return n}

function calcLateFee(due){let d1=new Date(due);let d2=new Date();let diff=Math.floor((d2-d1)/(86400000));return diff>0?diff*50:0}

function today(){return new Date().toISOString().slice(0,10)}

function sorter(arr,col,dir){return[...arr].sort((a,b)=>{let va=a[col]||'';let vb=b[col]||'';if(typeof va=='number'&&typeof vb=='number')return dir=='asc'?va-vb:vb-va;va=String(va).toLowerCase();vb=String(vb).toLowerCase();if(dir=='asc'){return va.localeCompare(vb)}else{return vb.localeCompare(va)}})}

function colClick(view,e){let th=e.target.closest('th.st');if(!th)return;let col=th.dataset.col;let vn=view.id.replace('view-','');if(!cs[vn])cs[vn]={col:'',dir:''};let s=cs[vn];let dir=s.col==col&&s.dir=='asc'?'dsc':'asc';s.col=col;s.dir=dir=='asc'?'asc':'dsc';render(vn)}

function pageClick(e){let btn=e.target.closest('.pgr button');if(!btn)return;let vn=cv;let p=parseInt(btn.dataset.p);if(!isNaN(p)&&p>=1){cp[vn]=p;render(vn)}}

document.addEventListener('DOMContentLoaded',()=>{
  navView('dashboard');
  $('#tb-nav').addEventListener('click',e=>{let btn=e.target.closest('.tb-btn');if(!btn)return;let v=btn.dataset.view;if(v){navView(v)}});
  $('#btn-export').addEventListener('click',exportCSV);
  document.addEventListener('keydown',e=>{if(e.key=='/'&&!['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();let s=vv(cv).querySelector('.sbox input');if(s)s.focus()}});
  $('#modal-x').addEventListener('click',esc);
  $('#modal-bg').addEventListener('click',esc);
  document.addEventListener('keydown',e=>{if(e.key=='Escape')esc()});
  $('#modal-ft').addEventListener('click',e=>{let btn=e.target.closest('button');if(!btn)return;let act=btn.dataset.act;if(act=='cancel'){esc()}else if(act=='confirm'){let cb=btn.dataset.cb;esc();setTimeout(()=>eval(cb)(),200)}});
  setInterval(()=>{let b=$('#badge-overdue');let n=overdueCount();if(n>0){b.hidden=false;b.textContent=n}else{b.hidden=true}},5000);
});

function render(vn){
  let view=vv(vn);if(!view)return;
  view.innerHTML='';
  is=0;
  if(vn=='dashboard')renderDashboard(view);
  else if(vn=='books')renderBooks(view);
  else if(vn=='members')renderMembers(view);
  else if(vn=='borrowing')renderBorrowing(view);
  else if(vn=='overdue')renderOverdue(view);
}

function inc(vn){let view=vv(vn);if(is==0){is=1;let a=0;let t=view.querySelectorAll('.counter');let l=t.length;if(!l)return;function u(){a++;if(a>60||is==0){t.forEach(el=>{el.textContent=el.dataset.n});return}t.forEach(el=>{let cur=parseInt(el.textContent)||0;let target=parseInt(el.dataset.n);let v=Math.round(cur+(target-cur)*0.15);if(Math.abs(target-v)<1)v=target;el.textContent=v});requestAnimationFrame(u)}u()}}

function renderDashboard(view){
  let stats=[
    {i:'fa-solid fa-book',c:'coral',n:d.books.length,l:'books'},
    {i:'fa-solid fa-users',c:'green',n:d.members.length,l:'members'},
    {i:'fa-solid fa-hand-holding-heart',c:'cyan',n:badge('borrowed'),l:'borrowed'},
    {i:'fa-solid fa-clock',c:'amber',n:badge('overdue'),l:'overdue'},
    {i:'fa-solid fa-money-bill-wave',c:'red',n:'KSH',l:'revenue'}
  ];
  view.innerHTML='<div class="page-hd"><div><h1><i class="fa-solid fa-chart-pie"></i>Dashboard</h1><div class="page-sub">Library overview</div></div></div><div class="stats" id="d-stats">'+stats.map(s=>'<div class="stat"><div class="stat-icon '+s.c+'"><i class="'+s.i+'"></i></div><div class="stat-body"><span class="stat-num">'+(typeof s.n=='number'?'<span class="counter" data-n="'+s.n+'">0</span>':s.n)+'</span><span class="stat-lbl">'+s.l+'</span></div></div>').join('')+'</div>';
  let g={};d.books.forEach(b=>{g[b.genre]=(g[b.genre]||0)+1});let genres=Object.keys(g).sort((a,b)=>g[b]-g[a]);let max=Math.max(...Object.values(g),1);
  let txn=d.transactions.slice(-10).reverse();
  view.innerHTML+='<div class="dash-grid"><div class="panel"><div class="panel-title"><i class="fa-solid fa-chart-simple"></i>Books by Genre</div><div class="chart">'+(genres.length?genres.map(ge=>'<div class="chart-row"><span class="chart-lbl">'+gen(ge)+'</span><div class="chart-track"><div class="chart-fill" style="width:0%" data-w="'+(g[ge]/max*100)+'"></div></div><span class="chart-num">'+g[ge]+'</span></div>').join(''):'<div class="chart-empty">No genres</div>')+'</div></div><div class="panel"><div class="panel-title"><i class="fa-solid fa-arrows-spin"></i>Recent Activity</div>'+(txn.length?txn.map(t=>'<div class="txn-item"><div class="txn-icon"><i class="fa-solid fa-'+(t.returnDate?'rotate-left':'book')+'"></i></div><div class="txn-info"><div class="txn-title">'+t.bookTitle+'</div><div class="txn-sub">'+t.memberName+(t.returnDate?' · returned ':' · borrowed ')+'</div></div><span class="txn-date">'+t.borrowDate.slice(5)+'</span></div>').join(''):'<div class="txn-empty">No transactions yet</div>')+'</div></div>';
  requestAnimationFrame(()=>{inc('dashboard');Array.from(view.querySelectorAll('.chart-fill')).forEach(el=>{el.style.width=el.dataset.w+'%'})})
}

function renderBooks(view){
  let bk=view.querySelector('#search-books');
  let search=bk?bk.value.toLowerCase():'';
  let sel=view.querySelector('#filter-books');
  let genreFilter=sel?sel.value:'';
  let items=d.books.filter(b=>{
    if(search&&!b.title.toLowerCase().includes(search)&&!b.author.toLowerCase().includes(search)&&!b.isbn.includes(search))return false;
    if(genreFilter&&b.genre!=genreFilter)return false;
    return true
  });
  let vn='books';let s=cs[vn];if(s.col){items=sorter(items,s.col,s.dir)}
  let p=cp[vn]||1;let total=items.length;let max=Math.ceil(total/pp);if(p>max)p=max||1;let start=(p-1)*pp;let pg=items.slice(start,start+pp);
  let genres=[...new Set(d.books.map(b=>b.genre))].sort();
  view.innerHTML='<div class="page-hd"><div><h1><i class="fa-solid fa-book"></i>Books</h1><div class="page-sub">'+d.books.length+' total titles</div></div><button class="btn btn-p" data-act="add-book"><i class="fa-solid fa-plus"></i>Add Book</button></div><div class="toolbar"><div class="sbox"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="search-books" placeholder="Search books..." value="'+(search||'')+'"></div><select class="sel" id="filter-books"><option value="">All Genres</option>'+genres.map(g=>'<option value="'+g+'"'+(genreFilter==g?' selected':'')+'>'+g+'</option>').join('')+'</select></div><div class="bgrid">'+(pg.length?pg.map(b=>{
    let ci=b.id%8;let available=b.qty-d.transactions.filter(t=>t.bookTitle==b.title&&!t.returnDate).length;
    return '<div class="bcard"><div class="bcvr c'+ci+'"><i class="fa-solid fa-book-bookmark"></i></div><div class="bbd"><div class="btl">'+b.title+'</div><div class="baut">'+b.author+'</div><div class="bmt"><span><i class="fa-solid fa-fingerprint"></i>'+b.isbn.slice(-6)+'</span><span><i class="fa-solid fa-calendar"></i>'+b.year+'</span>'+gen(b.genre)+'</div></div><div class="bft"><span class="badge-c '+(available>0?'ok':'no')+'">'+(available>0?'Available ('+available+')':'Out')+'</span><div class="arow"><button class="btn-icon" data-act="edit-book" data-id="'+b.id+'" title="Edit"><i class="fa-solid fa-pen"></i></button><button class="btn-icon d" data-act="del-book" data-id="'+b.id+'" title="Delete"><i class="fa-solid fa-trash"></i></button></div></div></div>'
  }).join(''):'<div class="empty" style="grid-column:1/-1"><i class="fa-solid fa-book-open"></i><p>No books found</p></div>')+'</div>';
  view.innerHTML+=pgr(total,p,max,vn);
  view.querySelector('#search-books')?.focus();
  view.querySelector('#search-books')?.addEventListener('input',debounce(()=>{cp[vn]=1;render(vn)},300));
  view.querySelector('#filter-books')?.addEventListener('change',()=>{cp[vn]=1;render(vn)})
}

function renderMembers(view){
  let mk=view.querySelector('#search-members');
  let search=mk?mk.value.toLowerCase():'';
  let items=d.members.filter(m=>{if(search&&!m.name.toLowerCase().includes(search)&&!m.email.toLowerCase().includes(search)&&!m.phone.includes(search))return false;return true});
  let vn='members';let s=cs[vn];if(s.col){items=sorter(items,s.col,s.dir)}
  let p=memberPage||1;let total=items.length;let max=Math.ceil(total/pp);if(p>max)p=max||1;let start=(p-1)*pp;let pg=items.slice(start,start+pp);
  view.innerHTML='<div class="page-hd"><div><h1><i class="fa-solid fa-users"></i>Members</h1><div class="page-sub">'+d.members.length+' registered</div></div><button class="btn btn-p" data-act="add-member"><i class="fa-solid fa-plus"></i>Add Member</button></div><div class="toolbar"><div class="sbox"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="search-members" placeholder="Search members..." value="'+(search||'')+'"></div></div><div class="twrap"><table class="dtbl"><thead><tr><th class="st" data-col="name">Member<span class="si"><i class="fa-solid fa-sort"></i></span></th><th class="st" data-col="email">Email<span class="si"><i class="fa-solid fa-sort"></i></span></th><th class="st" data-col="phone">Phone<span class="si"><i class="fa-solid fa-sort"></i></span></th><th class="st" data-col="joined">Joined<span class="si"><i class="fa-solid fa-sort"></i></span></th><th>Actions</th></tr></thead><tbody>'+(pg.length?pg.map(m=>{
    let mb=d.transactions.filter(t=>t.memberName==m.name);let bc=mb.filter(t=>!t.returnDate).length;
    return '<tr><td><div class="mcell"><span class="mav">'+m.name[0]+'</span><div><strong>'+m.name+'</strong></div></div></td><td>'+m.email+'</td><td>'+m.phone.slice(0,8)+'...</td><td>'+m.joined+'</td><td><div class="arow"><button class="btn-icon" data-act="edit-member" data-id="'+m.id+'" title="Edit"><i class="fa-solid fa-pen"></i></button><button class="btn-icon d" data-act="del-member" data-id="'+m.id+'" title="Delete"><i class="fa-solid fa-trash"></i></button></div></td></tr>'
  }).join(''):'<tr><td colspan="5"><div class="empty"><i class="fa-solid fa-users-slash"></i><p>No members found</p></div></td></tr>')+'</tbody></table></div>';
  view.innerHTML+=pgr(total,p,max,vn);
  view.querySelector('#search-members')?.focus();
  view.querySelector('#search-members')?.addEventListener('input',debounce(()=>{memberPage=1;render(vn)},300))
}

function renderBorrowing(view){
  let bk=view.querySelector('#search-borrowing');
  let search=bk?bk.value.toLowerCase():'';
  let fil=view.querySelector('#filter-borrowing');
  let filter=fil?fil.value:'';
  let items=d.transactions.filter(t=>{
    if(search&&!t.bookTitle.toLowerCase().includes(search)&&!t.memberName.toLowerCase().includes(search))return false;
    if(filter=='active'&&t.returnDate)return false;
    if(filter=='returned'&&!t.returnDate)return false;
    return true
  });
  let vn='borrowing';let s=cs[vn];if(s.col){items=sorter(items,s.col,s.dir)}
  let p=cp[vn]||1;let total=items.length;let max=Math.ceil(total/pp);if(p>max)p=max||1;let start=(p-1)*pp;let pg=items.slice(start,start+pp);
  let now=new Date();
  view.innerHTML='<div class="page-hd"><div><h1><i class="fa-solid fa-hand-holding-heart"></i>Borrowing</h1><div class="page-sub">Manage book loans</div></div><button class="btn btn-p" data-act="borrow-book"><i class="fa-solid fa-plus"></i>Borrow</button></div><div class="toolbar"><div class="sbox"><i class="fa-solid fa-magnifying-glass"></i><input type="text" id="search-borrowing" placeholder="Search by book or member..." value="'+(search||'')+'"></div><select class="sel" id="filter-borrowing"><option value="">All</option><option value="active"'+(filter=='active'?' selected':'')+'>Active</option><option value="returned"'+(filter=='returned'?' selected':'')+'>Returned</option></select></div><div class="twrap"><table class="dtbl"><thead><tr><th class="st" data-col="bookTitle">Book<span class="si"><i class="fa-solid fa-sort"></i></span></th><th class="st" data-col="memberName">Member<span class="si"><i class="fa-solid fa-sort"></i></span></th><th class="st" data-col="borrowDate">Borrowed<span class="si"><i class="fa-solid fa-sort"></i></span></th><th class="st" data-col="dueDate">Due<span class="si"><i class="fa-solid fa-sort"></i></span></th><th>Status</th><th>Actions</th></tr></thead><tbody>'+(pg.length?pg.map(t=>{
    let od=!t.returnDate&&new Date(t.dueDate)<now;let st=t.returnDate?'returned':od?'overdue':'borrowed';
    return '<tr class="'+(od?'orow':'')+'"><td><strong>'+t.bookTitle+'</strong></td><td>'+t.memberName+'</td><td>'+t.borrowDate+'</td><td>'+t.dueDate+'</td><td><span class="sbadge '+st+'"><i class="fa-solid fa-'+(st=='returned'?'check':od?'exclamation':'book')+'"></i>'+(st=='returned'?'Returned '+t.returnDate:st=='overdue'?'Overdue':'Borrowed '+t.renewCount)+'</span></td><td>'+(t.returnDate?'<span class="sbadge returned"><i class="fa-solid fa-check"></i>Done</span>':'<div class="arow"><button class="btn-icon" data-act="return-book" data-id="'+t.id+'" title="Return"><i class="fa-solid fa-rotate-left"></i></button><button class="btn-icon" data-act="renew-book" data-id="'+t.id+'" title="Renew"><i class="fa-solid fa-arrow-rotate-right"></i></button></div>')+'</td></tr>'
  }).join(''):'<tr><td colspan="6"><div class="empty"><i class="fa-solid fa-book"></i><p>No borrowing records</p></div></td></tr>')+'</tbody></table></div>';
  view.innerHTML+=pgr(total,p,max,vn);
  view.querySelector('#search-borrowing')?.focus();
  view.querySelector('#search-borrowing')?.addEventListener('input',debounce(()=>{cp[vn]=1;render(vn)},300));
  view.querySelector('#filter-borrowing')?.addEventListener('change',()=>{cp[vn]=1;render(vn)})
}

function renderOverdue(view){
  let now=new Date();let items=d.transactions.filter(t=>!t.returnDate&&new Date(t.dueDate)<now);
  let vn='overdue';let s=cs[vn];if(s.col){items=sorter(items,s.col,s.dir)}
  let p=cp[vn]||1;let total=items.length;let max=Math.ceil(total/pp);if(p>max)p=max||1;let start=(p-1)*pp;let pg=items.slice(start,start+pp);
  view.innerHTML='<div class="page-hd"><div><h1><i class="fa-solid fa-clock"></i>Overdue</h1><div class="page-sub">'+items.length+' items overdue</div></div></div>'+(items.length?'<div class="twrap"><table class="dtbl"><thead><tr><th class="st" data-col="bookTitle">Book<span class="si"><i class="fa-solid fa-sort"></i></span></th><th class="st" data-col="memberName">Member<span class="si"><i class="fa-solid fa-sort"></i></span></th><th>Due Date</th><th>Days Late</th><th>Late Fee</th><th>Actions</th></tr></thead><tbody>'+pg.map(t=>{
    let d1=new Date(t.dueDate);let late=Math.floor((now-d1)/(86400000));let fee=late*50;
    return '<tr><td><strong>'+t.bookTitle+'</strong></td><td>'+t.memberName+'</td><td>'+t.dueDate+'</td><td>'+late+' days</td><td><span class="sbadge overdue"><i class="fa-solid fa-coins"></i> KSH '+fee+'</span></td><td><div class="arow"><button class="btn btn-s btn-sm" data-act="return-book" data-id="'+t.id+'"><i class="fa-solid fa-rotate-left"></i>Return</button><button class="btn-icon" data-act="view-member" data-name="'+t.memberName+'" title="Contact"><i class="fa-solid fa-eye"></i></button></div></td></tr>'
  }).join('')+'</tbody></table></div>':'<div class="empty"><i class="fa-solid fa-circle-check" style="color:var(--g);opacity:0.4;font-size:2.5rem"></i><p>No overdue items. All good!</p></div>');
  view.innerHTML+=pgr(total,p,max,vn)
}

function pgr(total,p,max,vn){
  if(total<=pp)return '';
  let r='<div class="pgr">';
  r+='<button data-p="'+(p-1)+'"'+(p<=1?' disabled':'')+'><i class="fa-solid fa-chevron-left"></i></button>';
  let s=Math.max(1,Math.min(p-2,max-4));let e=Math.min(max,s+4);
  for(let i=s;i<=e;i++){r+='<button data-p="'+i+'"'+(i==p?' class="on"':'')+'>'+i+'</button>'}
  r+='<button data-p="'+(p+1)+'"'+(p>=max?' disabled':'')+'><i class="fa-solid fa-chevron-right"></i></button>';
  r+='<span class="info">Page '+p+' of '+max+'</span></div>';
  return r
}

function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}

let contentDelegate=function(e){
  let view=e.currentTarget;
  let btn=e.target.closest('[data-act]');
  if(!btn)return;
  let act=btn.dataset.act;
  let id=btn.dataset.id;
  let cb=btn.dataset.cb;
  if(act=='add-book'){showBookForm()}
  else if(act=='edit-book'){showBookForm(parseInt(id))}
  else if(act=='del-book'){confirmDel('Delete this book?','delBook('+id+')')}
  else if(act=='add-member'){showMemberForm()}
  else if(act=='edit-member'){showMemberForm(parseInt(id))}
  else if(act=='del-member'){confirmDel('Delete this member?','delMember('+id+')')}
  else if(act=='borrow-book'){showBorrowForm()}
  else if(act=='return-book'){returnBook(parseInt(id))}
  else if(act=='renew-book'){renewBook(parseInt(id))}
  else if(act=='view-member'){let nm=btn.dataset.name;toast('Contact: '+nm,'info')}
  else if(act=='add-borrow'){addBorrow()}
  else if(act=='save-book'){saveBook()}
  else if(act=='save-member'){saveMember()}
  else if(act=='renew-ok'){let bi=parseInt(btn.dataset.bi);let mi=parseInt(btn.dataset.mi);doRenew(bi,mi)}
};
['dashboard','books','members','borrowing','overdue'].forEach(v=>{
  let el=vv(v);if(el)el.addEventListener('click',contentDelegate)
});
['dashboard','books','members','borrowing','overdue'].forEach(v=>{
  let el=vv(v);if(el)el.addEventListener('click',colClick);
  let el2=vv(v);if(el2)el2.addEventListener('click',pageClick)
});

function showBookForm(id){
  let book=id?d.books.find(b=>b.id==id):null;
  let title=book?'Edit Book':'Add Book';
  let genres=[...new Set(d.books.map(b=>b.genre))].sort();
  let html='<form id="book-form">'+'<input type="hidden" id="f-book-id" value="'+(book?book.id:'')+'">'+
    '<div class="fgroup"><label>Title</label><input type="text" id="f-book-title" value="'+(book?book.title:'')+'" placeholder="Book title" required></div>'+
    '<div class="frow"><div class="fgroup"><label>Author</label><input type="text" id="f-book-author" value="'+(book?book.author:'')+'" placeholder="Author name" required></div>'+
    '<div class="fgroup"><label>Year</label><input type="number" id="f-book-year" value="'+(book?book.year:'2025')+'" min="1800" max="2099" required></div></div>'+
    '<div class="frow"><div class="fgroup"><label>ISBN</label><input type="text" id="f-book-isbn" value="'+(book?book.isbn:'')+'" placeholder="ISBN" required></div>'+
    '<div class="fgroup"><label>Genre</label><select id="f-book-genre">'+genres.map(g=>'<option value="'+g+'"'+(book&&book.genre==g?' selected':'')+'>'+g+'</option>').join('')+'</select></div></div>'+
    '<div class="fgroup"><label>Quantity</label><input type="number" id="f-book-qty" value="'+(book?book.qty:'1')+'" min="1" max="999" required></div>'+
    '<div class="ferr" id="book-form-error"></div></form>';
  $('#modal-title').textContent=title;
  $('#modal-bd').innerHTML=html;
  $('#modal-ft').innerHTML='<button class="btn btn-g" data-act="cancel">Cancel</button><button class="btn btn-p" data-act="save-book">'+(book?'Update':'Add')+'</button>';
  $('#modal-root').hidden=false;$('#modal-root').className='modal-bx';document.body.classList.add('mo');$('#modal-bg').onclick=esc;
  $('#f-book-title').focus()
}

function saveBook(){
  let id=$('#f-book-id').value;let title=$('#f-book-title').value.trim();let author=$('#f-book-author').value.trim();let year=parseInt($('#f-book-year').value);let isbn=$('#f-book-isbn').value.trim();let genre=$('#f-book-genre').value;let qty=parseInt($('#f-book-qty').value);
  let err=$('#book-form-error');err.className='ferr';err.textContent='';
  if(!title){err.textContent='Title is required';err.className='ferr s';$('#f-book-title').focus();return}
  if(!author){err.textContent='Author is required';err.className='ferr s';$('#f-book-author').focus();return}
  if(!isbn){err.textContent='ISBN is required';err.className='ferr s';$('#f-book-isbn').focus();return}
  if(isNaN(year)||year<1800||year>2099){err.textContent='Invalid year';err.className='ferr s';$('#f-book-year').focus();return}
  if(isNaN(qty)||qty<1){err.textContent='Quantity must be at least 1';err.className='ferr s';$('#f-book-qty').focus();return}
  if(id){let b=d.books.find(x=>x.id==parseInt(id));if(b){b.title=title;b.author=author;b.year=year;b.isbn=isbn;b.genre=genre;b.qty=qty};toast('Book updated','s')}
  else{let ni=id();d.books.push({id:ni,title,author,year,isbn,genre,qty});toast('Book added','s')}
  sv();esc();render(cv)
}

function delBook(id){
  let idx=d.books.findIndex(b=>b.id==id);if(idx>-1){d.books.splice(idx,1);d.transactions=d.transactions.filter(t=>{let b=d.books.find(x=>x.title==t.bookTitle);return b||!t.returnDate?b:t.bookTitle!=t.bookTitle});sv();render(cv);toast('Book deleted','s')}
}

function showMemberForm(id){
  let member=id?d.members.find(m=>m.id==id):null;
  let title=member?'Edit Member':'Add Member';
  let html='<form id="member-form">'+'<input type="hidden" id="f-member-id" value="'+(member?member.id:'')+'">'+
    '<div class="fgroup"><label>Name</label><input type="text" id="f-member-name" value="'+(member?member.name:'')+'" placeholder="Full name" required></div>'+
    '<div class="frow"><div class="fgroup"><label>Email</label><input type="email" id="f-member-email" value="'+(member?member.email:'')+'" placeholder="Email" required></div>'+
    '<div class="fgroup"><label>Phone</label><input type="text" id="f-member-phone" value="'+(member?member.phone:'')+'" placeholder="Phone" required></div></div>'+
    '<div class="ferr" id="member-form-error"></div></form>';
  $('#modal-title').textContent=title;
  $('#modal-bd').innerHTML=html;
  $('#modal-ft').innerHTML='<button class="btn btn-g" data-act="cancel">Cancel</button><button class="btn btn-p" data-act="save-member">'+(member?'Update':'Add')+'</button>';
  $('#modal-root').hidden=false;$('#modal-root').className='modal-bx';document.body.classList.add('mo');$('#modal-bg').onclick=esc;
  $('#f-member-name').focus()
}

function saveMember(){
  let id=$('#f-member-id').value;let name=$('#f-member-name').value.trim();let email=$('#f-member-email').value.trim();let phone=$('#f-member-phone').value.trim();
  let err=$('#member-form-error');err.className='ferr';err.textContent='';
  if(!name){err.textContent='Name is required';err.className='ferr s';$('#f-member-name').focus();return}
  if(!email){err.textContent='Email is required';err.className='ferr s';$('#f-member-email').focus();return}
  if(!phone){err.textContent='Phone is required';err.className='ferr s';$('#f-member-phone').focus();return}
  if(id){let m=d.members.find(x=>x.id==parseInt(id));if(m){m.name=name;m.email=email;m.phone=phone};toast('Member updated','s')}
  else{let ni=id();d.members.push({id:ni,name,email,phone,joined:today()});toast('Member added','s')}
  sv();esc();render(cv)
}

function delMember(id){
  let idx=d.members.findIndex(m=>m.id==id);if(idx>-1){d.members.splice(idx,1);sv();render(cv);toast('Member deleted','s')}
}

function showBorrowForm(){
  let html='<form id="borrow-form">'+
    '<div class="fgroup"><label>Book</label><select id="f-borrow-book">'+d.books.filter(b=>b.qty-d.transactions.filter(t=>t.bookTitle==b.title&&!t.returnDate).length>0).map(b=>'<option value="'+b.title+'">'+b.title+' - '+d.transactions.filter(t=>t.bookTitle==b.title&&!t.returnDate).length+'/'+b.qty+'</option>').join('')+'</select></div>'+
    '<div class="fgroup"><label>Member</label><select id="f-borrow-member">'+d.members.map(m=>'<option value="'+m.name+'">'+m.name+'</option>').join('')+'</select></div>'+
    '<div class="ferr" id="borrow-form-error"></div></form>';
  $('#modal-title').textContent='Borrow Book';
  $('#modal-bd').innerHTML=html;
  $('#modal-ft').innerHTML='<button class="btn btn-g" data-act="cancel">Cancel</button><button class="btn btn-p" data-act="add-borrow">Borrow</button>';
  $('#modal-root').hidden=false;$('#modal-root').className='modal-bx';document.body.classList.add('mo');$('#modal-bg').onclick=esc
}

function addBorrow(){
  let book=$('#f-borrow-book').value;let member=$('#f-borrow-member').value;
  let err=$('#borrow-form-error');err.className='ferr';err.textContent='';
  if(!book){err.textContent='Select a book';err.className='ferr s';return}
  if(!member){err.textContent='Select a member';err.className='ferr s';return}
  let bk=d.books.find(b=>b.title==book);if(!bk){err.textContent='Book not found';err.className='ferr s';return}
  let borrowed=d.transactions.filter(t=>t.bookTitle==book&&!t.returnDate).length;
  if(borrowed>=bk.qty){err.textContent='No copies available';err.className='ferr s';return}
  let ni=id();let d1=new Date();let d2=new Date(d1);d2.setDate(d2.getDate()+14);
  d.transactions.push({id:ni,bookTitle:book,memberName:member,borrowDate:today(),dueDate:d2.toISOString().slice(0,10),returnDate:null,renewCount:0});
  sv();esc();render(cv);toast('Book borrowed: '+book,'s')
}

function returnBook(id){
  let txn=d.transactions.find(t=>t.id==id);if(!txn){toast('Transaction not found','e');return}
  txn.returnDate=today();sv();render(cv);toast('Book returned: '+txn.bookTitle,'s')
}

function renewBook(id){
  let txn=d.transactions.find(t=>t.id==id);if(!txn){toast('Transaction not found','e');return}
  if(txn.renewCount>=4){toast('Maximum renewals reached','w');return}
  txn.renewCount=(txn.renewCount||0)+1;let d2=new Date(txn.dueDate);d2.setDate(d2.getDate()+14);
  txn.dueDate=d2.toISOString().slice(0,10);sv();render(cv);toast('Book renewed: '+txn.bookTitle,'s')
}

function exportCSV(){
  let rows=[['ID','Title','Author','ISBN','Genre','Year','Quantity']];
  d.books.forEach(b=>{rows.push([b.id,b.title,b.author,b.isbn,b.genre,b.year,b.qty])});
  let csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
  let blob=new Blob([csv],{type:'text/csv'});let a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='quantio_books_'+today()+'.csv';document.body.appendChild(a);a.click();
  a.remove();URL.revokeObjectURL(a.href);toast('CSV exported','s')
}
})();
