import { getAuth, signOut, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, doc, getDoc, getDocs, deleteDoc, setDoc, collection } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

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
const menu = document.querySelector('#menu');
const info = document.querySelector('#info');
const diario = document.querySelector('#diario');
const semanal = document.querySelector('#semanal');
const encabezado = ["IDENTIFICACION", "DOCUMENTO", "NOMBRE", "CORREO", "TELEFONO", "TIPO DE VISITANTE", "INGRESO", "SALIDA"];
let dataDownload = [];
const downloadBTN = document.querySelector('#downloadBTN');
const formatDate = (date) => {
				if (!date) return 'N/A';
				const options = {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					hour12: false // Formato 24 horas
				};
				return date.toDate().toLocaleString('es-CO', options).replace(',', '');
    };
function esFechaValida(year, month, day) {
				const fechaObjeto = new Date(year, month - 1, day);
				return (
					fechaObjeto.getFullYear() === year &&
					fechaObjeto.getMonth() === month - 1 &&
					fechaObjeto.getDate() === day
				);
			}

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
			await signInWithEmailAndPassword(auth, email, passwordUser);
			mostrarMenu();
			adminForm.reset();
			logout.style.display = 'block';
		} catch (error) {
			if (error.code === "auth/invalid-login-credentials"){
				console.log(`Error: ${error}`);
				alert("Correo o contraseña incorrectos.");
			} else if (error.code === "auth/invalid-email"){
				console.log(`Error: ${error}`);
				alert("El correo no es válido.");
			} else if (error.code === "auth/network-request-failed"){
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
		logout.style.display = 'none';
		console.log('El usuario ha cerrado sesión');
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
    }
});

//manejo de evento clik de los botones
document.getElementById('buscar').addEventListener('click', async () => {
	info.innerHTML = '';
	dataDownload = [];
	const docId = document.querySelector('#docId').value.trim();
	if (!docId) {
		alert("Debes ingresar un número de documento.");
		return;
	}
	try {
		const docRef = doc(db, 'ingresos', docId);
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
			info.appendChild(texto);
			info.appendChild(editBtn);
			info.appendChild(msg);
			info.style.display = 'flex';
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
	}
});

diario.addEventListener('click', async () => {
	info.innerHTML = '';
	dataDownload = [];
	const fecha = document.querySelector('#fecha').value;
	if (!fecha){
		alert("Debes ingresar una fecha.");
		return;
	};
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
						`${data.identificacion}`, 
						`${data.documento}`, 
						`${data.nombre}`, 
						`${data.correo ? data.correo : 'N/A'}`,
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
			info.appendChild(msg);
			info.style.display = 'flex';
			downloadBTN.style.display = 'block';
		} else {
			alert("No hay registros para la fecha especificada.");
			return;
		}
	} catch (error){
		console.log(`Error: ${error}`);
		alert("Ocurrió un error al consultar los registros.");
	}
});

semanal.addEventListener('click', async () => {
	info.innerHTML = '';
	dataDownload = [];
	const fechaValue = document.querySelector('#fecha').value;
	if (!fechaValue){
		alert("Debes seleccionar una fecha.");
		return;
	};
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
							`${data.identificacion}`, 
							`${data.documento}`, 
							`${data.nombre}`, 
							`${data.correo ? data.correo : 'N/A'}`,
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
		info.appendChild(msg);
		info.style.display = 'flex';
		downloadBTN.style.display = 'block';
	} catch (error){
		console.log(`Error: ${error}`);
		alert("Ocurrió un error al consultar los registros.");
	}
});

document.getElementById('registros').addEventListener('click', async () => {
	try {
		info.innerHTML = '';
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
		info.appendChild(msg);
		info.style.display = 'flex';
		downloadBTN.style.display = 'block';
		
	} catch (error) {
		console.log(`Error: ${error}`);
		alert("Error al consultar los registros.");
	}
});

document.querySelector('#copia').addEventListener('click', async () => {
	const fechaValue = document.querySelector('#fecha').value;
	info.innerHTML = '';
	if (!fechaValue){
		alert("Debes ingresar una fecha");
	    return;
	};
	const fechaSplit = fechaValue.split(/[\/\-\\]+/);
	let year = fechaSplit[0];
	let month = fechaSplit[1];
	let day = fechaSplit[2];
	let texto = document.createElement('p');
	texto.style.whiteSpace = 'pre-wrap';
	try {
		const ingresosRef = collection(db, 'ingresostemporal'); 
		const snapIngresos = await getDocs(ingresosRef);
		if (!snapIngresos.empty){
			const users = snapIngresos.size;
			const promises1 = snapIngresos.docs.map(async (d) => {
				const docId = d.id;
				const ingresosDBRef = doc(db, 'ingresosdb', docId);
				const ingresosDBRefSnap = await getDoc(ingresosDBRef);
				if (ingresosDBRefSnap.exists()){
					let newIngresos = {};
					let newSalidas = {};
					let indice = 1;
					if (ingresosDBRefSnap.data().ingresos){
						indice = Object.keys(ingresosDBRefSnap.data().ingresos).length;
					}
					const ingresos = d.data().ingresos || {};
					const salidas = d.data().salidas || {};
					Object.keys(ingresos).forEach(key => {
						newIngresos[`ingreso${indice}`] = ingresos[key];
						newSalidas[`ingreso${indice}`] = salidas[key];
						indice += 1;
					});
					const dataToSend = {
						ingresos: newIngresos,
						salidas: newSalidas
					};
					await setDoc(ingresosDBRef, dataToSend, {merge:true});
				} else {
				    // Crear registro en 'ingresosdb'
				    await setDoc(ingresosDBRef, d.data(), { merge: true });
				}

				// Eliminar el documento de 'ingresostemporal'
				const ingresosTemporalRef = doc(ingresosRef, docId);
				await deleteDoc(ingresosTemporalRef);
				//console.log(`Documento eliminado de 'ingresostemporal': ${docId}`);
			});

			// Espera a que todas las promesas se completen
			await Promise.all(promises1);
			//console.log("Todos los registros han sido procesados y eliminados.");
			texto.textContent = `${users} nuevos usuarios creados.`;
		} else {
			//console.log("La informacion de ingresos está actualizada.");
		    texto.textContent = 'No se encontraron usuarios nuevos.';
		}
		// Copia desde 'temporal -> principal'
        const temporalCollectionRef = collection(db, 'a'+String(year)+'temporal', String(month), String(day));
        const snapTemporal = await getDocs(temporalCollectionRef);
        if (!snapTemporal.empty) {
			const totalIngresos = snapTemporal.size;
            const promises = snapTemporal.docs.map(async (d) => {
                const docId = d.id;
				const ingresosdbRef = doc(db, 'ingresosdb', String(docId));
				const snapIngresosdb = await getDoc(ingresosdbRef);
				const data = snapIngresosdb.data();
				const dataToSend = {
					nombre: data.nombre,
					documento: data.documento,
					identificacion: data.identificacion,
					correo: data.correo,
					telefono: data.telefono,
					visitante: data.visitante,
					ingresos: d.data().ingresos ? d.data().ingresos : 'N/A',
					salidas: d.data().salidas ? d.data().salidas : 'N/A'
				};

                // Crear referencia al documento en 'a2024db'
                const newDocRef = doc(db, 'a'+String(year)+'db', String(month), String(day), String(docId));

                // Copiar el documento a 'a2024db'
                await setDoc(newDocRef, dataToSend, { merge: true });

                // Eliminar el documento de la colección temporal
                const temporalDocRef = doc(temporalCollectionRef, docId);
                await deleteDoc(temporalDocRef);
            });

            // Esperar a que todas las promesas se completen
            await Promise.all(promises);
			texto.textContent += `\n${totalIngresos} nuevos ingresos creados.`;
        } else {
            //console.log("No hay registros en la colección temporal para copiar.");
			texto.textContent += '\nNo se encontaron ingresos para esa fecha.';
        }
	} catch (error){
		console.log(`Error: ${error}`);
		alert("Error en copia de seguridad.");
	}
	info.appendChild(texto);
	info.style.display = 'flex';
});

document.getElementById('backMenu').addEventListener('click', function(){
	info.innerHTML = '';
	info.style.display = 'none';
	downloadBTN.style.display = 'none';
	dataDownload = [];
});

downloadBTN.addEventListener('click', function(){
	const ws_data = dataDownload;//filas excel
	const ws = XLSX.utils.aoa_to_sheet(ws_data);
	const wb = XLSX.utils.book_new();//libro de trabajo
	XLSX.utils.book_append_sheet(wb, ws, "Ingresos UAN Sede Bucaramanga");
	XLSX.writeFile(wb, `Ingresos_UAN_Sede_Bucaramanga_${dataDownload[0]}.xlsx`);
});