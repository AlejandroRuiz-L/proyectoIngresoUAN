import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, setDoc, serverTimestamp, Timestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { isValidName, isNum, formatTimestamp, splitDate } from './functionsDate.js';

const firebaseConfig = {//firebase PRESTAMOS
  apiKey: "AIzaSyBpQ9kR9pJgFoI8S8h75TXz44DZukk3Z7Q",
  authDomain: "prestamos-uan-bucaramanga.firebaseapp.com",
  projectId: "prestamos-uan-bucaramanga",
  storageBucket: "prestamos-uan-bucaramanga.firebasestorage.app",
  messagingSenderId: "520368287476",
  appId: "1:520368287476:web:517ac00e5f848d691cb8a1",
  measurementId: "G-VWZN9D1F8D"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
	const user = sessionStorage.getItem('userIngreso');
	const pwd = sessionStorage.getItem('pwdIngreso');
	await signInWithEmailAndPassword(auth, user, pwd);
} catch (error){
	console.log(`Error: ${error}`);
	alert("Ocurrió un error al obtener las credenciales.");
}
const product = sessionStorage.getItem('producto');
const serial = sessionStorage.getItem('serial');
const title = document.querySelector('#titulo');
title.textContent = `${product}: ${serial}`;
const loading = document.querySelector('#loadingOverlay');

document.querySelector('#formPrestar').addEventListener('submit', async (event) => {
	event.preventDefault();
	const name = document.querySelector('#name').value;
	let date = document.querySelector('#date').value;
	const id = document.querySelector('#id').value;
	const ocupation = document.querySelector('#cargo').value;
	const dep = document.querySelector('#dependence').value;
	const responsable = document.querySelector('#responsable').value;
	
	if (!name || !isValidName(name)){
		alert("Los nombres no pueden estar vacíos.");
		return;
	}
	if (!isValidName(responsable) || !isValidName(name)){
		alert("Los nombres no pueden contener símbolos o números.");
		return;
	}
	if (!id || !isNum(id)){
		alert("El número de documento no es válido.");
		return;
	}
	if (!date){
		date = formatTimestamp(Timestamp.now());
	}
	const dateSplited = splitDate(date);
	let year = dateSplited[0];
	let month = dateSplited[1];
	let day = dateSplited[2];
	const timeSplit = dateSplited[3].split(':');
	let hour = timeSplit[0];
	let minutes = timeSplit[1];
	const dataToSend = {
		producto: product,
		[`${id}`]: {
			nombre: name,
			dependencia: dep ?? 'N/A',
			cargo: ocupation ?? 'N/A',
			prestamos: {
				[`${hour}-${minutes}`]: responsable: responsable
			}
		}
	}
	try {
		loading.style.display = 'block';
		const docRef = doc(db, `prestamos${year}`, `${month}`, `${day}`, `${serial}`);
		await setDoc(docRef, dataToSend, {merge:true});
		alert(`Se ha creado el préstamo de:\n${product}\nPara:\n${name}`);
		window.close();
	} catch (error){
		alert("Error al prestar el equipo.");
		console.log(`Error: ${error}`);
	} finally {
		loading.style.display = 'none';
	}
});