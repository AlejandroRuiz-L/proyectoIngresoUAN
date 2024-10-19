import { getAuth, signOut, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { dateTimeToServerTime } from './functionsDate.js';

// Configura Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxxYjycjMEzvcUQLhnYe0fr9yA52LUfyA",
  authDomain: "ingreso-uan-bucaramanga.firebaseapp.com",
  projectId: "ingreso-uan-bucaramanga",
  storageBucket: "ingreso-uan-bucaramanga.appspot.com",
  messagingSenderId: "174827451298",
  appId: "1:174827451298:web:807ff3b9dce3ca164c78fb",
  measurementId: "G-VT0W6JLYWX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
	//signInWithEmailAndPassword(auth, 'ingresouan@gmail.com', 'adminingresoUAN2309');
	if (sessionStorage.getItem('userIngreso') && sessionStorage.getItem('pwdIngreso')){
	    signInWithEmailAndPassword(auth, sessionStorage.getItem('userIngreso'), sessionStorage.getItem('pwdIngreso'));
	} else {
		alert("No has iniciado sesión.");
		window.location.href = "admin.html";
	}
} catch (error){
	alert("Error durante la ejecución.")
	console.log(`Error: ${error}`);
}
//&#128584;emoji
const logo = document.querySelector('#logoUAN');
const title = document.querySelector('#titulo');
const titleIngreso = document.querySelector('#tituloIngreso');
const titleRegistro = document.querySelector('#tituloRegistro');
const menu = document.querySelector('#menu');
const loading = document.querySelector('#loadingOverlay');
//loading.innerHTML = 'Bloqueado temporalmente...';
//loading.style.display = 'block';
const backMenu = document.querySelector('#backMenu');
const formIngreso = document.querySelector('#formIngreso');
const inOut = document.querySelector('#formIngresoSalida');
let dateTimeValue = document.querySelector('#dateTime');
const formRegistro = document.querySelector('#formRegistro');

backMenu.addEventListener('click', () => {
	formIngreso.reset();
	formIngreso.style.display = 'none';
	dateTimeValue.value = '';
	inOut.style.display = 'none';
	formRegistro.reset();
	formRegistro.style.display = 'none';
	menu.style.display = 'flex';
	logo.style.display = 'block';
	title.style.display = 'block';
	titleIngreso.style.display = 'none';
	titleRegistro.style.display = 'none';
	backMenu.style.display = 'none';
});

function inOutHidden(){
	inOut.style.display = 'none';
	dateTimeValue.value = '';
	formIngreso.style.display = 'block';
}

document.querySelector('#ingreso').addEventListener('click', () => {
	logo.style.display = 'none';
	title.style.display = 'none';
	menu.style.display = 'none';
	titleIngreso.style.display = 'block';
	backMenu.style.display = 'block';
	formIngreso.style.display = 'block';
});

document.querySelector('#registro').addEventListener('click', () => {
	logo.style.display = 'none';
	title.style.display = 'none';
	menu.style.display = 'none';
	titleRegistro.style.display = 'block';
	backMenu.style.display = 'block';
	formRegistro.style.display = 'flex';
});

let userRef;
let userData;
let userId;//falta revisar logica y manejo de ingresos(evitar acumulacion de alerts y datos duplicados)

formIngreso.addEventListener('submit', async (event) => {
	event.preventDefault();
	const id = document.querySelector('#userId').value.trim();

	if (!id || !/^\d+$/.test(id)){
		alert("Debes ingresar un número válido.");
		return;
	}
	try {
		userRef = doc(db, 'ingresosdb', String(id));
		loading.style.display = 'block';
		const snapUser = await getDoc(userRef);
		
		if (snapUser.exists()){
			loading.style.display = 'none';
			data = snapUser.data();
			userData = {
				nombre: data.nombre,
				documento: data.documento,
				telefono: data.telefono,
				visitante: data.visitante
			};
			formIngreso.style.display = 'none';
			let texto = document.querySelector('#info');
			texto.textContent = `${userData.documento}: ${id}\n${userData.nombre}`;
			inOut.style.display = 'flex';
		} else {
			alert("El usuario no se encuentra registrado.");
			return;
		}
		loading.style.display = 'none';
	} catch (error){
		alert("Ocurrió un error en la ejecución.");
		console.log(`Error: ${error}`);
	}
});

document.querySelector('#marcarIngreso').addEventListener('click', async () => {
	const dateTime = document.querySelector('#dateTime').value;
	if (!dateTime){
		alert("Debes seleccionar la hora y la fecha.");
		return;
	}
	loading.style.display = 'block';
	let indice = 1;
	//crear ingreso en 'ingresosdb'
	if (userData.hasOwnProperty('ingresos')){
		indice = Object.keys(userData.ingresos).length + 1;
		await setDoc(userRef, {ingresos: {[`ingreso${indice}`]: dateTimeToServerTime(dateTime)}}, {merge:true});
	}
	//crear ingreso en 'fechadb'
	const splitDateTime = dateTime.split(/[\/\-\\T]+/);
	const year = splitDateTime[0];
	const month = splitDateTime[1];
	const day = splitDateTime[2];
	const yearRef = doc(db, 'a'+String(year)+'db', String(month), String(day), String(userId));
	const snapYear = await getDoc(yearRef);
	if (snapYear.exists()){
		const yearData = snapYear.data();
		if (yearData.hasOwnProperty('ingresos')){
			indice = Object.keys(yearData.ingresos).length + 1;
		}
		userData['ingresos'] = {[`ingreso${indice}`]: dateTimeToServerTime(dateTime)};
		await setDoc(yearRef, userData, {merge:true});
	} else {
		userData['ingresos'] = {ingreso1: dateTimeToServerTime(dateTime)}
		await setDoc(yearRef, userData, {merge:true});
	}
	alert(`Ingreso creado para ${userData.nombre}`);
	loading.style.display = 'none';
	inOutHidden();
	return;
});

document.querySelector('#marcarSalida').addEventListener('click', async () => {
	const dateTime = document.querySelector('#dateTime').value;
	if (!dateTime){
		alert("Debes seleccionar la fecha y la hora.");
		return;
	}
	loading.style.display = 'block';
	let indice = 1;
	//crear ingreso en 'ingresosdb'
	if (userData.hasOwnProperty('ingresos')){
		indice = Object.keys(userData.ingresos).length;
		await setDoc(userRef, {salidas: {[`ingreso${indice}`]: dateTimeToServerTime(dateTime)}}, {merge:true});
	}
	//crear ingreso en 'fechadb'
	const splitDateTime = dateTime.split(/[\/\-\\T]+/);
	const year = splitDateTime[0];
	const month = splitDateTime[1];
	const day = splitDateTime[2];
	const yearRef = doc(db, 'a'+String(year)+'db', String(month), String(day), String(userId));
	const snapYear = await getDoc(yearRef);
	if (snapYear.exists()){
		const yearData = snapYear.data();
		if (yearData.hasOwnProperty('ingresos')){
			indice = Object.keys(yearData.ingresos).length;
		}
		userData['salidas'] = {[`ingreso${indice}`]: dateTimeToServerTime(dateTime)};
		await setDoc(yearRef, userData, {merge:true});
	} else {
		userData['salidas'] = {ingreso1: dateTimeToServerTime(dateTime)}
		await setDoc(yearRef, userData, {merge:true});
	}
	alert(`Salida resgistrada para ${userData.nombre}`);
	loading.style.display = 'none';
	inOutHidden();
	return;
});

formRegistro.addEventListener('submit', async (event) => {
	event.preventDefault();
	const name = document.querySelector('#nombre').value.trim();
	const typeId = document.querySelector('#tipoId').value;
	const id = document.querySelector('#identificacion').value.trim();
	const tel = document.querySelector('#telefono').value.trim();
	const visitor = document.querySelector('#visitante').value;
	const dateTime = document.querySelector('#fechaIngreso').value;
	
	if (!name || !id || !dateTime){
		alert("Los campos marcados con '*' son obligatorios.");
		return;
	}
	if (!/^\d+$/.test(id)){
		alert("El número de identificación no es válido.");
		return;
	}
	if (tel && !/^\d+$/.test(tel)){
		alert("El número de teléfono no es válido.");
		return;
	}
	loading.style.display = 'block';
	try {
		const userRef = doc(db, 'ingresosdb', String(id));
		const snapUser = await getDoc(userRef);
		if (!snapUser.exists()){
			const dataToSend = {
				nombre: name,
				documento: typeId,
				telefono: tel ? tel : 'N/A',
				visitante: visitor,
				ingresos: {ingreso1: dateTimeToServerTime(dateTime)}
			};
			await setDoc(userRef, dataToSend, {merge:true});
			const splitDateTime = dateTime.split(/[\/\-\\T]+/);
			const year = splitDateTime[0];
			const month = splitDateTime[1];
			const day = splitDateTime[2];
			const yearRef = doc(db, 'a'+String(year)+'db', String(month), String(day), String(id));
			await setDoc(yearRef, dataToSend, {merge:true});
			alert(`Se registró exitosamente a ${name}.\nSe creó el primer ingreso.`);
			loading.style.display = 'none';
		} else {
			alert("El número de identificación ya se encuentra registrado.");
			loading.style.display = 'none';
			return;
		}
	} catch (error){
		alert("Ocurrió un error durante el registro.");
		console.log(`Error: ${error}`);
		loading.style.display = 'none';
	}
});