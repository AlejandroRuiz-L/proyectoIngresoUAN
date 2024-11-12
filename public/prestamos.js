import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, getDoc, deleteDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { newBtn } from './functionsDate.js';

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

const loading = document.querySelector('#loadingOverlay');
const menu = document.querySelector('#menu');
const info = document.querySelector('#info');
const form = document.querySelector('#formPrestamo');
const select = document.querySelector('#equipo');
const searchBtn = document.querySelector('#buscar');
const addBtn = document.querySelector('#agregar');
let dataEquipos = {};

function showMenu(){
	menu.style.display = 'flex';
	info.style.display = 'none';
}

function showInfo(){
	menu.style.display = 'none';
	info.style.display = 'flex'
}

searchBtn.addEventListener('click', async () => {
	const type = document.querySelector('#type').value;
	const serial = document.querySelector('#serial').value;
	if (!type || !serial){
		alert("Los dos campos son obligatorios.");
		return;
	}
	try {
		loading.style.display = 'block';
		let data;
		if (dataEquipos[`${type}`]?.[`${serial}`]){
			data = dataEquipos[`${type}`][`${serial}`];
		} else {
			const docRef = doc(db, `${type}`, `${serial}`);
		    const docSnap = await getDoc(docRef);
			if (docSnap.exists()){
			    data = docSnap.data();
			    dataEquipos[`${type}`] = {[`${serial}`]: data};
			} else {
			    alert("El equipo no se encuentra registrado.");
			    return;
			}
		}
		const texto = document.createElement('p');
		texto.classList.add('lista-item');
		texto.innerHTML = `Producto: ${data.producto}\nSerial: ${serial}\nActivo Fijo: ${data.activoFijo}`;
		texto.innerHTML += `\nÚltimo préstamo: ${data.ultimoPrestamo}\nEstado: ${data.disponible ? '&#9989; Disponible' : '&#10060; No disponible'}`;
		const toLend = newBtn('prestamo', 'Préstamo', 'prestar');
		const toReturn = newBtn('devolucion', 'Devolución', 'devolver');
		const edit = newBtn('editar', 'Editar', 'editarEquipo');
		info.append(texto, toLend, toReturn, edit);
		showInfo();
		sessionStorage.setItem('producto', `${data.producto}`);
		sessionStorage.setItem('serial', `${serial}`);
	} catch (error){
		alert("Error al buscar el equipo.");
		console.log(`Error: ${error}`);
	} finally {
		loading.style.display = 'none';
	}
});

info.addEventListener('click', (event) => {
	if (event){}
});

addBtn.addEventListener('click', () => {
	
});

form.addEventListener('submit', async () => {
    event.preventDefault();
});

document.querySelector('#cancelar').addEventListener('click', () => {
	window.close();
});