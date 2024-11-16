import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, getDoc, deleteDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

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

const labelSerial = document.querySelector('#labelSerial');
const oldSerial = sessionStorage.getItem('serial');
labelSerial.textContent += ` ${oldSerial}`;
const labelProducto = document.querySelector('#labelProducto');
const oldProducto = sessionStorage.getItem('producto');
labelProducto.textContent += ` ${oldProducto}`;
const labelMarca = document.querySelector('#labelMarca');
const oldMarca = sessionStorage.getItem('marca');
labelMarca.textContent += ` ${oldMarca}`;
const labelModelo = document.querySelector('#labelModelo');
const oldModelo = sessionStorage.getItem('modelo');
labelModelo.textContent += ` ${oldModelo}`;
const labelActive = document.querySelector('#labelActive');
const oldActive = sessionStorage.getItem('activo');
labelActive.textContent += ` ${oldActive}`;
const loading = document.querySelector('#loadingOverlay');

document.querySelector('#cancelar').addEventListener('click', () => { window.history.back(); });

document.querySelector('#formEdit').addEventListener('submit', async (event) => {
	event.preventDefault();
	const serial = document.querySelector('#serial').value.trim();
	const producto = document.querySelector('#producto').value.trim();
	const active = document.querySelector('#active').value.trim();
	const marca = document.querySelector('#marca').value.trim();
	const modelo = document.querySelector('#modelo').value.trim();
	
	if (!serial && !producto && !active && !marca && !modelo){
		alert("No has modificado ningún dato.");
		return;
	}
	loading.style.display = 'block';
	const dataToSend = {
		activoFijo: active ? active : oldActive,
		producto: producto ? producto : oldProducto,
		marca: marca ? marca : oldMarca,
		modelo: modelo ? modelo : oldModelo,
		ultimoPrestamo: sessionStorage.getItem('lastLend'),
		disponible: sessionStorage.getItem('enable') === 'true' ? true : false
	};
	const isNewSerial = serial ? true : false;
	const trueSerial = serial ? serial : oldSerial;
	const trueProducto = producto ? producto : oldProducto;
	const trueMarca = marca ? marca : oldMarca;
	const docRef = doc(db, 'equipos', `${trueSerial}`);
	try {
		if (isNewSerial){
			await deleteDoc(doc(db, 'equipos', `${oldSerial}`));
		}
		await setDoc(docRef, dataToSend, {merge:true});
		alert(`Se ha editado el equipo:\n${trueProducto} ${trueMarca}`);
    	window.close();
	} catch (error){
		alert("Error al editar el equipo.");
		console.log(`Error: ${error}`);
	} finally {
		loading.style.display = 'none';
	}
});

document.querySelector('#trash').addEventListener('click', async () => {
	const deleteConfirm = confirm(`${oldProducto} ${oldMarca}\nserá eliminado de la base de datos.\nDeseas continuar?`);
	if (deleteConfirm){
		const docRef = doc(db, 'equipos', `${oldSerial}`);
		await deleteDoc(docRef);
		alert(`Se eliminó el equipo ${oldProducto} ${oldMarca}`);
		window.close();
	}
});