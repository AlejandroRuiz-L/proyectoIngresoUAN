import {db, doc, getDoc, serverTimestamp, setDoc, collection} from './configDB.js';

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
	const form = document.getElementById('formIngreso');

	form.addEventListener('submit', async (event) => {
	    event.preventDefault(); // Evita que el formulario se envíe de manera predeterminada

			// Recoge todos los checkboxes seleccionados
			const name = document.querySelector('#nombre').value.trim();
			const typeId = document.querySelector('#tipoId').value;
			const numId = document.querySelector('#identificacion').value.trim();
			const email = document.querySelector('#correo').value.trim();
			const tel  = document.querySelector('#telefono').value.trim();
			const typeVisitor = document.querySelector('#visitante').value;
			
			if(!name || !numId){
				alert('El nombre y la identificación son obligatorios');
				return;
			}
			
			if (!/^\d+$/.test(numId)){
				alert('El número de identificación no es válido');
				return;
			}
			
			if (tel && !/^\d+$/.test(tel)){
				alert("El teléfono no es válido.");
				return;
			}
			
			if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
				alert("El correo no es válido.");
				return;
			}

			try {
				// Envía los datos a Firestore
				const docRef = doc(db, 'ingresos', String(numId));
				const docRefSnap = await getDoc(docRef);
				let publicData = {
					nombre: name,
					documento: typeId,
					identificacion: numId
				}
				let dataToSend = {
				    nombre: name,
				    documento: typeId,
				    identificacion: numId,
				    correo: email,
				    telefono: tel,
				    visitante: typeVisitor,
				    ingresos: {ingreso1: serverTimestamp()}
				};
				if (docRefSnap.exists()){
					alert('El número de documento ya se encuentra registrado.');
				} else {
					await setDoc(docRef, publicData, {merge: true});
					//crea el registro en ingresos y en temporal
					const docRefTemporal = doc(db, 'ingresostemporal', String(numId));
					await setDoc(docRefTemporal, dataToSend, {merge: true});
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
					//crea el registro diario temporal en base al serverTimestamp
					const monthTemporalRef = doc(db, 'a'+String(year)+'temporal', String(month));
					const temporalYear = doc(collection(monthTemporalRef, String(day)), String(numId));
					await setDoc(temporalYear, dataToSend, {merge:true});
					alert('Registro de ingreso creado exitosamente.');
					window.location.href= "index.html";
				}
			} catch (error) {
				console.error('Error al enviar datos:', error);
				alert('Error al registrar los datos de ingreso');
			}
	});
});