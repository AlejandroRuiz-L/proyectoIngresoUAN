import { doc, getDoc, db, setDoc, deleteDoc} from './configDB.js';

const idLabel = document.querySelector('#idLabel');
idLabel.textContent += `${localStorage.getItem('p1')}`;
const docLabel = document.querySelector('#docLabel');
docLabel.textContent += `${localStorage.getItem('p2')}`;
const nameLabel = document.querySelector('#nameLabel');
nameLabel.textContent += `${localStorage.getItem('p3')}`;
const emailLabel = document.querySelector('#emailLabel');
emailLabel.textContent += `${localStorage.getItem('p4')}`;
const telLabel = document.querySelector('#telLabel');
telLabel.textContent += `${localStorage.getItem('p5')}`;
const visitLabel = document.querySelector('#visitLabel');
visitLabel.textContent += `${localStorage.getItem('p6')}`;

document.querySelector('#cancelar').addEventListener('click', function(){
	localStorage.clear();
	window.close();
});

document.querySelector('#guardar').addEventListener('click', async (event) => {
    event.preventDefault();
	let data = {};
	const id = document.querySelector('#id').value.trim();
	const docType = document.querySelector('#doc').value.trim();
	const name = document.querySelector('#name').value.trim();
	const email = document.querySelector('#email').value.trim();
	const tel = document.querySelector('#tel').value.trim();
	const visit = document.querySelector('#visit').value.trim();
	
	if (id && !/^\d+$/.test(id)) {
        alert("El número de identificación no es válido.");
		return;
    };
	if (tel && !/^\d+$/.test(tel)){
		alert("El número de teléfono no es válido.");
		return;
	};
    if (id){
		data['identificacion'] = id;
	};
	if (docType){
		data['documento'] = docType;
	};
	if (name){
		data['nombre'] = name;
	};
	if (email){
		data['correo'] = email;
	};
	if (tel){
		data['telefono'] = tel;
	};
	if (visit){
		data['visitante'] = visit;
	};
	const docRef = doc(db, 'ingresos', localStorage.getItem('p1'));
	try {
		const docSnap = await getDoc(docRef);
		const docData = docSnap.data();
		if (docSnap.exists()){
			if (id){
				const newDocRef = doc(db, 'ingresos', id);
				const newDocSnap = await getDoc(newDocRef);
				if (!newDocSnap.exists()){
					await setDoc(newDocRef, docData, {merge:true});
					await setDoc(newDocRef, data, {merge:true});
					await deleteDoc(docRef);
				} else {
					alert("El número de documento ya está en uso.");
				}
			} else {
				await setDoc(docRef, data, {merge:true});	
			}
			localStorage.clear();
			alert("Se ha actualizado el registro.");
			window.close();
		} else {
			alert("No se encontró el número de documento.");
		}
	} catch (error){
		console.log(`Error: ${error}`);
		alert("Error al actualizar el registro.");
	}
});