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
	signInWithEmailAndPassword(auth, 'ingresouan@gmail.com', 'adminingresoUAN2309');
	/*if (sessionStorage.getItem('userIngreso') && sessionStorage.getItem('pwdIngreso')){
	    signInWithEmailAndPassword(auth, sessionStorage.getItem('userIngreso'), sessionStorage.getItem('pwdIngreso'));
	} else {
		alert("No has iniciado sesión.");
		window.location.href = "admin.html";
	}*/
} catch (error){
	alert("Error durante la ejecución.")
	console.log(`Error: ${error}`);
}

const logo = document.querySelector('#logoUAN');
const title = document.querySelector('#titulo');
const titleIngreso = document.querySelector('#tituloIngreso');
const titleRegistro = document.querySelector('#tituloRegistro');
const menu = document.querySelector('#menu');
const loading = document.querySelector('#loadingOverlay');
const backMenu = document.querySelector('#backMenu');
const formIngreso = document.querySelector('#formIngreso');
const inOut = document.querySelector('#formIngresoSalida');
const formRegistro = document.querySelector('#formRegistro');

backMenu.addEventListener('click', () => {
	formIngreso.reset();
	formIngreso.style.display = 'none';
	document.querySelector('#dateTime').value = '';
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

formIngreso.addEventListener('submit', async (event) => {
	event.preventDefault();
	const id = document.querySelector('#userId').value.trim();

	if (!id || !/^\d+$/.test(id)){
		alert("Debes ingresar un número válido.");
		return;
	}
	
	try {
		loading.style.display = 'block';
		const userRef = doc(db, 'ingresosdb', String(id));
		const snapUser = await getDoc(userRef);
		
		if (snapUser.exists()){
			loading.style.display = 'none';
			const userData = snapUser.data();
			formIngreso.style.display = 'none';
			let texto = document.querySelector('#info');
			texto.textContent = `${userData.documento}: ${snapUser.id}\n${userData.nombre}`;
			inOut.style.display = 'flex';
			let dataToSend = {
				nombre: userData.nombre,
				documento: userData.documento,
				telefono: userData.telefono,
				visitante: userData.visitante
			};
			let indice = 1;
			document.querySelector('#marcarIngreso').addEventListener('click', async () => {
				const dateTime = document.querySelector('#dateTime').value;
				if (!dateTime){
					alert("Debes seleccionar la hora y la fecha.");
					return;
				}
				loading.style.display = 'block';
				//crear ingreso en 'ingresosdb'
				if (userData.hasOwnProperty('ingresos')){
					indice = Object.keys(userData.ingresos).length + 1;
    				await setDoc(userRef, {ingresos: {[`ingreso${indice}`]: dateTimeToServerTime(dateTime)}}, {merge:true});
				}
				//crear ingreso en 'fechadb'
				indice = 1;
				const splitDateTime = dateTime.split(/[\/\-\\T]+/);
				const year = splitDateTime[0];
				const month = splitDateTime[1];
				const day = splitDateTime[2];
				const yearRef = doc(db, 'a'+String(year)+'db', String(month), String(day), String(snapUser.id));
				const snapYear = await getDoc(yearRef);
				if (snapYear.exists()){
					const yearData = snapYear.data();
					if (yearData.hasOwnProperty('ingresos')){
						indice = Object.keys(yearData.ingresos).length + 1;
					}
					dataToSend['ingresos'] = {[`ingreso${indice}`]: dateTimeToServerTime(dateTime)};
					await setDoc(yearRef, dataToSend, {merge:true});
				} else {
					dataToSend['ingresos'] = {ingreso1: dateTimeToServerTime(dateTime)}
					await setDoc(yearRef, dataToSend, {merge:true});
				}
				alert("Se ha creado el registro de entrada.");
				loading.style.display = 'none';
			});
			
			document.querySelector('#marcarSalida').addEventListener('click', async () => {
				const dateTime = document.querySelector('#dateTime').value;
				if (!dateTime){
					alert("Debes seleccionar la hora y la fecha.");
					return;
				}
				loading.style.display = 'block';
				//crear ingreso en 'ingresosdb'
				if (userData.hasOwnProperty('ingresos')){
					indice = Object.keys(userData.ingresos).length + 1;
    				await setDoc(userRef, {salidas: {[`ingreso${indice}`]: dateTimeToServerTime(dateTime)}}, {merge:true});
				}
				//crear ingreso en 'fechadb'
				indice = 1;
				const splitDateTime = dateTime.split(/[\/\-\\T]+/);
				const year = splitDateTime[0];
				const month = splitDateTime[1];
				const day = splitDateTime[2];
				const yearRef = doc(db, 'a'+String(year)+'db', String(month), String(day), String(snapUser.id));
				const snapYear = await getDoc(yearRef);
				if (snapYear.exists()){
					const yearData = snapYear.data();
					if (yearData.hasOwnProperty('ingresos')){
						indice = Object.keys(yearData.ingresos).length + 1;
					}
					dataToSend['salidas'] = {[`ingreso${indice}`]: dateTimeToServerTime(dateTime)};
					await setDoc(yearRef, dataToSend, {merge:true});
				} else {
					dataToSend['salidas'] = {ingreso1: dateTimeToServerTime(dateTime)}
					await setDoc(yearRef, dataToSend, {merge:true});
				}
				alert("Se ha creado el registro de salida.");
				loading.style.display = 'none';
			});
		} else {
			alert("El usuario no se encuentra registrado.");
			loading.style.display = 'none';
			return;
		}
	} catch (error){
		alert("Ocurrió un error en la ejecución.");
		console.log(`Error: ${error}`);
	}
});