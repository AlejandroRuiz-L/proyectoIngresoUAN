import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, setDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { isValidName, isNum, formatTimestamp, splitDate, capitalize } from './functionsDate.js';

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
	window.location.href = "admin.html";
}

const producto = sessionStorage.getItem('producto');
const marca = sessionStorage.getItem('marca');
const modelo = sessionStorage.getItem('modelo');
const serial = sessionStorage.getItem('serial');
const title = document.querySelector('#titulo');
title.textContent = capitalize(producto) + ' ' + capitalize(marca);
const loading = document.querySelector('#loadingOverlay');

document.querySelector('#formPrestar').addEventListener('submit', async (event) => {
	event.preventDefault();
	const name = document.querySelector('#name').value.trim();
	let date = document.querySelector('#date').value;
	const id = document.querySelector('#id').value.trim();
	const ocupation = document.querySelector('#cargo').value.trim();
	const dep = document.querySelector('#dependence').value.trim();
	const responsable = document.querySelector('#responsable').value.trim();
	const obs = document.querySelector('#obs').value.trim();
	
	if (!name || !responsable){
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
		[`${id}`]: {
			nombre: name,
			producto: producto,
			marca: marca,
			modelo: modelo,
			dependencia: dep ? dep : 'N/A',
			cargo: ocupation ? ocupation : 'N/A',
			prestamos: {
				[`${year}-${month}-${day}`]: {
					[`${hour}-${minutes}`]: {
						entrega: responsable,
						observaciones: obs ? obs : 'N/A'
					}
				}
			}
		}
	}
	try {
		loading.style.display = 'block';
		const prestamoRef = doc(db, 'prestamos', `${serial}`);
		await setDoc(prestamoRef, dataToSend, {merge:true});
		const equipoRef = doc(db, 'equipos', `${serial}`);
		await setDoc(equipoRef, {disponible: false, ultimoPrestamo: `${name}_${date}`}, {merge:true});
		alert(`Se ha creado el préstamo de:\n${producto} ${marca}\nPara:\n${name}`);
		window.close();
	} catch (error){
		alert("Error al prestar el equipo.");
		console.log(`Error: ${error}`);
	} finally {
		loading.style.display = 'none';
	}
});

document.querySelector('#cancelar').addEventListener('click', () => {
	window.close();
});