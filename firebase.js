// firebase.js

import {
initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
doc,
setDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
FIREBASE CONFIG
========================= */

const firebaseConfig = {

apiKey:
"AIzaSyBmP2k_Lz8eNf-jxOcMEVCL",

authDomain:
"dejavucrm.firebaseapp.com",

projectId:
"dejavucrm",

storageBucket:
"dejavucrm.appspot.com",

messagingSenderId:
"449323378305",

appId:
"1:449323378305:web:881c35f10b"

};

/* =========================
INIT
========================= */

const firebaseApp =
initializeApp(firebaseConfig);

const db =
getFirestore(firebaseApp);

/* =========================
SAVE ONLINE
========================= */

export async function saveToFirebase(data){

try{

await setDoc(
doc(db,'crm','main'),
{
data:data
}
);

console.log(
'Firebase zapisano'
);

}catch(error){

console.log(error);

}

}

/* =========================
LOAD ONLINE
========================= */

export async function loadFromFirebase(){

try{

const snap =
await getDoc(
doc(db,'crm','main')
);

if(
snap.exists() &&
snap.data().data
){

return snap.data().data;

}

return {};

}catch(error){

console.log(error);

return {};

}

}