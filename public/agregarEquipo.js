import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

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
	window.close();
}

const loading = document.querySelector('#loadingOverlay');
const formAdd = document.querySelector('#formAdd');

document.querySelector('#cancelar').addEventListener('click', () => { window.close(); });

formAdd.addEventListener('submit', async (event) => {
	event.preventDefault();
	const serial = document.querySelector('#serial').value.trim();
	const active = document.querySelector('#active').value.trim();
	const producto = document.querySelector('#producto').value.trim();
	const marca = document.querySelector('#marca').value.trim();
	const modelo = document.querySelector('#modelo').value.trim();
	
	if (!serial || !producto || !marca || !modelo){
		alert("Los campos marcados con '*' son obligatorios.");
		return;
	}
	const dataToSend = {
		activoFijo: active,
		producto: producto,
	    marca: marca,
		modelo: modelo,
		disponible: true,
		ultimoPrestamo: 'N/A'
	};
	try {
		loading.style.display = 'block';
		const docRef = doc(db, 'equipos', `${serial}`);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()){
			alert("El serial ya se encuentra registrado.");
			return;
		}
		await setDoc(docRef, dataToSend, {merge:true});
		alert(`Se ha agregado el equipo:\n${producto} ${marca}`);
		formAdd.reset();
	} catch (error){
		alert("Error al agregar el equipo.");
		console.log(`Error: ${error}`);
	} finally {
		loading.style.display = 'none';
	}
});