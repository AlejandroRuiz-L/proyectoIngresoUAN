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
	window.close();
}

const loading = document.querySelector('#loadingOverlay');
const menu = document.querySelector('#menu');
const backMenu = document.querySelector('#backMenu');
const info = document.querySelector('#info');
let dataDownload = [];
const headers = ['FECHA', 'DOCUMENTO', 'NOMBRE', 'CARGO', 'DEPENDENCIA', 'HORA SOLICITUD', 'RESPONSABLE', 'HORA ENTREGA', 'RECIBE', 'OBSERVACIONES'];
const downloadBtn = document.querySelector('#downloadBtn');

function showMenu(){
	menu.style.display = 'block';
	backMenu.style.display = 'none';
	info.style.display = 'none';
	downloadBtn.style.display = 'none';
}

function showInfo(){
	menu.style.display = 'none';
	backMenu.style.display = 'block';
	info.style.display = 'flex';
	downloadBtn.style.display = 'block';
}

backMenu.addEventListener('click', showMenu);

document.querySelector('#buscar').addEventListener('click', async () => {
	const serial = document.querySelector('#serial').value.trim();
	
	if (!serial){
		alert("El campo serial no debe estar vacío.");
		return;
	}
	const docRef = doc(db, 'equipos', `${serial}`);
	try {
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()){
			alert("El equipo no se encuentra registrado.");
			return;
		}
		const data = docSnap.data();
		for (let id in data){
			const product = data[`${id}`].producto;
			const prestamos = data[`${id}`].prestamos ?? {};
		    const devoluciones = data[`${id}`].devoluciones ?? {};
			let rows = [];
			for (let date in prestamos){
				for (let time in prestamos[`${date}`]){//agrega los campos de la fila de acuerdo al encabezado
				    const timeSplit = time.split('-');
					let row = [date, id, data[`${id}`].nombre, data[`${id}`].cargo, data[`${id}`].dependencia];
				    row.push(`${timeSplit[0]}:${timeSplit[1]}`, prestamos[`${date}`][`${time}`].entrega);
					rows.push(row);
				};//falta validar que no se cruze la info
				let counter = 0;
				for (let time in devoluciones[`${date}`]){
					const timeSplit = time.split('-');
					rows[counter].push(`${timeSplit[0]}:${timeSplit[1]}`, devoluciones[`${date}`][`${time}`].recibe, devoluciones[`${date}`][`${time}`].observaciones);
				    counter += 1;
				};
			};//hay que lograr concatenar las devoluciones
		};
		dataDownload.unshift(`Reporte_Equipo_${serial}`, `Producto_${data.producto}`, headers);
	} catch (error){
		alert("Error al realizar el reporte.");
		console.log(`Error: ${error}`);
	}
});

downloadBtn.addEventListener('click', () => {
	loading.style.display = 'block';
	const ws_data = dataDownload;//filas excel
	const ws = XLSX.utils.aoa_to_sheet(ws_data);
	const wb = XLSX.utils.book_new();//libro de trabajo
	XLSX.utils.book_append_sheet(wb, ws, "Reporte Equipo");
	XLSX.writeFile(wb, `${dataDownload[0]}.xlsx`);
	loading.style.display = 'none';
});