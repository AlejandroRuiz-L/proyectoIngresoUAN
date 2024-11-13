import { Timestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

export function formatDate(date){
	if (!date || date == 'N/A') return 'N/A';
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
}

export function esFechaValida(year, month, day) {
	const fechaObjeto = new Date(year, month - 1, day);
	return (
		fechaObjeto.getFullYear() === year &&
		fechaObjeto.getMonth() === month - 1 &&
		fechaObjeto.getDate() === day
	);
}

export function dateTimeToServerTime(dateTime){
	const newDateTime = new Date(dateTime);
	const serverTime = Timestamp.fromDate(newDateTime);
	return serverTime;
}

export function isValidName(str){
	return /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/.test(str);
}

export function isValidEmail(email){
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isNum(str){
	return /^\d+$/.test(str);
}

export function newBtn(id, textC, url){
	const btn = document.createElement('button');
	btn.id = id;
	btn.textContent = textC;
	btn.classList.add("boton");
	btn.onclick = function (){
		window.open(`${url}.html`, '_blank');
	};
	return btn;
}

export function formatTimestamp(timestamp) {//convierte un Timestamp a formato especifico de fecha y hora
  const date = timestamp.toDate();

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function splitDate(date){
	return date.split(/[\/\-\\T]+/);
}

export function capitalize(string){
	let letra = string[0].toUpperCase();
	let newString = `${letra}${string.slice(1)}`;
	return newString;
}