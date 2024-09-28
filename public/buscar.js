import { doc, getDoc, db, serverTimestamp, setDoc, collection} from './configDB.js';

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
				return `${date.toDate().toLocaleString('es-CO', options).replace(',', '')}`;
    };

document.addEventListener('DOMContentLoaded', () => {
	const buscarForm = document.querySelector('#buscar-form');
    const divInfo = document.querySelector('#protected-content');
    const botones = document.querySelector('#botones');

	document.getElementById('buscar').addEventListener('click', async (event) => {
		event.preventDefault();
		const docId = document.querySelector('#docId').value.trim();

		if (!docId) {
			alert("Debes ingresar tu número de documento");
			return;
		}

		const docRef = doc(db, 'ingresos', docId);

		try {
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const data = docSnap.data();
				let mensaje = document.createElement('p');
				mensaje.style.whiteSpace = "pre-wrap";
				mensaje.style.marginTop = '30px';
				mensaje.textContent = "Si tus datos son incorrectos presiona 'Cancelar'\nde lo contrario registra tu ingreso o tu salida.";
				let texto = document.createElement('p');
				texto.textContent += `Documento: ${data.identificacion}\nNombre: ${data.nombre}`;
				texto.classList.add('lista-item');
				divInfo.appendChild(texto);
				divInfo.appendChild(mensaje);
				buscarForm.style.display = 'none';
				divInfo.style.display = 'block';
				botones.style.display = 'flex';
			} else {
				alert("No se encontró el documento");
			}
		} catch (error) {
			console.log(`Error: ${error}`);
			alert("Error al consultar.");
		}
	});
	
	function accionCancelar(){
		divInfo.innerHTML = '';
		divInfo.style.display = 'none';
		botones.style.display = 'none';
		buscarForm.reset();
		buscarForm.style.display = 'flex';
	};
	
	document.getElementById('entrada').addEventListener('click', async () => {
		try {
			const docId = document.querySelector('#docId').value.trim();
			const docRef = doc(db, 'ingresos', docId);
			const docSnap = await getDoc(docRef);
			const data = docSnap.data();
			let indice = 'ingreso1';
			if (data.ingresos){
				indice = `ingreso${Object.keys(data.ingresos).length + 1}`;
			};
			let dataToSend = {
				ingresos:{[indice]: serverTimestamp()}
			};
			await setDoc(docRef, dataToSend, {merge:true});
			//maneja la obtención de un serverTimestamp
			const dateDocRef = doc(db, 'hora', 'actual');
			await setDoc(dateDocRef, {horaActual: serverTimestamp()});
			const time = await getDoc(dateDocRef);
			const dataTime = time.data().horaActual;
			const fecha = formatDate(dataTime);
			//maneja la obtencion de la fecha
			const arrayDate = fecha.split(' ')[0];
			const fechaSplit = arrayDate.split('/');
			const year = fechaSplit[2];
			const month = fechaSplit[1];
			const day = fechaSplit[0];
			//crea el registro diario en base al serverTimestamp
			const newDataUser = {
				documento: data.documento,
				nombre: data.nombre,
				correo: data.correo,
				identificacion: data.identificacion,
				telefono: data.telefono,
				visitante: data.visitante,
				ingresos: {[indice]: serverTimestamp()}
			};
			const monthDocRef = doc(db, 'a'+String(year), String(month));
			const newTimeDocRef = doc(collection(monthDocRef, String(day)), String(data.identificacion));
			await setDoc(newTimeDocRef, newDataUser, {merge:true});
			accionCancelar();
			alert("Se ha creado el registro de entrada.");
		} catch (error) {
			console.log(`Error: ${error}`);
			alert("Error al crear el registro.");
		}
	});

	document.getElementById('salida').addEventListener('click', async () => {
		try {
			const docId = document.querySelector('#docId').value.trim();
            const docRef = doc(db, 'ingresos', docId);
			const docSnap = await getDoc(docRef);
			const data = docSnap.data();
			let indice = 'ingreso1';
			if (data.salidas){
				indice = `ingreso${Object.keys(data.ingresos).length}`;
			}
			let dataToSend = {
			    salidas:{[indice]:serverTimestamp()}
			};
			await setDoc(docRef, dataToSend, {merge:true});
			//maneja la obtención de un serverTimestamp
			const dateDocRef = doc(db, 'hora', 'actual');
			await setDoc(dateDocRef, {horaActual: serverTimestamp()});
			const time = await getDoc(dateDocRef);
			const dataTime = time.data().horaActual;
			const fecha = formatDate(dataTime);
			//maneja la obtencion de la fecha
			const arrayDate = fecha.split(' ')[0];
			const fechaSplit = arrayDate.split('/');
			const year = fechaSplit[2];
			const month = fechaSplit[1];
			const day = fechaSplit[0];
			//crea el registro diario en base al serverTimestamp
			const newDataUser = {
				documento: data.documento,
				nombre: data.nombre,
				correo: data.correo,
				identificacion: data.identificacion,
				telefono: data.telefono,
				visitante: data.visitante,
				salidas: {[indice]: serverTimestamp()}
			};
		    const monthDocRef = doc(db, 'a'+String(year), String(month));
			const newTimeDocRef = doc(collection(monthDocRef, String(day)), String(data.identificacion));
			await setDoc(newTimeDocRef, newDataUser, {merge:true});
			accionCancelar();
			alert("Se ha creado el registro de salida.");
			
		} catch (error) {
			console.log(`Error: ${error}`);
			alert("Error al registrar hora de salida.");
		}
	});
	
	document.getElementById('cancelar').addEventListener('click', accionCancelar);
});
