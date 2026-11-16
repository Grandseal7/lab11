
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=n=>n.toLocaleString('ru-RU',{maximumFractionDigits:2});
function line(g,P,c,w=2,dash=[]){g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.strokeStyle=c;g.lineWidth=w;g.setLineDash(dash);g.stroke();g.setLineDash([])}
function dot(g,x,y,r,c){g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=c;g.fill()}
function axes(g){g.strokeStyle='#cfdbe3';g.lineWidth=1;for(let y=45;y<300;y+=50){g.beginPath();g.moveTo(42,y);g.lineTo(735,y);g.stroke()}}
function synthetic(n=24){return Array.from({length:n},(_,i)=>({e:21+5*Math.sin(i*.42)+i*.16+((i*17)%7)*.35,w:290+45*Math.cos(i*.31)+((i*11)%9)*3}))}
function drawSeries(canvas,extra=false,threshold=15){
 if(!canvas)return;const g=canvas.getContext('2d'),W=760,H=310,A=synthetic(24);g.clearRect(0,0,W,H);axes(g);
 const y=v=>275-(v-10)*4.4,x=i=>48+i*29;
 line(g,A.map((v,i)=>[x(i),y(v.e)]),'#3E7D4F',3);
 A.forEach((v,i)=>dot(g,x(i),y(v.e),3,'#3E7D4F'));
 if(extra){let vals=A.map((v,i)=>v.e+(i>17?((i-17)*2.8):0));line(g,vals.map((v,i)=>[x(i),y(v)]),'#B5472F',2.5);line(g,[[42,y(21*(1+threshold/100))],[735,y(21*(1+threshold/100))]],'#D9A441',1.5,[6,4]);}
 g.fillStyle='#12263A';g.font='13px sans-serif';g.fillText('Потребление, кВт·ч',48,22);g.fillText('Интервалы по 5 минут →',550,300);
}
if($('#chart')&&location.pathname.endsWith('stage2.html'))drawSeries($('#chart'));
if($('#chart')&&location.pathname.endsWith('stage3.html')){
 const f=$('main'),load=$('[name=load]'),mode=$('[name=mode]'),update=()=>{$('#loadVal').textContent=load.value+'%'};load.addEventListener('input',update);update();
 const calc=()=>{let l=+load.value/100,m=+mode.value,base=22,lin=13+17*l*m,forest=12+18*Math.pow(l,.82)*m;$('#base').textContent=fmt(base)+' кВт·ч';$('#linear').textContent=fmt(lin)+' кВт·ч';$('#forest').textContent=fmt(forest)+' кВт·ч';drawSeries($('#chart'));let g=$('#chart').getContext('2d');dot(g,700,275-(forest-10)*4.4,7,'#D9A441')};
 $('#predict').addEventListener('click',calc);calc();
}
if($('#chart')&&location.pathname.endsWith('stage4.html')){
 const ep=$('[name=epochs]');ep.addEventListener('input',()=>$('#epochVal').textContent=ep.value);
 const draw=()=>{const c=$('#chart'),g=c.getContext('2d');g.clearRect(0,0,760,310);axes(g);let actual=[],pred=[];for(let i=0;i<24;i++){let v=23+5*Math.sin(i*.4)+i*.12;actual.push([48+i*29,275-(v-10)*4.4]);pred.push([48+i*29,275-(v+Math.sin(i*.8)*1.1-10)*4.4])}line(g,actual,'#12263A',3);line(g,pred,'#D9A441',2.5,[6,4]);actual.forEach(p=>dot(g,...p,3,'#3E7D4F'))};
 $('#train').addEventListener('click',()=>{$('#lstmOut').innerHTML=`Демо-обучение завершено: ${ep.value} эпох. Временное окно: ${$('[name=window]').value} наблюдений. Валидационная ошибка: <b>1.78 кВт·ч</b> (иллюстративное значение).`;draw()});draw();
}
if($('#chart')&&location.pathname.endsWith('stage5.html')){
 const t=$('[name=threshold]'),a=$('[name=anomaly]');const update=()=>{ $('#thresholdVal').textContent=t.value+'%';drawSeries($('#chart'),a.checked,+t.value);let alert=$('#alert');if(a.checked&&+t.value<25)alert.innerHTML='<span class="status warn">Предупреждение</span> Обнаружено отклонение потребления энергии. Требуется проверка режима работы оборудования.';else alert.innerHTML='<span class="status">Норма</span> Существенных отклонений не обнаружено.';$('#anomalyOut').textContent=a.checked?'В последних интервалах смоделировано повышение фактического потребления.':'Показан штатный синтетический ряд.'};t.addEventListener('input',update);a.addEventListener('change',update);update();
}
if($('#chart')&&location.pathname.endsWith('stage6.html')){
 const plan=$('[name=plan]'),raw=$('[name=raw]');function upd(){$('#planVal').textContent=fmt(+plan.value)+' л';$('#rawVal').textContent=raw.value+'%'}plan.addEventListener('input',upd);raw.addEventListener('input',upd);upd();
 function optimize(){let p=+plan.value,cap=5200*(+raw.value/100),out=Math.min(p,cap),rows=[['Одна линия',out, out*.132,out*1.82],['Две линии',out,out*.119,out*1.74],['Сдвиг запуска партий',out,out*.124,out*1.68]];let feasible=out>=p;$('#options').innerHTML='<tr><th>Вариант</th><th>Выпуск, л</th><th>Энергия, кВт·ч</th><th>Вода, л</th><th>Статус</th></tr>'+rows.map((r,i)=>`<tr><td>${r[0]}</td><td>${fmt(r[1])}</td><td>${fmt(r[2])}</td><td>${fmt(r[3])}</td><td>${feasible?'<span class="status">Допустим</span>':'<span class="status bad">План недоступен</span>'}</td></tr>`).join('');let best=rows[2];$('#bestName').textContent=best[0];$('#energyPer').textContent=(best[2]/best[1]).toFixed(3);$('#waterPer').textContent=(best[3]/best[1]).toFixed(2);let g=$('#chart').getContext('2d');g.clearRect(0,0,760,290);axes(g);rows.forEach((r,i)=>{g.fillStyle=['#12263A','#3E7D4F','#D9A441'][i];g.fillRect(100+i*190,275-r[2]*.32,70,r[2]*.32);g.fillStyle='#12263A';g.fillText(r[0],75+i*190,290)});}
 $('#optimize').addEventListener('click',optimize);optimize();
}
if($('#chart')&&location.pathname.endsWith('stage7.html')){
 const c=$('#chart'),g=c.getContext('2d');function plant(){g.clearRect(0,0,760,280);let blocks=[['Резервуар',45,100,130,80],['Пастеризатор',225,100,130,80],['Охладитель',405,100,130,80],['Фасовка',585,100,130,80]];blocks.forEach((b,i)=>{g.fillStyle='#fff';g.strokeStyle='#cfdbe3';g.lineWidth=2;g.fillRect(b[1],b[2],b[3],b[4]);g.strokeRect(b[1],b[2],b[3],b[4]);g.fillStyle='#12263A';g.font='14px sans-serif';g.fillText(b[0],b[1]+18,b[2]+43);if(i<3){line(g,[[b[1]+b[3],140],[blocks[i+1][1],140]],'#3E7D4F',4);}})}plant();
 const info={tank:['Резервуар сырья','Уровень 82% · Температура 4°C','Энергия 4.2 кВт·ч','Проверить уровень сырья'],pasteur:['Пастеризатор','Температура 74°C · Загрузка 78%','Энергия 18.6 кВт·ч','Сохранять заданный тепловой режим'],cooler:['Охладитель','Температура выхода 4°C','Энергия 9.1 кВт·ч · Вода 120 л','Контролировать охлаждающий контур'],filler:['Фасовочная линия','Производительность 1 200 л/ч','Энергия 7.8 кВт·ч','Следить за простоями и упаковкой']};
 $$('.machine').forEach(b=>b.addEventListener('click',()=>{let d=info[b.dataset.machine];$('#machineInfo').innerHTML=`<h3>${d[0]}</h3><p>${d[1]}</p><p>Фактический расход: <b>${d[2]}</b></p><p>Прогноз на следующий интервал: <b>+2.5%</b></p><p>Рекомендуемое действие: ${d[3]}</p>`}));
 $('#apply').addEventListener('click',()=>{let s=$('[name=scenario]').value;let statuses=$$('.machine .status');statuses.forEach((el,i)=>{el.className='status';el.textContent='Работает'});if(s==='high'){statuses[1].className='status warn';statuses[1].textContent='Предупреждение';$('#machineInfo').innerHTML='<h3>Сценарий: повышенное потребление</h3><p>Зафиксирован рост энергопотребления. Рекомендуется проверить загрузку и режим работы оборудования.</p>'}else if(s==='idle'){statuses[3].className='status warn';statuses[3].textContent='Ожидание';$('#machineInfo').innerHTML='<h3>Сценарий: ожидание линии</h3><p>Фасовочная линия временно не работает. Система показывает снижение выпуска.</p>'}else if(s==='wash'){statuses.forEach(el=>{el.className='status warn';el.textContent='Мойка'});$('#machineInfo').innerHTML='<h3>Сценарий: мойка</h3><p>Расход воды увеличен. Производственный выпуск на время мойки остановлен.</p>'}else{$('#machineInfo').innerHTML='<h3>Штатный режим</h3><p>Оборудование работает в нормальном режиме. Все показатели находятся в пределах учебных ограничений.</p>'}});
}
