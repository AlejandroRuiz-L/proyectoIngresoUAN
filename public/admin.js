import { getAuth, signOut, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, getDoc, getDocs, deleteDoc, setDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { formatDate, esFechaValida } from './functionsDate.js';

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
const loading = document.querySelector('#loadingOverlay');
const menu = document.querySelector('#menu');
const info = document.querySelector('#info');
const diario = document.querySelector('#diario');
const semanal = document.querySelector('#semanal');
const encabezado = ["IDENTIFICACION", "DOCUMENTO", "NOMBRE", "TELEFONO", "TIPO DE VISITANTE", "INGRESO", "SALIDA"];
let dataDownload = [];
const downloadBTN = document.querySelector('#downloadBTN');

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
			loading.style.display = 'block';
			await signInWithEmailAndPassword(auth, email, passwordUser);
			mostrarMenu();
			adminForm.reset();
			document.querySelector('#logoUAN').style.display = 'none';
			document.querySelector('#titulo').style.display = 'none';
			logout.style.display = 'block';
			downloadBTN.style.display = 'none';
			info.innerHTML = 'Cargando...';
			info.style.display = 'flex';
			const dateDocRef = doc(db, 'hora', 'actual');
			await setDoc(dateDocRef, {horaActual: serverTimestamp()});
			const time = await getDoc(dateDocRef);
			const dataTime = time.data().horaActual;
			const fecha = formatDate(dataTime);
			const fechaSplit = fecha.split(/[\/\-\\]+/);serverTimestamp
			let year = fechaSplit[2].split(' ')[0];
			let month = fechaSplit[1];
			let day = fechaSplit[0];
			let texto = document.createElement('p');
			texto.style.whiteSpace = 'pre-wrap';
			const ingresosRef = collection(db, 'ingresostemporal'); 
			const snapIngresos = await getDocs(ingresosRef);
			if (!snapIngresos.empty){
				const users = snapIngresos.size;
				const promises1 = snapIngresos.docs.map(async (d) => {
					const docId = d.id;
					const ingresosDBRef = doc(db, 'ingresosdb', String(docId));
					const ingresosDBRefSnap = await getDoc(ingresosDBRef);
					if (ingresosDBRefSnap.exists()){
						let newIngresos = {};
						let newSalidas = {};
						let indiceIngresos = 1;
						let indiceSalidas = 1;
						const dataDB = ingresosDBRefSnap.data();
						if (dataDB.hasOwnProperty('ingresos')){
							indiceIngresos = Object.keys(dataDB.ingresos).length + 1;
							indiceSalidas = Object.keys(dataDB.ingresos).length + 1;
						}
						const ingresos = d.data().ingresos || {};//se debe asegurar siempre la existencia de un diccionario de salidas o entradas
						const salidas = d.data().salidas || {};
						if (Object.keys(ingresos).length > 0){
							Object.keys(ingresos).forEach(key => {
								newIngresos[`ingreso${indiceIngresos}`] = ingresos[`${key}`] ? ingresos[`${key}`] : 'N/A';
								indiceIngresos += 1;
							});
						}
						if (Object.keys(salidas).length > 0) {
							Object.keys(salidas).forEach(key => {
								newSalidas[`ingreso${indiceSalidas}`] = salidas[`${key}`] ? salidas[`${key}`] : 'N/A';
								indiceSalidas += 1;
							});
						}
						const dataToSend = {};
						if (!Object.keys(newIngresos).length == 0){dataToSend['ingresos'] = newIngresos};
						if (!Object.keys(newSalidas).length == 0){dataToSend['salidas']= newSalidas};
						await setDoc(ingresosDBRef, dataToSend, {merge:true});
					} else {
						// Crear registro en 'ingresosdb'
						await setDoc(ingresosDBRef, d.data(), {merge:true});
					}
					// Eliminar el documento de 'ingresostemporal'
					const ingresosTemporalRef = doc(ingresosRef, String(docId));
					await deleteDoc(ingresosTemporalRef);
				});
				// Espera a que todas las promesas se completen
				await Promise.all(promises1);
				texto.textContent = `${users} usuarios actualizados.`;
			} else {
				//console.log("La informacion de ingresos está actualizada.");
				texto.textContent = 'No se encontraron nuevos datos de usuarios.';
			}
			// Copia desde 'temporal -> principal'
			setTimeout(async () => {
				const temporalCollectionRef = collection(db, 'a'+String(year)+'temporal');
				const snapTemporal = await getDocs(temporalCollectionRef);
				if (!snapTemporal.empty) {
					let totalIngresos = 0;
					const documents = snapTemporal.docs;
					const promises = documents.map(m => {
						const month = m.id;
						const mData = m.data()
						Object.keys(mData).forEach(day => {
							totalIngresos += Object.keys(mData[`${day}`]).length;
							Object.keys(mData[`${day}`]).forEach(async (id) => {
								const userRef = doc(db, 'ingresosdb', String(id));
								const snapUser = await getDoc(userRef);
								const dataUser = snapUser.data();
								let dataToSend = {
									nombre: dataUser.nombre,
									documento: dataUser.documento,
									telefono: dataUser.telefono,
									visitante: dataUser.visitante
								};
								const yearRef = doc(db, 'a'+String(year)+'db', String(month), String(day), String(id));
								const snapYear = await getDoc(yearRef);
								if (snapYear.exists()){
									const dataYear = snapYear.data();
									let newIngresos = {};
									let newSalidas = {};
									let indiceSalidas = 1;
									if (mData[`${day}`][`${id}`].hasOwnProperty('ingresos')){
										let indiceIngresos = Object.keys(dataYear.ingresos).length + 1;
										indiceSalidas = Object.keys(dataYear.ingresos).length + 1;
										Object.keys(mData[`${day}`][`${id}`]['ingresos']).forEach(key => {
											newIngresos[`ingreso${indiceIngresos}`] = mData[`${day}`][`${id}`]['ingresos'][`${key}`];
											indiceIngresos += 1;
										});
									}
									if (mData[`${day}`][`${id}`].hasOwnProperty('salidas')){
										Object.keys(mData[`${day}`][`${id}`]['salidas']).forEach(key => {
											newSalidas[`ingreso${indiceSalidas}`] = mData[`${day}`][`${id}`]['salidas'][`${key}`];
											indiceSalidas += 1;
										});
									}
									await setDoc(yearRef, dataToSend, {merge:true});
									if (Object.keys(newIngresos).length > 0){
										await setDoc(yearRef, {ingresos: newIngresos}, {merge:true});
									}
									if (Object.keys(newSalidas).length > 0){
										await setDoc(yearRef, {salidas: newSalidas}, {merge:true});
									}
								} else {
									await setDoc(yearRef, dataToSend, {merge:true});
									if (mData[`${day}`][`${id}`].hasOwnProperty('ingresos')){
										await setDoc(yearRef, {ingresos: mData[`${day}`][`${id}`]['ingresos']}, {merge:true});
									}
									if (mData[`${day}`][`${id}`].hasOwnProperty('salidas')){
										await setDoc(yearRef, {salidas: mData[`${day}`][`${id}`]['salidas']}, {merge:true});
									}
								}
							});
						});
					});
					// Esperar a que todas las promesas se completen
					await Promise.all(promises);
					const deleteTemporals = documents.map(async (m) => {
						const deleteMonthRef = doc(db, 'a'+String(year)+'temporal', String(m.id));
						await deleteDoc(deleteMonthRef);
					});
					await Promise.all(deleteTemporals);
					texto.textContent += `\n${totalIngresos} nuevos ingresos creados.`;
				} else {
					//console.log("No hay registros en la colección temporal para copiar.");
					texto.textContent += '\nNo se encontaron ingresos para registrar.';
				}
				loading.style.display = 'none';
		        info.innerHTML = '';
    	        info.appendChild(texto);
			}, 4000);
		} catch (error) {
			loading.style.display = 'none';
			if (error.code === "auth/invalid-login-credentials"){
				console.log(`Error: ${error}`);
				alert("Correo o contraseña incorrectos.");
			}
			if (error.code === "auth/invalid-email"){
				console.log(`Error: ${error}`);
				alert("El correo no es válido.");
			}
			if (error.code === "auth/network-request-failed"){
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
		localStorage.clear();
		ocultarMenu();
		document.querySelector('#logoUAN').style.display = 'block';
		document.querySelector('#titulo').style.display = 'block';
		logout.style.display = 'none';
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
    }
});

//manejo de evento clik de los botones
document.getElementById('buscar').addEventListener('click', async () => {
	const docId = document.querySelector('#docId').value.trim();
	if (!docId) {
		alert("Debes ingresar un número de documento.");
		return;
	}
	loading.style.display = 'block';
	info.style.display = 'flex';
	info.innerHTML = 'Cargando...';
	dataDownload = [];
	try {
		const docRef = doc(db, 'ingresosdb', String(docId));
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			const data = docSnap.data();
			dataDownload.push([`Usuario_${data.nombre}`]);
			dataDownload.push(encabezado);
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
			info.innerHTML = '';
			info.appendChild(texto);
			info.appendChild(editBtn);
			info.appendChild(msg);
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
	} finally{
		loading.style.display = 'none';
	}
});

diario.addEventListener('click', async () => {
	const fecha = document.querySelector('#fecha').value;
	if (!fecha){
		alert("Debes ingresar una fecha.");
		return;
	};
	loading.style.display = 'block';
	info.innerHTML = 'Cargando...';
	info.style.display = 'flex';
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
			downloadBTN.style.display = 'block';
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
	info.innerHTML = 'Cargando...';
	info.style.display = 'flex';
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
			const monthDocRef = doc(db, 'a'+String(year)+'db', String(month));
		    const docRef = collection(monthDocRef, String(day).length < 2 ? '0' + String(day) : String(day));
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
		downloadBTN.style.display = 'block';
	} catch (error){
		console.log(`Error: ${error}`);
		alert("Ocurrió un error al consultar los registros.");
	} finally{
		loading.style.display = 'none';
	}
});

/*document.getElementById('registros').addEventListener('click', async () => {
	loading.style.display = 'block';
	try {
		info.innerHTML = 'Cargando...';
		info.style.display = 'flex';
		dataDownload = [];
		const docsRef = collection(db, 'ingresosdb');
		const docSnap = await getDocs(docsRef);
		let counter = 0;
		dataDownload.push(["Total_Usuarios"]);
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
		info.innerHTML = '';
		info.appendChild(msg);
		downloadBTN.style.display = 'block';
		
	} catch (error) {
		console.log(`Error: ${error}`);
		alert("Error al consultar los registros.");
	} finally{
		loading.style.display = 'none';
	}
});*/

document.getElementById('backMenu').addEventListener('click', function(){
	info.innerHTML = '';
	info.style.display = 'none';
	downloadBTN.style.display = 'none';
	dataDownload = [];
});

downloadBTN.addEventListener('click', function(){
	loading.style.display = 'block';
	const ws_data = dataDownload;//filas excel
	const ws = XLSX.utils.aoa_to_sheet(ws_data);
	const wb = XLSX.utils.book_new();//libro de trabajo
	XLSX.utils.book_append_sheet(wb, ws, "Ingresos UAN Sede Bucaramanga");
	XLSX.writeFile(wb, `Ingresos_UAN_Sede_Bucaramanga_${dataDownload[0]}.xlsx`);
	loading.style.display = 'none';
});