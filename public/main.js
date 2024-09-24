import {db, doc, getDoc, serverTimestamp, setDoc} from './configDB.js';

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('formIngreso');

	form.addEventListener('submit', async (event) => {
	    event.preventDefault(); // Evita que el formulario se envíe de manera predeterminada

			// Recoge todos los checkboxes seleccionados
			const name = document.querySelector('#nombre').value.trim();
			const typeId = document.querySelector('#tipoId').value;
			const numIdText = document.querySelector('#identificacion').value.trim();
			const numId = parseInt(numIdText);
			const email = document.querySelector('#correo').value.trim();
			const tel  = document.querySelector('#telefono').value.trim();
			const typeVisitor = document.querySelector('#visitante').value;
			
			if (!numId){
				alert('El número de identificación no es válido');
				return;
			}
			
			if(!name || !numIdText){
				alert('El nombre y la identificación son obligatorios');
				return;
			}

			try {
				// Envía los datos a Firestore
				const docRef = doc(db, 'ingresos', String(numId));
				const docRefSnap = await getDoc(docRef);
				let fieldNumberToText = 'ingreso1';
				let dataToSend = {
				    nombre: name,
				    documento: typeId,
				    identificacion: numId,
				    correo: email,
				    telefono: tel,
				    visitante: typeVisitor,
				    ingresos: {[fieldNumberToText]: serverTimestamp()}
				}
				
				if (docRefSnap.exists()){
					alert('El número de documento ya se encuentra registrado.');
				}else{
					await setDoc(docRef, dataToSend, {merge: true});
				    alert('Ingreso registrado exitosamente');
				}
			} catch (error) {
				console.error('Error al enviar datos:', error);
				alert('Error al registrar los datos de ingreso');
			}
	});
});