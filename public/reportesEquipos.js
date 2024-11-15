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
const backMenu = document.querySelector('#backMenu');
const info = document.querySelector('#info');
let dataDownload = [];
const headers = ['FECHA', 'DOCUMENTO', 'NOMBRE', 'CARGO', 'DEPENDENCIA', 'PRODUCTO', 'HORA SOLICITUD', 'RESPONSABLE', 'OBSERVACIONES', 'HORA ENTREGA', 'RECIBE', 'OBSERVACIONES'];
const downloadBtn = document.querySelector('#downloadBtn');

function showMenu(){
	menu.style.display = 'flex';
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

document.querySelector('#cancelar').addEventListener('click', () => { window.close(); });

document.querySelector('#buscar').addEventListener('click', async () => {
	const serial = document.querySelector('#serial').value.trim();
	
	if (!serial){
		alert("El campo serial no debe estar vacío.");
		return;
	}
	const docRef = doc(db, 'prestamos', `${serial}`);
	const equipoRef = doc(db, 'equipos', `${serial}`);
	try {
		loading.style.display = 'block';
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()){
			alert("El equipo no cuenta con registros de préstamos.");
			return;
		}
		let totalPeople = 0;
		let totalLends = 0;
		const data = docSnap.data();
		for (let id in data){
			totalPeople += 1;
			const prestamos = data[`${id}`].prestamos ?? {};
			const devoluciones = data[`${id}`].devoluciones ?? {};
			for (let date in prestamos){
				let rows = [];
				for (let time in prestamos[`${date}`]){//agrega los campos de la fila de acuerdo al encabezado
				    totalLends += 1;
					const timeSplit = time.split('-');
					let row = [date, id, data[`${id}`].nombre, data[`${id}`].cargo, data[`${id}`].dependencia, `${data[`${id}`].producto} ${data[`${id}`].marca} ${data[`${id}`].modelo}`];
					row.push(`${timeSplit[0]}:${timeSplit[1]}`, prestamos[`${date}`][`${time}`].entrega, prestamos[`${date}`][`${time}`].observaciones);
					rows.push(row);
				};
				let counter = 0;
				for (let time in devoluciones[`${date}`]){
					console.log(counter);
					const timeSplit = time.split('-');
					rows[counter].push(`${timeSplit[0]}:${timeSplit[1]}`, devoluciones[`${date}`][`${time}`].recibe, devoluciones[`${date}`][`${time}`].observaciones);
					counter += 1;
				};
				for (let row of rows){ dataDownload.push(row) };
			};
		};
		const equipoSnap = await getDoc(equipoRef);
		let product;
		let active;
		let marca;
		let modelo;
		if (equipoSnap.exists()){
			const dataE = equipoSnap.data();
			product = dataE.producto;
			active = dataE.activoFijo;
			marca = dataE.marca;
			modelo = dataE.modelo;
		}
		let textInfo = `${totalPeople} personas prestaron ${totalLends} veces el equipo`;
		dataDownload.unshift([`Reporte_Equipo_${serial}`], [`Producto_${product ?? 'N/A'}_Marca_${marca ?? 'N/A'}_Modelo_${modelo ?? 'N/A'}`], [`Activo_fijo_${active ?? 'N/A'}`], [textInfo], headers);
		textInfo += '\n\nEl reporte está listo para descargar.'
		const texto = document.createElement('p');
		texto.style.whiteSpace = 'pre-wrap';
		texto.classList.add('textBorder');
		texto.textContent = textInfo;
		info.appendChild(texto);
		showInfo();
		console.log(dataDownload);
	} catch (error){
		alert("Error al realizar el reporte.");
		console.log(`Error: ${error}`);
	} finally {
		loading.style.display = 'none';
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