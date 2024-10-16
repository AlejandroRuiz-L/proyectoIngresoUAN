import { doc, getDoc, db, serverTimestamp, setDoc, collection} from './configDB.js';
import { formatDate } from './functionsDate.js';

const loading = document.querySelector('#loadingOverlay')

document.addEventListener('DOMContentLoaded', () => {
	const buscarForm = document.querySelector('#buscar-form');
    const divInfo = document.querySelector('#protected-content');
    const botones = document.querySelector('#botones');

	document.getElementById('buscar').addEventListener('click', async (event) => {
		event.preventDefault();
		const docId = document.querySelector('#docId').value.trim();

		if (!docId || !/^\d+$/.test(docId)) {
			alert("Debes ingresar un número de documento válido.");
			return;
		}
		loading.style.display = 'block';
		const docRef = doc(db, 'ingresos', String(docId));

		try {
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const data = docSnap.data();
				let mensaje = document.createElement('p');
				mensaje.style.whiteSpace = "pre-wrap";
				mensaje.style.marginTop = '30px';
				mensaje.textContent = "Si tus datos son incorrectos presiona 'Cancelar'\nde lo contrario registra tu ingreso o tu salida.";
				let texto = document.createElement('p');
				texto.textContent += `${data.documento}: ${data.identificacion}\n${data.nombre}`;
				texto.classList.add('lista-item');
				divInfo.appendChild(texto);
				divInfo.appendChild(mensaje);
				buscarForm.style.display = 'none';
				divInfo.style.display = 'block';
				botones.style.display = 'flex';
			} else {
				alert("El documento no se encuentra registrado.");
			}
		} catch (error) {
			console.log(`Error: ${error}`);
			alert("Error al consultar.");
		}finally {
                // Ocultar la pantalla de carga
                loading.style.display = 'none';
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
            // Mostrar la pantalla de carga
            loading.style.display = 'block';
            try {
                const docId = document.querySelector('#docId').value.trim();
                const docRef = doc(db, 'ingresostemporal', String(docId));
                const docSnap = await getDoc(docRef);
                let indice = 'ingreso1';
                let dataToSend = {};
                if (docSnap.exists() && docSnap.data().hasOwnProperty('ingresos')) {
                    indice = `ingreso${Object.keys(docSnap.data().ingresos).length + 1}`;
                }
                dataToSend['ingresos'] = { [indice]: serverTimestamp() };
                await setDoc(docRef, dataToSend, { merge: true });

                // Maneja la obtención de un serverTimestamp
                const dateDocRef = doc(db, 'hora', 'actual');
                await setDoc(dateDocRef, { horaActual: serverTimestamp() });
                const time = await getDoc(dateDocRef);
                const dataTime = time.data().horaActual;
                const fecha = formatDate(dataTime);

                // Maneja la obtención de la fecha
                const arrayDate = fecha.split(' ')[0];
                const fechaSplit = arrayDate.split('/');
                const year = fechaSplit[2];
                const month = fechaSplit[1];
                const day = fechaSplit[0];

                // Crea el registro diario en base al serverTimestamp
                const monthDocRef = doc(db, 'a' + String(year) + 'temporal', String(month));
                const newTimeDocRef = doc(collection(monthDocRef, String(day)), String(docId));
                await setDoc(newTimeDocRef, dataToSend, { merge: true });

                accionCancelar();
                alert("Se ha creado el registro de entrada.");
            } catch (error) {
                console.log(`Error: ${error}`);
                alert("Error al crear el registro.");
            } finally {
                // Ocultar la pantalla de carga
                loading.style.display = 'none';
            }
        });

	document.getElementById('salida').addEventListener('click', async () => {
		loading.style.display = 'block';
		try {
			const docId = document.querySelector('#docId').value.trim();
            const docRef = doc(db, 'ingresostemporal', String(docId));
			let indice = 'ingreso1';
			const docRefSnap = await getDoc(docRef);
			if (docRefSnap.exists() && docRefSnap.data().hasOwnProperty('salidas')){
				indice = `ingreso${Object.keys(docRefSnap.data().salidas).length}`;
			}
			const dataToSend = {
				salidas: {[indice]:serverTimestamp()}
			}
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
		    const monthDocRef = doc(db, 'a'+String(year)+'temporal', String(month));
			const newTimeDocRef = doc(collection(monthDocRef, String(day)), String(docId));
			await setDoc(newTimeDocRef, dataToSend, {merge:true});
			alert("Se ha creado el registro de salida.");
			accionCancelar();
			
		} catch (error) {
			console.log(`Error: ${error}`);
			alert("Error al registrar hora de salida.");
		}finally {
                // Ocultar la pantalla de carga
                loading.style.display = 'none';
            }
	});	
	document.getElementById('cancelar').addEventListener('click', accionCancelar);
});
