import { doc, getDoc, db, setDoc, collection, deleteDoc} from './configDB.js';

const idLabel = document.querySelector('#idLabel');
const userId = localStorage.getItem('p1');
idLabel.textContent += `${userId}`;
const docLabel = document.querySelector('#docLabel');
const userDoc = localStorage.getItem('p2');
docLabel.textContent += `${userDoc}`;
const nameLabel = document.querySelector('#nameLabel');
const userName = localStorage.getItem('p3');
nameLabel.textContent += `${userName}`;
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
	let privateData = {};
	let publicData = {};
	const id = document.querySelector('#id').value.trim();
	const docType = document.querySelector('#doc').value.trim();
	const name = document.querySelector('#name').value.trim();
	const tel = document.querySelector('#tel').value.trim();
	const visit = document.querySelector('#visit').value.trim();
	const fecha = document.querySelector('#fecha').value;
	
	if (id && !/^\d+$/.test(id)) {
        alert("El número de identificación no es válido.");
		return;
    };
	if (id && Number(id) == 0){
		alert("El número de identificación no es válido.");
		return;
	};
	if (tel && !/^\d+$/.test(tel)){
		alert("El número de teléfono no es válido.");
		return;
	};
	if (!fecha){
		alert("Debes proporcionar la fecha en la que ingresó la persona.");
		return;
	};
    if (id){
		privateData['identificacion'] = id;
		publicData['identificacion'] = id;
	};
	if (docType){
		privateData['documento'] = docType;
		publicData['documento'] = docType;
	};
	if (name){
		privateData['nombre'] = name;
		publicData['nombre'] = name;
	};
	if (tel){
		privateData['telefono'] = tel;
	};
	if (visit){
		privateData['visitante'] = visit;
	};
	if (Object.keys(privateData).length == 0){
		alert("No has modificado ningún dato.");
		return;
	};
	try {
		//consulta en 'temporal'
		const docRefDB = doc(db, 'ingresosdb', String(userId));
		const docSnap = await getDoc(docRefDB);
		//consulta en 'coleccion fechas'
		const fechaSplit = fecha.split(/[\/\-\\]+/);
		const year = fechaSplit[0];
		const month = fechaSplit[1];
		const day = fechaSplit[2];
		const monthDocRef = doc(db, 'a'+String(year)+'db', String(month));
		const dayCollectionRef = collection(monthDocRef, String(day));
		const docRef = doc(dayCollectionRef, String(userId));
	    const docSnapFecha = await getDoc(docRef);
		if (docSnap.exists()){//solo se conprueba la existencia en db principal
			const docData = docSnap.data();
			const docDataFecha = docSnapFecha.data();
			if (id){
				const newDocRefDB = doc(db, 'ingresosdb', String(id));
				const newDocSnap = await getDoc(newDocRefDB);
				if (!newDocSnap.exists()){
					//actualizacion de datos en 'temporal'
					await setDoc(newDocRefDB, docData, {merge:true});
					await setDoc(newDocRefDB, privateData, {merge:true});
					await deleteDoc(docRefDB);
					//actualizacion en 'publico'
					let oldData = {
						nombre: userName,
						documento: userDoc
					};
					await setDoc(doc(db, 'ingresos', String(id)), oldData, {merge:true});
					await setDoc(doc(db, 'ingresos', String(id)), publicData, {merge:true});
					await deleteDoc(doc(db, 'ingresos', String(userId)));
					//actualizacion en 'coleccion fechas'
					await setDoc(doc(dayCollectionRef, String(id)), docDataFecha, {merge:true});
					await setDoc(doc(dayCollectionRef, String(id)), privateData, {merge:true});
					await deleteDoc(docRef);
				} else {
					alert("El número de documento ya está en uso.");
				}
			} else {
				await setDoc(docRefDB, privateData, {merge:true});
				if (Object.keys(publicData).length > 0){
					await setDoc(doc(db, 'ingresos', String(userId)), publicData, {merge:true});
				};
			    await setDoc(docRef, privateData, {merge:true});
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