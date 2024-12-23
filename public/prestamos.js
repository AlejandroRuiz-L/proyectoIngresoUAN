import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
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
	window.location.href = "admin.html";
}

const loading = document.querySelector('#loadingOverlay');
const menu = document.querySelector('#menu');
const info = document.querySelector('#info');
const searchBtn = document.querySelector('#buscar');
const backMenu = document.querySelector('#backMenu');

function showMenu(){
	menu.style.display = 'block';
	info.style.display = 'none';
	backMenu.style.display = 'none';
}

function showInfo(){
	menu.style.display = 'none';
	info.style.display = 'flex';
	backMenu.style.display = 'block';
}

function showEdit(){
	menu.style.display = 'none';
	info.style.display = 'none';
}

backMenu.addEventListener('click', showMenu);

searchBtn.addEventListener('click', async () => {
	info.innerHTML = '';
	const serial = document.querySelector('#serial').value.trim();
	if (!serial){
		alert("El campo serial no debe estar vacío.");
		return;
	}
	try {
		loading.style.display = 'block';
		const docref = doc(db, 'equipos', `${serial}`);
		const docSnap = await getDoc(docref);
		if (!docSnap.exists()){
			alert("El equipo no se encuentra registrado.");
			return;
		}
		const data = docSnap.data();
		sessionStorage.setItem('producto', `${data.producto}`);
		sessionStorage.setItem('marca', `${data.marca}`);
		sessionStorage.setItem('modelo', `${data.modelo}`);
		sessionStorage.setItem('serial', `${serial}`);
		sessionStorage.setItem('activo', `${data.activoFijo}`);
		sessionStorage.setItem('lastLend', `${data.ultimoPrestamo}`);
		sessionStorage.setItem('enable', `${data.disponible}`);
		const texto = document.createElement('p');
		texto.classList.add('lista-item');
		texto.innerHTML = `Producto: ${data.producto}\nModelo: ${data.modelo}\nMarca: ${data.marca}\nSerial: ${serial}\nActivo Fijo: ${data.activoFijo}`;
		texto.innerHTML += `\nEstado: ${data.disponible ? '&#9989; Disponible' : '&#10060; No disponible'}`;
		const prestamo = data.ultimoPrestamo.split('_');
		texto.innerHTML += data.ultimoPrestamo != 'N/A' ? `\nÚltimo préstamo:\n${prestamo[0]}\n${prestamo[1]}` : '';
		const toLend = newBtn('prestamo', 'Préstamo');
		const toReturn = newBtn('devolucion', 'Devolución');
		const edit = newBtn('editar', 'Editar');
		const divButtons = document.createElement('div');
		divButtons.style.display = 'flex';
		divButtons.style.margin = '15px 0';
		divButtons.append(toLend, toReturn, edit);
		info.append(texto, divButtons);
		showInfo();
	} catch (error){
		alert("Error al buscar el equipo.");
		console.log(`Error: ${error}`);
	} finally {
		loading.style.display = 'none';
	}
});

document.querySelector('#info').addEventListener('click', (event) => {
	const enable = sessionStorage.getItem('enable');
	if (event.target.id === 'prestamo'){
		if (enable === 'true'){
			window.location.href = 'prestar.html';
		} else {
			alert("El equipo no está disponible para prestar.");
			return;
		}
	}
	
	if (event.target.id === 'devolucion'){
		if (enable === 'false'){
			window.location.href = 'devolver.html';
		} else {
			alert("El equipo está disponible para préstamo.");
			return;
		}
	}
	
	if (event.target.id === 'editar'){ window.location.href = 'editarEquipo.html'; }
});

document.querySelector('#agregar').addEventListener('click', () => { window.open('agregarEquipo.html', '_blank'); });

document.querySelector('#reportes').addEventListener('click', () => { window.open('reportesEquipos.html', '_blank'); });

document.querySelector('#cancelar').addEventListener('click', () => { window.close(); });