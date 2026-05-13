// storage.js

import {
saveToFirebase,
loadFromFirebase
} from './firebase.js';

export const STORAGE_KEY =
'dejavu_multi_crm';

/* =========================
LOAD
========================= */

export async function loadData(){

const local =
localStorage.getItem(
STORAGE_KEY
);

let localData = {};

if(local){

try{

localData =
JSON.parse(local);

}catch(error){

console.log(error);

}

}

try{

const firebaseData =
await loadFromFirebase();

if(
firebaseData &&
Object.keys(firebaseData).length > 0
){

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(firebaseData)
);

return firebaseData;

}

}catch(error){

console.log(error);

}

return localData;

}

/* =========================
SAVE
========================= */

export async function saveData(data){

try{

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(data)
);

}catch(error){

console.log(error);

}

try{

await saveToFirebase(data);

}catch(error){

console.log(error);

}

}