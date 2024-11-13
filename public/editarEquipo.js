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
	window.close();
}

const labelSerial = document.querySelector('#labelSerial');
const oldSerial = sessionStorage.getItem('serial');
labelSerial.textContent += ` ${oldSerial}`;
const labelProduct = document.querySelector('#labelProduct');
const oldProduct = sessionStorage.getItem('product');
labelProduct.textContent += ` ${oldProduct}`;
const labelActive = document.querySelector('#labelActive');
const oldActive = sessionStorage.getItem('active');
labelActive.textContent += ` ${oldActive}`;
const loading = document.querySelector('#loadingOverlay');

document.querySelector('#formEdit').addEventListener('submit', async (event) => {
	event.preventDefault();
	const serial = document.querySelector('#serial').value.trim();
	const active = document.querySelector('#active').value.trim();
	const product = document.querySelector('#product').value.trim();
	
	if (!serial && !active && !product){
		alert("No has modificado ningún dato.");
		return;
	}
	loading.style.display = 'block';
	const dataToSend = {
		activoFijo: active ?? oldActive,
		producto: product ?? oldProduct,
		ultimoPrestamo: sessionStorage.getItem('lastLend'),
		disponible: sessionStorage.getItem('enable') === 'true' ? true : false;
	};
	const isNewSerial = serial ? true : false;
	const trueSerial = serial ?? oldSerial;
	const trueProduct = product ?? oldProduct;
	const docRef(db, 'equipos', `${trueSerial}`);
	try {
		if (isNewSerial){
			await deleteDoc(doc(db, 'equipos', `${oldSerial}`));
		}
		await setDoc(docRef, dataToSend, {merge:true});
		alert(`Se ha editado el equipo:\n${trueProduct}.`);
    	window.close();
	} catch (error){
		alert("Error al editar el equipo.");
		console.log(`Error: ${error}`);
	} finally {
		loading.style.display = 'none';
	}
});