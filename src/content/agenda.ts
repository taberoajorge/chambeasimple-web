// Text of the booking page at agenda.chambasimple.com (agenda/), in both languages.

const es = {
  lang: 'es-PE',
  title: 'Agenda una conversación de 30 minutos',
  description:
    'Elige un horario libre para conversar con Chambea Simple sobre tu proyecto. Es gratis, por Google Meet.',
  lead: 'Es gratis y por Google Meet. Cuéntanos qué hace tu equipo a mano hoy y vemos si podemos ayudarte.',
  timeZone: (tz: string) => `Horarios en tu hora: ${tz}.`,
  pick: 'Elige un horario',
  none: 'No quedan horarios libres en las próximas semanas. Escríbenos y buscamos uno.',
  name: 'Tu nombre',
  company: 'Empresa',
  email: 'Correo de trabajo',
  need: '¿Qué te gustaría resolver?',
  needHint: 'Máximo 500 caracteres.',
  submit: 'Agendar',
  privacy: 'Usamos estos datos solo para preparar la conversación.',
  privacyLink: 'Privacidad',
  fallback: 'También puedes escribirnos a',
  closed: 'La agenda en línea abre pronto. Mientras tanto, escríbenos y te proponemos un horario.',
  done: {
    title: 'Listo, quedó agendado',
    body: (when: string) =>
      `Te esperamos el ${when}. Te llegó una invitación de Google Calendar a tu correo con el enlace de Meet.`,
    meet: 'Abrir el enlace de Meet',
    back: 'Volver a chambasimple.com',
  },
  errors: {
    fields: 'Revisa los campos marcados.',
    slot: 'Ese horario ya no está libre. Elige otro.',
    trap: 'No pudimos procesar el envío. Intenta de nuevo en unos segundos.',
    stale: 'La página expiró. Vuelve a elegir tu horario.',
    limit: 'Ya tienes conversaciones agendadas con este correo. Si necesitas otra, escríbenos.',
    busy: 'Hay muchas solicitudes ahora. Intenta en un minuto.',
    google: 'No pudimos crear la reunión. Escríbenos y la agendamos a mano.',
  },
};

const en: typeof es = {
  lang: 'en',
  title: 'Book a 30-minute call',
  description:
    'Pick a free time to talk with Chambea Simple about your project. Free, on Google Meet.',
  lead: 'Free, on Google Meet. Tell us what your team does by hand today and we will see if we can help.',
  timeZone: (tz: string) => `Times in your time zone: ${tz}.`,
  pick: 'Pick a time',
  none: 'No free times in the coming weeks. Write to us and we will find one.',
  name: 'Your name',
  company: 'Company',
  email: 'Work email',
  need: 'What would you like to solve?',
  needHint: 'Up to 500 characters.',
  submit: 'Book',
  privacy: 'We use this only to prepare the call.',
  privacyLink: 'Privacy',
  fallback: 'You can also write to',
  closed: 'Online booking opens soon. Meanwhile, write to us and we will suggest a time.',
  done: {
    title: 'You are booked',
    body: (when: string) =>
      `See you on ${when}. A Google Calendar invite with the Meet link is in your inbox.`,
    meet: 'Open the Meet link',
    back: 'Back to chambasimple.com',
  },
  errors: {
    fields: 'Please check the highlighted fields.',
    slot: 'That time is no longer free. Please pick another.',
    trap: 'We could not process that. Please try again in a few seconds.',
    stale: 'This page expired. Please pick your time again.',
    limit: 'You already have calls booked with this email. Write to us if you need another.',
    busy: 'Lots of requests right now. Please try again in a minute.',
    google: 'We could not create the meeting. Write to us and we will book it by hand.',
  },
};

export const AGENDA = { es, en };
export type AgendaText = typeof es;
