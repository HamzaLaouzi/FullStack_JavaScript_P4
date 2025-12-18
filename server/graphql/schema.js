const {buildSchema} = require('graphql');

// esquema principal para definir tipos de datos, querys y mutations ---------------------------------------------------------------------------
const schema = buildSchema(`
  type User {
  id:ID!
  name:String!
  email:String!
  password:String!
  role: String!
  createdAt:String!
  }

  type Voluntariado {
  id:ID!
  date:String!
  title:String!
  description:String!
  autor:String!
  email:String!
  volunType:String!
  createdAt:String!
  }

  # Gestión de login
  type AuthPayload {
    token: String!
    userId: ID!
    role: String!
  }

  # Datos gráfico
  type StatsPayload {
  tipo: String!
  cantidad: Int!
  }

  # Input creacion
  input CreateUserInput {
    name:String!
    email:String!
    password:String!
    role: String
  }

  # Input actualizacion
  input UpdateUserInput {
    name:String
    email:String
    password:String
  }

  # Input creacion
  input CreateVoluntariadoInput {
    title:String!
    email:String!
    date:String!
    description:String!
    volunType:String!
    autor:String!
  }
  
  # Input actualizacion
  input UpdateVoluntariadoInput {
    title:String
    description:String
    autor:String
    email:String
    volunType:String
    date:String
  }

  type Query {
  # busca usuarios y devuelve array --------------------------
  usuarios: [User]

  # busca usuario por id y devuelve el usuario ---------------
  usuario(id: ID!): User

  # busca usuario por email y devuelve el usuario ------------
  usuarioPorEmail(email: String!): User

  # busca voluntariados y devuelve array ---------------------  
  voluntariados: [Voluntariado]

  # busca voluntariado por id y devuelve el voluntariado ------
  voluntariado(id: ID!): Voluntariado

  # busca voluntariado por tipo y devuelve array --------------
  voluntariadosPorTipo(tipo: String!): [Voluntariado]

  # busca voluntariado por autor y devuelve array -------------
  voluntariadosPorAutor(email: String!): [Voluntariado]

  # procesar datos gráfico
  estadisticasVoluntariados: [StatsPayload]
}

type Mutation {
  # autenticacion y login -------------------------------------
  login(email: String!, password: String!): AuthPayload

  # crear usuario y devuelve usuario creado -------------------
  crearUsuario(input: CreateUserInput!): User

  # editar usuario y devuelve usuario updated -----------------
  actualizarUsuario(id: ID!, input: UpdateUserInput): User

  # eliminar usuario y devuleve Uusario eliminado -------------
  eliminarUsuario(id: ID!): User

  # crear voluntariado y devuelve voluntariado creado ---------
  crearVoluntariado(input: CreateVoluntariadoInput!): Voluntariado

  # editar voluntariado y devuelve voluntariado updated -------
  actualizarVoluntariado(id: ID!, input: UpdateVoluntariadoInput): Voluntariado

  # eliminar voluntariado y devuelve voluntariado eliminado ---
  eliminarVoluntariado(id: ID!): Voluntariado
  }
`);

module.exports = schema;