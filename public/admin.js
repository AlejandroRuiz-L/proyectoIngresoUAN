import { getAuth, signOut, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, getDoc, getDocs, deleteDoc, setDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { formatDate, isValidEmail } from './functionsDate.js';

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

const adminForm = document.querySelector('#admin-form');
const logout = document.querySelector('#logout');
const loading = document.querySelector('#loadingOverlay');
const menu = document.querySelector('#menu');
const backMenu = document.querySelector('#backMenu');
const info = document.querySelector('#info');
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

document.querySelector('#seePwd').addEventListener('change', (event) => {
	const seePwd = event.target;
	const pwd = document.querySelector('#password');
	if (seePwd.checked){
		pwd.type = 'text';
	} else {
		pwd.type = 'password';
	}
});

document.addEventListener('DOMContentLoaded', () => {//inicio de sesion admin
	document.querySelector('#admin-form').addEventListener('submit', async (event) => {
		event.preventDefault();
		const email = document.querySelector('#correo').value.trim();
		const passwordUser = document.querySelector('#password').value.trim();
		if (!isValidEmail(email)){
			alert("Debes ingresar un email válido.");
			return;
		}
		if (!passwordUser){
			alert("Debes ingresar una contraseña.");
			return;
		}
		try {
			loading.style.display = 'block';
			await signInWithEmailAndPassword(auth, email, passwordUser);
			mostrarMenu();
			adminForm.reset();
			document.querySelector('#logoUAN').style.display = 'none';
			document.querySelector('#titulo').style.display = 'none';
			logout.style.display = 'block';
			document.querySelector('#home').style.display = 'none';
			downloadBTN.style.display = 'none';
			info.innerHTML = 'Cargando...';
			info.style.display = 'flex';
			sessionStorage.setItem('userIngreso', email);
			sessionStorage.setItem('pwdIngreso', passwordUser);
			//Se realiza la copia de seguridad luego de iniciar sesion
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
			texto.textContent = 'Base de datos actualizada.';
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
						const ingresos = d.data().ingresos || {};//se debe asegurar siempre la existencia de un diccionario de salidas o entradas
						const salidas = d.data().salidas || {};
						const dataDB = ingresosDBRefSnap.data();
						if (dataDB.hasOwnProperty('ingresos')){
							indiceIngresos = Object.keys(dataDB.ingresos).length + 1;
							if (Object.keys(ingresos).length == 0){
								indiceSalidas = Object.keys(dataDB.ingresos).length;
							} else {
								indiceSalidas = Object.keys(dataDB.ingresos).length + 1;
							}
						}
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
				texto.textContent += `\n${users} usuarios modificados.`;
			} else {
				//console.log("La informacion de ingresos está actualizada.");
				texto.textContent += '\nNo se encontraron nuevos datos de usuarios.';
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
											newSalidas[`ingreso${indiceIngresos}`] = mData[`${day}`][`${id}`]['salidas'][`${key}`] || 'N/A';
											indiceIngresos += 1;
										});
									} else {
										indiceSalidas = Object.keys(dataYear.ingresos).length;
										if (mData[`${day}`][`${id}`].hasOwnProperty('salidas')){
											Object.keys(mData[`${day}`][`${id}`]['salidas']).forEach(key => {
												newSalidas[`ingreso${indiceSalidas}`] = mData[`${day}`][`${id}`]['salidas'][`${key}`];
												indiceSalidas += 1;
											});
										}
									}
									//await setDoc(yearRef, dataToSend, {merge:true});
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
			let infoError = '';
			if (error.code === "auth/invalid-login-credentials"){
				infoError = "Correo o contraseña incorrectos.";
			}
			if (error.code === "auth/invalid-email"){
				infoError = "El correo no es válido.";
			}
			if (error.code === "auth/network-request-failed"){
				infoError = 'No tienes conexión a internet.';
			}
    		console.log(`Error: ${error}`);
	    	alert(`Error al iniciar sesión.\n${infoError}`);
			loading.style.display = 'none';
		}
	});
});

// Maneja el cierre de sesión
document.getElementById('logout').addEventListener('click', async () => {
    try {
        await signOut(auth);
		localStorage.clear();
		sessionStorage.clear();
		ocultarMenu();
		document.querySelector('#logoUAN').style.display = 'block';
		document.querySelector('#titulo').style.display = 'block';
		logout.style.display = 'none';
		document.querySelector('#home').style.display = 'block';
		backMenu.style.display = 'none';
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
    }
});

document.getElementById('buscar').addEventListener('click', async () => {//manejo de evento clik de los botones
	const docId = document.querySelector('#docId').value.trim();
	if (!docId || !/^\d+$/.test(docId)) {
		alert("Debes ingresar un número de documento válido.");
		return;
	}
	loading.style.display = 'block';
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
			const _docu = data.documento;
			const _name = data.nombre;
			const _tel = data.telefono ? data.telefono : 'N/A';
			const _visit = data.visitante;

			Object.keys(ingresos).forEach(key => {
				let registro = [
					`${docId}`, 
					`${_docu}`, 
					`${_name}`, 
					`${_tel}`, 
					`${_visit}`,
					`${ingresos[key] ? formatDate(ingresos[key]) : 'N/A'}`,
					`${salidas[key] ? formatDate(salidas[key]) : 'N/A'}`
				];
				texto.textContent = `${_docu}: ${docId}\n${_name}\n\nPuedes editar la información del usuario:`;
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
				sessionStorage.setItem('p1', docId);
			    sessionStorage.setItem('p2', _docu);
			    sessionStorage.setItem('p3', _name);
				sessionStorage.setItem('p4', _tel);
				sessionStorage.setItem('p5', _visit);
				window.open(`editar.html`, '_blank');
			});
			info.style.display = 'flex';
			backMenu.style.display = 'block';
			menu.style.display = 'none';
		} else {
			alert("El número de documento no se encuentra registrado.");
		}
	} catch (error) {
		console.log(`Error: ${error}`);
		alert("Error al consultar el documento");
	} finally{
		loading.style.display = 'none';
	}
});

/*document.getElementById('registros').addEventListener('click', async () => {//inhabilitado(realiza muchas lecturas en DB)
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

document.querySelector('#reportes').addEventListener('click', () => {
	window.open("reportes.html", "_blank");
});

document.querySelector('#novedades').addEventListener('click', () => {
	window.open("registroAdmin.html", "_blank");
});

document.querySelector('#prestamos').addEventListener('click', () => {
	window.open('prestamos.html', '_blank');
});

backMenu.addEventListener('click', () => {
	info.innerHTML = '';
	info.style.display = 'none';
	downloadBTN.style.display = 'none';
	dataDownload = [];
	menu.style.display = 'flex';
	backMenu.style.display = 'none';
});

downloadBTN.addEventListener('click', () => {
	loading.style.display = 'block';
	const ws_data = dataDownload;//filas excel
	const ws = XLSX.utils.aoa_to_sheet(ws_data);
	const wb = XLSX.utils.book_new();//libro de trabajo
	XLSX.utils.book_append_sheet(wb, ws, "Ingresos UAN Sede Bucaramanga");
	XLSX.writeFile(wb, `Ingresos_UAN_Sede_Bucaramanga_${dataDownload[0]}.xlsx`);
	loading.style.display = 'none';
});