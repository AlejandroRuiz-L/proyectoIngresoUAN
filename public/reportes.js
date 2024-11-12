import { getAuth, signOut, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, getDocs, collection } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { formatDate, esFechaValida } from './functionsDate.js';

const firebaseConfig = {// Configura Firebase
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
	const user = sessionStorage.getItem('userIngreso');
	const pwd = sessionStorage.getItem('pwdIngreso');
	await signInWithEmailAndPassword(auth, user, pwd);
} catch (error){
	console.log(`Error: ${error}`);
	alert("Ocurrió un error al obtener las credenciales.");
}

const loading = document.querySelector('#loadingOverlay');
const diario = document.querySelector('#diario');
const semanal = document.querySelector('#semanal');
const backMenu = document.querySelector('#backMenu');
const info = document.querySelector('#info');
let dataDownload = [];
const downloadBTN = document.querySelector('#downloadBTN');
const encabezado = ["IDENTIFICACION", "DOCUMENTO", "NOMBRE", "TELEFONO", "TIPO DE VISITANTE", "INGRESO", "SALIDA"];

function showMenu(){
	menu.style.display = 'flex';
	info.style.display = 'none';
	backMenu.style.display = 'none';
	downloadBTN.style.display = 'none';
}

function showInfo(){
	menu.style.display = 'none';
	info.style.display = 'flex';
	backMenu.style.display = 'block';
	downloadBTN.style.display = 'block';
}

diario.addEventListener('click', async () => {
	const fecha = document.querySelector('#fecha').value;
	if (!fecha){
		alert("Debes ingresar una fecha.");
		return;
	};
	loading.style.display = 'block';
	dataDownload = [];
	const fechaSplit = fecha.split(/[\/\-\\]+/);
	const year = fechaSplit[0];
	const month = fechaSplit[1];
	const day = fechaSplit[2];
	try {
		const monthDocRef = doc(db, 'a'+String(year)+'db', String(month));
		const docRef = collection(monthDocRef, String(day));
		const docSnap = await getDocs(docRef);
		if (!docSnap.empty){
			let counter = 0;
			docSnap.forEach(d => {
				const data = d.data();
				const ingresos = data.ingresos || {};
			    const salidas = data.salidas || {};
				Object.keys(ingresos).forEach(key => {
					let registro = [
						`${d.id}`,
						`${data.documento}`,
						`${data.nombre}`,
						`${data.telefono ? data.telefono : 'N/A'}`,
						`${data.visitante}`,
						`${ingresos[key] ? formatDate(ingresos[key]) : 'N/A'}`,
						`${salidas[key] ? formatDate(salidas[key]) : 'N/A'}`
				    ];
					counter += 1;
					dataDownload.push(registro);
				});
			});
			dataDownload.unshift([`Reporte_diario_${fecha}`], [`${docSnap.size} personas ingresaron ${counter} veces a la universidad`], encabezado);
			const msg = document.createElement('p');
			msg.style.whiteSpace = 'pre-wrap';
			msg.textContent = `Se encontraron ${docSnap.size} usuarios.\n${counter} registros están listos para descargar.`;
			info.innerHTML = '';
			info.appendChild(msg);
			showInfo();
		} else {
			alert("No hay registros para la fecha especificada.");
			return;
		}
	} catch (error){
		console.log(`Error: ${error}`);
		alert("Ocurrió un error al consultar los registros.");
	} finally{
		loading.style.display = 'none';
	}
});

semanal.addEventListener('click', async () => {
	const fechaValue = document.querySelector('#fecha').value;
	if (!fechaValue){
		alert("Debes seleccionar una fecha.");
		return;
	};
	loading.style.display = 'block';
	dataDownload = [];
	const fechaSplit = fechaValue.split(/[\/\-\\]+/);
	let year = fechaSplit[0];
	let month = fechaSplit[1];
	let day = fechaSplit[2];
	let limitDate;
	try {
		let counterPeople = 0;
		let counterRegister = 0;
		for(let i = 1; i <= 7; i++){
			if (!esFechaValida(Number(year), Number(month), Number(day))){
				if (Number(month) + 1 >= 13){
					year = Number(year) + 1;
					month = 1;
					day = 1;
				} else {
					month = Number(month) + 1;
					day = 1;
				}
				i--;
				continue;
			};
			const monthDocRef = doc(db, 'a'+String(year)+'db', String(month).length < 2 ? '0'+String(month) : String(month));
		    const docRef = collection(monthDocRef, String(day).length < 2 ? '0'+String(day) : String(day));
		    const docSnap = await getDocs(docRef);
			counterPeople += docSnap.size;
			if (!docSnap.empty){
				docSnap.forEach(d => {
					const data = d.data();
					const ingresos = data.ingresos || {};
					const salidas = data.salidas || {};
					Object.keys(ingresos).forEach(key => {
						let registro = [
							`${d.id}`, 
							`${data.documento}`, 
							`${data.nombre}`, 
							`${data.telefono ? data.telefono : 'N/A'}`, 
							`${data.visitante}`,
							`${ingresos[key] ? formatDate(ingresos[key]) : 'N/A'}`,
							`${salidas[key] ? formatDate(salidas[key]) : 'N/A'}`
						];
						counterRegister += 1;
						dataDownload.push(registro);
					});
				});
			} else {
				dataDownload.push([`No hay registros para la fecha ${day}/${month}/${year}`]);
			}
			if (i == 7){
				limitDate = `${year}-${month}-${day}`;
			}
			day = Number(day) + 1;
		};
		dataDownload.unshift([`Reporte_semanal_${fechaValue}_${limitDate}`], [`${counterPeople} personas ingresaron ${counterRegister} veces a la universidad`], encabezado);
		const msg = document.createElement('p');
		msg.style.whiteSpace = 'pre-wrap';
		msg.textContent = `Se encontraron ${counterPeople} usuarios.\n${counterRegister} registros están listos para descargar.`;
		info.innerHTML = '';
		info.appendChild(msg);
		showInfo();
	} catch (error){
		console.log(`Error: ${error}`);
		alert("Ocurrió un error al consultar los registros.");
	} finally{
		loading.style.display = 'none';
	}
});

document.querySelector('#cancelar').addEventListener('click', () => {
	window.close();
});

backMenu.addEventListener('click', showMenu);

downloadBTN.addEventListener('click', function(){
	loading.style.display = 'block';
	const ws_data = dataDownload;//filas excel
	const ws = XLSX.utils.aoa_to_sheet(ws_data);
	const wb = XLSX.utils.book_new();//libro de trabajo
	XLSX.utils.book_append_sheet(wb, ws, "Ingresos UAN Sede Bucaramanga");
	XLSX.writeFile(wb, `Ingresos_UAN_Sede_Bucaramanga_${dataDownload[0]}.xlsx`);
	loading.style.display = 'none';
});