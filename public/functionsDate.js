import { Timestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const formatDate = (date) => {
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
    };

function esFechaValida(year, month, day) {
				const fechaObjeto = new Date(year, month - 1, day);
				return (
					fechaObjeto.getFullYear() === year &&
					fechaObjeto.getMonth() === month - 1 &&
					fechaObjeto.getDate() === day
				);
			}

function dateTimeToServerTime(dateTime){
	const newDateTime = new Date(dateTime);
	const serverTime = Timestamp.fromDate(newDateTime);
	return serverTime;
}

export { formatDate, esFechaValida, dateTimeToServerTime };