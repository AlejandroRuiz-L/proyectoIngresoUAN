import {db, doc, getDoc, serverTimestamp, setDoc, collection} from './configDB.js';
import { formatDate } from './functionsDate.js';

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('formIngreso');
    const loading = document.querySelector('#loadingOverlay');
	form.addEventListener('submit', async (event) => {
	    event.preventDefault(); // Evita que el formulario se envíe de manera predeterminada

			// Recoge todos los checkboxes seleccionados
			const name = document.querySelector('#nombre').value.trim();
			const typeId = document.querySelector('#tipoId').value;
			const numId = document.querySelector('#identificacion').value.trim();
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
			loading.style.display = 'block';
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
				    telefono: tel ? tel : 'N/A',
				    visitante: typeVisitor ? typeVisitor : 'N/A',
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
					const temporalYear = doc(db, 'a'+String(year)+'temporal', String(month));
					await setDoc(temporalYear, {[String(day)]: {[String(numId)]: {ingresos: {ingreso1: serverTimestamp()}}}}, {merge:true});
					alert('Registro de ingreso creado exitosamente.');
					window.location.href= "index.html";
				}
			} catch (error) {
				console.error('Error al enviar datos:', error);
				alert('Error al registrar los datos de ingreso');
			} finally{
				loading.style.display = 'none';
			}
	});
});