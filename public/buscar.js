import { doc, getDoc, db, serverTimestamp, setDoc} from './configDB.js';

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
				mensaje.textContent = "Si tus datos son incorrectos presiona 'Cancelar'\npara ingresar de nuevo tu documento.";
				let texto = document.createElement('p');
				texto.textContent += `Documento: ${data.identificacion}\nNombre: ${data.nombre}`;
				texto.classList.add('lista-item');
				divInfo.appendChild(mensaje);
				divInfo.appendChild(texto);
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
	}

	document.getElementById('cancelar').addEventListener('click', accionCancelar);

	document.getElementById('salida').addEventListener('click', async () => {
		try {
			const docId = document.querySelector('#docId').value.trim();
            const docRef = doc(db, 'ingresos', docId);
			const docSnap = await getDoc(docRef);
			const data = docSnap.data();
			let indice = 'ingreso1';
			let dataToSend = {
			    salidas:{[indice]:serverTimestamp()}
			};
			if (data.salidas){
				indice = `ingreso${Object.keys(data.ingresos).length}`;
				let dataToSend = {
					salidas:{[indice]:serverTimestamp()}
				}
				await setDoc(docRef, dataToSend, {merge:true});
				accionCancelar();
				alert("Se ha creado el registro de salida.");
			} else {
				await setDoc(docRef, dataToSend, {merge:true});
				accionCancelar();
				alert("Se ha creado el registro de salida.");
			}
		} catch (error) {
			console.log(`Error: ${error}`);
			alert("Error al registrar hora de salida.");
		}
	});
	
	document.getElementById('entrada').addEventListener('click', async () => {
		try {
			const docId = document.querySelector('#docId').value.trim();
			const docRef = doc(db, 'ingresos', docId);
			const docSnap = await getDoc(docRef);
			const data = docSnap.data();
			let indice = 'ingreso1';
			let dataToSend = {
				ingresos:{[indice]:serverTimestamp()}
			};
			if (data.ingresos){
				indice = `ingreso${Object.keys(data.ingresos).length + 1}`;
				let dataToSend = {
					ingresos:{[indice]:serverTimestamp()}
				}
				await setDoc(docRef, dataToSend, {merge:true});
				accionCancelar();
				alert('Se ha creado el registro de entrada.');
			} else {
				await setDoc(docRef, dataToSend, {merge:true});
				accionCancelar();
				alert("Se ha creado el registro de entrada.");
			}
		} catch (error) {
			console.log(`Error: ${error}`);
			alert("Error al crear el registro.");
		}
	})
});