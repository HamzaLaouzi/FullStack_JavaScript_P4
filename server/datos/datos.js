// usuarios iniciales -----------------------------------------------------------------------------------------
const usuarios = [
  {
    name: 'Edu',
    email: 'edu@mail.com',
    password: '1234',
  },
  {
    name: 'Jose',
    email: 'jose@mail.com',
    password: '1234',
  }
];

// voluntariados iniciales -------------------------------------------------------------------------------------
const voluntariados = [
  {
    date: '01/10/2025',
    title: 'Limpiar casa',
    description: 'Ayuda limpiando una casa.',
    autor: 'Edu',
    email: 'edu@mail.com',
    volunType: 'Petición',
  },
  {
    date: '02/10/2025',
    title: 'Compra',
    description: 'Ayudar a hacer la compra a una persona mayor.',
    autor: 'Jose',
    email: 'jose@mail.com',
    volunType: 'Oferta',
  },
  {
    date: '02/10/2025',
    title: 'Desatasco',
    description: 'Ayudar a desatascar una tubería.',
    autor: 'Jose',
    email: 'jose@mail.com',
    volunType: 'Petición',
  }
];

// exportación ---------------------------------------------------------------------------------------------
module.exports = {
  usuarios,
  voluntariados,
};