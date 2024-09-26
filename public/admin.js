import { getAuth, signOut, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, getDoc, getDocs, setDoc, collection } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

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
const adminForm = document.querySelector('#admin-form');
const logout = document.querySelector('#logout');
const menu = document.querySelector('#menu');
const info = document.querySelector('#info');
const diario = document.querySelector('#diario');
const semanal = document.querySelector('#semanal');
const encabezado = ["Identificacion", "Documento", "Nombre", "Correo", "Teléfono", "Visitante", "Ingreso", "Salida"];
let dataDownload = [];
const downloadBTN = document.querySelector('#downloadBTN');
const formatDate = (date) => {
				if (!date) return 'N/A';
				const options = {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					hour12: false // Formato 24 horas
				};
				return date.toDate().toLocaleString('es-CO', options).replace(',', '');
    };

function mostrarMenu() {
	adminForm.style.display = 'none';
	menu.style.display = 'flex';
};

function ocultarMenu() {
	adminForm.style.display = 'block';
	menu.style.display = 'none';
	info.innerHTML = '';
	info.style.display = 'none';
	downloadBTN.style.display = 'none';
};

//inicio de sesion admin
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('ingreso').addEventListener('click', async (event) => {
		event.preventDefault();
		
		const email = document.querySelector('#correo').value.trim();
		const passwordUser = document.querySelector('#password').value.trim();
		try {
			await signInWithEmailAndPassword(auth, email, passwordUser);
			mostrarMenu();
			adminForm.reset();
			logout.style.display = 'block';
		} catch (error) {
			if (error.code === "auth/invalid-login-credentials"){
				console.log(`Error: ${error}`);
				alert("Correo o contraseña incorrectos.");
			} else if (error.code === "auth/invalid-email"){
				console.log(`Error: ${error}`);
				alert("El correo no es válido.");
			} else if (error.code === "auth/network-request-failed"){
				alert("No tienes conexión a internet.");
			} else {
    			console.log(`Error: ${error}`);
	    		alert("Error al iniciar sesión.");
			}
		}
	});
});

// Maneja el cierre de sesión
document.getElementById('logout').addEventListener('click', async () => {
    try {
        await signOut(auth);
		ocultarMenu();
		logout.style.display = 'none';
		console.log('El usuario ha cerrado sesión');
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
    }
});

document.getElementById('buscar').addEventListener('click', async () => {
	info.innerHTML = '';
	dataDownload = [];
	const docId = document.querySelector('#docId').value.trim();
	if (!docId) {
		alert("Debes ingresar un número de documento.");
		return;
	}
	try {
		const docRef = doc(db, 'ingresos', docId);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			dataDownload.push(encabezado);
			const data = docSnap.data();
			const ingresos = data.ingresos || {};
			const salidas = data.salidas || {};
			let counter = 0;
			const texto = document.createElement('p');
			const editBtn = document.createElement('button');
			editBtn.classList.add('boton');
			editBtn.id = 'editar';
			editBtn.textContent = 'Editar';
			texto.style.whiteSpace = 'pre-wrap';
			const _id = data.identificacion;
			const _docu = data.documento;
			const _name = data.nombre;
			const _email = data.correo ? data.correo : 'N/A';
			const _tel = data.telefono ? data.telefono : 'N/A';
			const _visit = data.visitante;

			Object.keys(ingresos).forEach(key => {
				let registro = [
					`${_id}`, 
					`${_docu}`, 
					`${_name}`, 
					`${_email}`,
					`${_tel}`, 
					`${_visit}`,
					`${ingresos[key] ? formatDate(ingresos[key]) : 'N/A'}`,
					`${salidas[key] ? formatDate(salidas[key]) : 'N/A'}`
				];
				texto.textContent = `${_docu}: ${_id}\nNombre: ${_name}`;
				dataDownload.push(registro);
				counter += 1;
			});
			const msg = document.createElement('p');
			msg.textContent = `${counter} registros están listos para descargar.`;
			info.appendChild(texto);
			info.appendChild(editBtn);
			info.appendChild(msg);
			info.style.display = 'flex';
			downloadBTN.style.display = 'block';
			document.querySelector('#editar').addEventListener('click', function(){
				localStorage.setItem('p1', _id);
			    localStorage.setItem('p2', _docu);
			    localStorage.setItem('p3', _name);
				localStorage.setItem('p4', _email);
				localStorage.setItem('p5', _tel);
				localStorage.setItem('p6', _visit);
				window.open(`editar.html`, '_blank');
			});
		} else {
			alert("No se encontró el documento.");
		}
	} catch (error) {
		console.log(`Error: ${error}`);
		alert("Error al consultar el documento");
	}
});

diario.addEventListener('click', async () => {
	info.innerHTML = '';
	dataDownload = [];
	const fecha = document.querySelector('#fecha').value;
	if (!fecha){
		alert("Debes ingresar una fecha.");
		return;
	};
	const fechaSplit = fecha.split('-');
	const year = fechaSplit[0];
	const month = fechaSplit[1];
	const day = fechaSplit[2];
	console.log(year, month, day);
	try {
		const docRef = collection(db, 'dias', String(year), String(month));
		/*const yearRef = doc(db, 'dias', String(year));
		const monthRef = doc(yearRef, String(month));
		const dayRef = collection(monthRef, String(day));*/
		const docSnap = await getDocs(docRef);
		//const data = docSnap.data();
		console.log(docSnap);
		/*if (docSnap.exists()){
			const data = docSnap.data();
			const users = Object.keys(data).length;
			dataDownload.push(encabezado);
			Object.keys(data).forEach(key => {
				let ingresos = key.ingresos || {};
				let salidas = key.salidas || {};
				let registro = [
				    `${key.identificacion}`,
					`${key.documento}`,
					`${key.nombre}`
				];
				console.log(registro);
			});
		} else {
			alert("No hay registros para la fecha especificada.");
			return;
		}*/
	} catch (error){
		console.log(`Error: ${error}`);
		alert("Ocurrió un error al consultar los registros.");
	}
});

document.getElementById('registros').addEventListener('click', async () => {
	try {
		info.innerHTML = '';
		dataDownload = [];
		const docsRef = collection(db, 'ingresos');
		const docSnap = await getDocs(docsRef);
		let counter = 0;
		dataDownload.push(encabezado);
		docSnap.forEach(doc => {
			const data = doc.data();
			const ingresos = data.ingresos || {};
			const salidas = data.salidas || {};

			Object.keys(ingresos).forEach(key => {
				let registro = [
					`${doc.id}`, 
					`${data.documento}`, 
					`${data.nombre}`, 
					`${data.correo ? data.correo : 'N/A'}`,
					`${data.telefono ? data.telefono : 'N/A'}`, 
					`${data.visitante}`,
					`${ingresos[key] ? formatDate(ingresos[key]) : 'N/A'}`,
					`${salidas[key] ? formatDate(salidas[key]) : 'N/A'}`
				];
				
				dataDownload.push(registro);
				counter += 1;
			});
		});
		const msg = document.createElement('p');
		msg.style.whiteSpace = 'pre-wrap';
		msg.textContent = `Se encontraron ${docSnap.size} usuarios.\n${counter} registros están listos para descargar.`;
		info.appendChild(msg);
		info.style.display = 'flex';
		downloadBTN.style.display = 'block';
		
	} catch (error) {
		console.log(`Error: ${error}`);
		alert("Error al consultar los registros.");
	}
});

document.getElementById('backMenu').addEventListener('click', function(){
	info.innerHTML = '';
	info.style.display = 'none';
	downloadBTN.style.display = 'none';
	dataDownload = [];
});

downloadBTN.addEventListener('click', function(){
	const ws_data = dataDownload;//filas excel
	const ws = XLSX.utils.aoa_to_sheet(ws_data);
	const wb = XLSX.utils.book_new();//libro de trabajo
	XLSX.utils.book_append_sheet(wb, ws, "Ingresos UAN Sede Bucaramanga");
	XLSX.writeFile(wb, "Ingresos_UAN_Sede_Bucaramanga.xlsx");
});