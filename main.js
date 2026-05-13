import {
loadData,
saveData
} from './storage.js';

const app =
document.getElementById('app');

const months = [
'Styczeń',
'Luty',
'Marzec',
'Kwiecień',
'Maj',
'Czerwiec',
'Lipiec',
'Sierpień',
'Wrzesień',
'Październik',
'Listopad',
'Grudzień'
];

const monthDays = {
'Styczeń':31,
'Luty':28,
'Marzec':31,
'Kwiecień':30,
'Maj':31,
'Czerwiec':30,
'Lipiec':31,
'Sierpień':31,
'Wrzesień':30,
'Październik':31,
'Listopad':30,
'Grudzień':31
};

async function startApp(){

let crmData =
await loadData() || {};

/* =========================
DASHBOARD
========================= */

const dashboard =
document.createElement('div');

dashboard.className =
'dashboard';

app.appendChild(dashboard);

/* =========================
NOTIFICATIONS
========================= */

function renderNotifications(){

const old =
document.querySelector(
'.notificationsBar'
);

if(old){
old.remove();
}

const notifications =
document.createElement('div');

notifications.className =
'notificationsBar';

const today =
new Date();

const tomorrow =
new Date();

tomorrow.setDate(
today.getDate()+1
);

const currentMonth =
months[today.getMonth()];

const tomorrowMonth =
months[tomorrow.getMonth()];

const todayDay =
today.getDate();

const tomorrowDay =
tomorrow.getDate();

const todayKey =
`${currentMonth}-${todayDay}`;

const tomorrowKey =
`${tomorrowMonth}-${tomorrowDay}`;

const todayVisits =
crmData[todayKey] || [];

const tomorrowVisits =
crmData[tomorrowKey] || [];

let html='';

if(todayVisits.length){

html += `

<div class="notificationCard">

<h3>
📅 Dzisiaj
</h3>

${todayVisits.map(visit=>`

<div class="notificationItem">

<b>
${visit.hour || '--:--'}
</b>

- ${visit.client || '-'}

(${visit.car || '-'})

</div>

`).join('')}

</div>

`;

}

if(tomorrowVisits.length){

html += `

<div class="notificationCard">

<h3>
🔔 Jutro
</h3>

${tomorrowVisits.map(visit=>`

<div class="notificationItem">

<b>
${visit.hour || '--:--'}
</b>

- ${visit.client || '-'}

(${visit.car || '-'})

</div>

`).join('')}

</div>

`;

}

let unpaid=[];

Object.keys(crmData)
.forEach(date=>{

crmData[date]
.forEach(visit=>{

if(
visit.paymentStatus !== 'Zapłacono'
){

unpaid.push(visit);

}

});

});

if(unpaid.length){

html += `

<div class="notificationCard warningCard">

<h3>
💸 Oczekujące płatności
</h3>

${unpaid.slice(0,5).map(visit=>`

<div class="notificationItem">

${visit.client || '-'}

- ${visit.car || '-'}

</div>

`).join('')}

</div>

`;

}

if(!html){

html = `

<div class="notificationCard">

Brak powiadomień

</div>

`;

}

notifications.innerHTML = html;

app.insertBefore(
notifications,
dashboard
);

}

/* =========================
TOP BAR
========================= */

const topBar =
document.createElement('div');

topBar.className =
'topBar';

app.appendChild(topBar);

const calendarBtn =
document.createElement('button');

calendarBtn.className =
'topBtn activeTopBtn';

calendarBtn.innerHTML =
'📅 Kalendarz';

topBar.appendChild(calendarBtn);

/* =========================
BACKUP
========================= */

const exportBtn =
document.createElement('button');

exportBtn.className =
'topBtn';

exportBtn.innerHTML =
'📥 Backup';

topBar.appendChild(exportBtn);

const importBtn =
document.createElement('button');

importBtn.className =
'topBtn';

importBtn.innerHTML =
'📤 Import';

topBar.appendChild(importBtn);

const importInput =
document.createElement('input');

importInput.type='file';
importInput.accept='.json';
importInput.style.display='none';

document.body.appendChild(importInput);

exportBtn.addEventListener(
'click',
()=>{

const dataStr =
JSON.stringify(
crmData,
null,
2
);

const blob =
new Blob(
[dataStr],
{
type:'application/json'
}
);

const url =
URL.createObjectURL(blob);

const a =
document.createElement('a');

a.href = url;

a.download =
`dejavu-backup.json`;

a.click();

URL.revokeObjectURL(url);

}
);

importBtn.addEventListener(
'click',
()=>{

importInput.click();

}
);

importInput.addEventListener(
'change',
async event=>{

const file =
event.target.files[0];

if(!file){
return;
}

const reader =
new FileReader();

reader.onload =
async function(e){

try{

crmData =
JSON.parse(
e.target.result
);

await saveData(crmData);

alert(
'Backup przywrócony'
);

location.reload();

}
catch{

alert(
'Błąd pliku backupu'
);

}

};

reader.readAsText(file);

}
);

/* =========================
SEARCH
========================= */

const searchInput =
document.createElement('input');

searchInput.className =
'searchInput';

searchInput.placeholder =
'🔎 Szukaj klienta, telefonu lub auta';

app.appendChild(searchInput);

/* =========================
MONTHS
========================= */

const monthTabs =
document.createElement('div');

monthTabs.className =
'monthTabs';

app.appendChild(monthTabs);

const calendar =
document.createElement('div');

app.appendChild(calendar);

/* =========================
DASHBOARD
========================= */

function renderDashboard(){

dashboard.innerHTML='';

let totalRevenue = 0;
let totalVisits = 0;
let waitingPayments = 0;
let inProgress = 0;
let readyCars = 0;

const serviceStats = {};

Object.keys(crmData)
.forEach(date=>{

crmData[date]
.forEach(visit=>{

totalVisits++;

let total =
(visit.services || [])
.reduce(
(sum,s)=>sum+s.price,
0
);

const final =
total - (
total *
((visit.discount || 0)/100)
);

totalRevenue += final;

if(
visit.paymentStatus !== 'Zapłacono'
){
waitingPayments += final;
}

if(
visit.status === 'W trakcie' ||
visit.status === 'Korekta' ||
visit.status === 'Powłoka'
){
inProgress++;
}

if(
visit.status === 'Gotowe'
){
readyCars++;
}

(visit.services || [])
.forEach(service=>{

if(!serviceStats[service.name]){
serviceStats[service.name]=0;
}

serviceStats[service.name]++;

});

});

});

const topServices =
Object.entries(serviceStats)
.sort((a,b)=>b[1]-a[1])
.slice(0,5);

dashboard.innerHTML = `

<div class="dashCard">
<h3>💰 Obrót</h3>
<div class="dashValue">
${Math.round(totalRevenue)} zł
</div>
</div>

<div class="dashCard">
<h3>📅 Wizyty</h3>
<div class="dashValue">
${totalVisits}
</div>
</div>

<div class="dashCard">
<h3>⏳ W trakcie</h3>
<div class="dashValue">
${inProgress}
</div>
</div>

<div class="dashCard">
<h3>✅ Gotowe</h3>
<div class="dashValue">
${readyCars}
</div>
</div>

<div class="dashCard">
<h3>💸 Oczekujące</h3>
<div class="dashValue">
${Math.round(waitingPayments)} zł
</div>
</div>

<div class="dashCard">
<h3>🔥 Top usługi</h3>

<div style="
margin-top:15px;
line-height:1.8;
font-size:14px;
">

${topServices.map(service=>`

<div>
${service[0]} (${service[1]})
</div>

`).join('')}

</div>

</div>

`;

}

/* =========================
AUTO
========================= */

function createCarOptions(){

if(typeof carDatabase === 'undefined'){
return '';
}

let html='';

Object.keys(carDatabase)
.sort()
.forEach(brand=>{

const models =
carDatabase[brand].models;

Object.keys(models)
.sort()
.forEach(model=>{

html += `
<option value="${brand} ${model}">
${brand} ${model}
</option>
`;

});

});

return html;

}

/* =========================
STATUS
========================= */

function updateStatusColor(card,status){

card.classList.remove(
'status-new',
'status-progress',
'status-correction',
'status-coating',
'status-ready',
'status-done'
);

switch(status){

case 'Przyjęte':
card.classList.add('status-new');
break;

case 'W trakcie':
card.classList.add('status-progress');
break;

case 'Korekta':
card.classList.add('status-correction');
break;

case 'Powłoka':
card.classList.add('status-coating');
break;

case 'Gotowe':
card.classList.add('status-ready');
break;

case 'Wydane':
card.classList.add('status-done');
break;

}

}

/* =========================
SAVE
========================= */

async function saveVisits(
month,
day,
container
){

const key =
`${month}-${day}`;

const cards =
Array.from(
container.querySelectorAll(
'.visitCard'
)
);

crmData[key] =
cards.map(card=>{

const checkedServices=[];

card.querySelectorAll(
'.serviceCheck:checked'
)
.forEach(service=>{

checkedServices.push({

name:
service.dataset.name,

price:
Number(service.dataset.price)

});

});

const photos =
Array.from(
card.querySelectorAll('.previewImage')
)
.map(img=>img.src);

return {

hour:
card.querySelector('.hourInput').value,

client:
card.querySelector('.clientInput').value,

phone:
card.querySelector('.phoneInput').value,

car:
card.querySelector('.carSelect').value,

status:
card.querySelector('.statusSelect').value,

notes:
card.querySelector('.notesInput').value,

discount:
Number(
card.querySelector('.discountInput').value
) || 0,

deposit:
Number(
card.querySelector('.depositInput').value
) || 0,

paymentStatus:
card.querySelector('.paymentStatus').value,

services:
checkedServices,

photos

};

});

await saveData(crmData);

renderDashboard();
renderNotifications();

}

/* =========================
VISIT CARD
========================= */

function createVisitCard(
month,
day,
container,
visit={}
){

const card =
document.createElement('div');

card.className =
'visitCard';

card.innerHTML = `

<input
type="time"
class="hourInput"
value="${visit.hour || '08:00'}">

<select class="statusSelect">

<option value="Przyjęte">
🟡 Przyjęte
</option>

<option value="W trakcie">
🔵 W trakcie
</option>

<option value="Korekta">
🧽 Korekta
</option>

<option value="Powłoka">
🛡️ Powłoka
</option>

<option value="Gotowe">
✅ Gotowe
</option>

<option value="Wydane">
🚗 Wydane
</option>

</select>

<input
class="clientInput"
placeholder="Klient"
value="${visit.client || ''}">

<input
class="phoneInput"
placeholder="Telefon"
value="${visit.phone || ''}">

<select class="carSelect">

<option value="">
Wybierz auto
</option>

${createCarOptions()}

</select>

<details class="servicesAccordion">

<summary>
🧴 Lista usług
</summary>

<div class="servicesBox">

${services.map(service=>`

<label class="serviceItem">

<input
type="checkbox"
class="serviceCheck"
data-name="${service.name}"
data-price="${service.price}">

<span>
${service.name}
(${service.price} zł)
</span>

</label>

`).join('')}

</div>

</details>

<input
type="number"
class="discountInput"
placeholder="Rabat %"
value="${visit.discount || ''}">

<input
type="number"
class="depositInput"
placeholder="Zaliczka"
value="${visit.deposit || ''}">

<select class="paymentStatus">

<option value="Oczekuje">
💰 Oczekuje
</option>

<option value="Zapłacono">
✅ Zapłacono
</option>

<option value="Faktura">
🧾 Faktura
</option>

</select>

<div class="photoSection">

<label>
📸 Zdjęcia auta
</label>

<input
type="file"
class="photoInput"
multiple
accept="image/*">

<div class="photoPreview"></div>

</div>

<textarea
class="notesInput"
placeholder="Notatki...">${visit.notes || ''}</textarea>

<div class="totalBox">
Razem: 0 zł
</div>

<div class="leftBox">
Do zapłaty: 0 zł
</div>

<div class="buttonsRow">

<button class="printBtn">
🖨️ Drukuj
</button>

<button class="deleteBtn">
🗑️
</button>

</div>

`;

const totalBox =
card.querySelector('.totalBox');

const leftBox =
card.querySelector('.leftBox');

card.querySelector(
'.carSelect'
).value =
visit.car || '';

card.querySelector(
'.paymentStatus'
).value =
visit.paymentStatus || 'Oczekuje';

card.querySelector(
'.statusSelect'
).value =
visit.status || 'Przyjęte';

updateStatusColor(
card,
card.querySelector('.statusSelect').value
);

if(visit.services){

visit.services.forEach(saved=>{

card.querySelectorAll(
'.serviceCheck'
)
.forEach(box=>{

if(
box.dataset.name===saved.name
){
box.checked=true;
}

});

});

}

const photoPreview =
card.querySelector('.photoPreview');

if(visit.photos){

visit.photos.forEach(src=>{

const img =
document.createElement('img');

img.src = src;

img.className =
'previewImage';

photoPreview.appendChild(img);

});

}

card.querySelector(
'.photoInput'
)
.addEventListener(
'change',
async event=>{

const files =
Array.from(event.target.files);

for(const file of files){

const reader =
new FileReader();

reader.onload =
async function(e){

const img =
document.createElement('img');

img.src =
e.target.result;

img.className =
'previewImage';

photoPreview.appendChild(img);

await saveVisits(
month,
day,
container
);

};

reader.readAsDataURL(file);

}

}
);

function updateTotal(){

let total=0;

card.querySelectorAll(
'.serviceCheck:checked'
)
.forEach(service=>{

total += Number(
service.dataset.price
);

});

const discount =
Number(
card.querySelector('.discountInput').value
) || 0;

const deposit =
Number(
card.querySelector('.depositInput').value
) || 0;

total =
total - (total * discount/100);

const left =
total - deposit;

totalBox.innerHTML =
`Razem: ${Math.round(total)} zł`;

leftBox.innerHTML =
`Do zapłaty: ${Math.max(0,Math.round(left))} zł`;

if(left <= 0){

leftBox.style.background =
'#16a34a';

}
else if(deposit > 0){

leftBox.style.background =
'#ea580c';

}
else{

leftBox.style.background =
'#dc2626';

}

}

card.querySelectorAll(
'input, textarea, select'
)
.forEach(el=>{

el.addEventListener(
'change',
async ()=>{

updateTotal();

updateStatusColor(
card,
card.querySelector('.statusSelect').value
);

await saveVisits(
month,
day,
container
);

}
);

});

card.querySelectorAll(
'.serviceCheck'
)
.forEach(el=>{

el.addEventListener(
'change',
async ()=>{

updateTotal();

await saveVisits(
month,
day,
container
);

}
);

});

card.querySelector(
'.deleteBtn'
)
.addEventListener(
'click',
async ()=>{

const confirmDelete =
confirm(
'Usunąć wizytę?'
);

if(!confirmDelete){
return;
}

card.remove();

await saveVisits(
month,
day,
container
);

renderDashboard();
renderNotifications();

}
);

card.querySelector(
'.printBtn'
)
.addEventListener(
'click',
()=>{

const selectedServices =
Array.from(
card.querySelectorAll(
'.serviceCheck:checked'
)
)
.map(service=>`

<li>
${service.dataset.name}
- ${service.dataset.price} zł
</li>

`)
.join('');

const printWindow =
window.open(
'',
'',
'width=1000,height=1400'
);

printWindow.document.write(`

<html>

<head>

<title>
Deja Vu Auto Detailing
</title>

<style>

body{
font-family:Arial;
padding:40px;
color:#111;
line-height:1.6;
}

h1{
margin-bottom:30px;
}

.total{
font-size:28px;
font-weight:bold;
margin-top:30px;
}

.section{
margin-top:30px;
}

.regulations{
margin-top:40px;
padding:25px;
border:2px solid #000;
border-radius:16px;
font-size:14px;
}

.signatures{
display:flex;
justify-content:space-between;
gap:50px;
margin-top:90px;
}

.sign{
flex:1;
text-align:center;
}

.line{
border-top:1px solid #000;
padding-top:10px;
margin-top:60px;
}

</style>

</head>

<body>

<h1>
Deja Vu Auto Detailing
</h1>

<div class="section">

<p>
<b>Status:</b>
${card.querySelector('.statusSelect').value}
</p>

<p>
<b>Godzina:</b>
${card.querySelector('.hourInput').value}
</p>

<p>
<b>Klient:</b>
${card.querySelector('.clientInput').value}
</p>

<p>
<b>Telefon:</b>
${card.querySelector('.phoneInput').value}
</p>

<p>
<b>Auto:</b>
${card.querySelector('.carSelect').value}
</p>

<p>
<b>Status płatności:</b>
${card.querySelector('.paymentStatus').value}
</p>

</div>

<div class="section">

<h3>
Zakres usług
</h3>

<ul>
${selectedServices}
</ul>

</div>

<div class="total">
${totalBox.innerHTML}
</div>

<p>
${leftBox.innerHTML}
</p>

<div class="section">

<h3>
Notatki
</h3>

<p>
${card.querySelector('.notesInput').value || '-'}
</p>

</div>

<div class="regulations">

<h3>
Regulamin usług detailingowych
</h3>

<p>
1. Firma nie odpowiada za wady ukryte pojazdu oraz wcześniejsze naprawy lakiernicze.
</p>

<p>
2. Podczas korekty lakieru mogą ujawnić się wcześniejsze uszkodzenia lub naprawy.
</p>

<p>
3. Termin odbioru auta może ulec zmianie z przyczyn technologicznych.
</p>

<p>
4. Klient zobowiązuje się odebrać pojazd w ustalonym terminie.
</p>

<p>
5. Pozostawienie auta oznacza akceptację regulaminu oraz zakresu prac.
</p>

<p>
6. Firma nie odpowiada za rzeczy pozostawione w pojeździe.
</p>

</div>

<div class="signatures">

<div class="sign">

<div class="line"></div>

Podpis klienta

</div>

<div class="sign">

<div class="line"></div>

Deja Vu Auto Detailing

</div>

</div>

<script>
window.print();
</script>

</body>

</html>

`);

printWindow.document.close();

}
);

updateTotal();

return card;

}

/* =========================
MONTH RENDER
========================= */

function renderMonth(month){

calendar.innerHTML='';

const grid =
document.createElement('div');

grid.className =
'grid';

for(
let day=1;
day<=monthDays[month];
day++
){

const box =
document.createElement('div');

box.className =
'dayBox';

const title =
document.createElement('h2');

title.innerHTML =
`${day} ${month}`;

const addBtn =
document.createElement('button');

addBtn.className =
'addVisitBtn';

addBtn.innerHTML =
'+ Dodaj wizytę';

const visitsContainer =
document.createElement('div');

const key =
`${month}-${day}`;

const savedVisits =
crmData[key] || [];

savedVisits.forEach(visit=>{

visitsContainer.appendChild(

createVisitCard(
month,
day,
visitsContainer,
visit
)

);

});

addBtn.addEventListener(
'click',
()=>{

visitsContainer.appendChild(

createVisitCard(
month,
day,
visitsContainer
)

);

}
);

box.appendChild(title);
box.appendChild(addBtn);
box.appendChild(visitsContainer);

grid.appendChild(box);

}

calendar.appendChild(grid);

}

/* =========================
MONTH BUTTONS
========================= */

months.forEach(month=>{

const btn =
document.createElement('button');

btn.className =
'monthBtn';

btn.innerHTML =
month;

btn.addEventListener(
'click',
()=>{

document.querySelectorAll(
'.monthBtn'
)
.forEach(item=>{

item.classList.remove(
'activeMonth'
);

});

btn.classList.add(
'activeMonth'
);

renderMonth(month);

}
);

monthTabs.appendChild(btn);

});

renderMonth(
months[new Date().getMonth()]
);

renderDashboard();
renderNotifications();

searchInput.addEventListener(
'input',
()=>{

const value =
searchInput.value
.toLowerCase();

document.querySelectorAll(
'.visitCard'
)
.forEach(card=>{

if(
card.innerText
.toLowerCase()
.includes(value)
){
card.style.display='flex';
}else{
card.style.display='none';
}

});

}
);

}

startApp();