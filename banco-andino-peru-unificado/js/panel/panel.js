import { sql } from '../config/neon-config.js';
import { exigirSesion } from '../auth/auth.js';
import { pintarNav, esc, fmtMonto, fmtFecha, mostrarMensaje } from '../utils/ui.js';

const usuario = exigirSesion();

if (usuario.rol === 'cliente') window.location.href = 'registro.html';
pintarNav(usuario);

function verificarHorarioEmpleado(user) {
  if (user.rol === 'admin' || user.email === 'admin@correo.com') {
    return true;
  }

  const horaActual = new Date().getHours();

  if (user.email === 'empleado1@correo.com') {
    return horaActual >= 8 && horaActual < 16;
  }

  if (user.email === 'empleado2@correo.com') {
    return horaActual >= 16 && horaActual < 24;
  }

  if (user.email === 'empleado3@correo.com') {
    return horaActual >= 0 && horaActual < 8;
  }

  return false;
}

const f = document.getElementById('formPanel');
const campos = ['nombres','apellidos','dni','telefono','tipo_cuenta','moneda','monto_inicial','estado'];
let registros = [];

export const listarTodos = () => sql`
  SELECT s.*, u.nombre AS cliente FROM solicitudes_apertura_cuenta s
  LEFT JOIN usuarios u ON u.id = s.id_usuario ORDER BY s.fecha_registro DESC;`;

export async function crearRegistro(d) {
  const codigo = 'COD-' + Date.now().toString().slice(-8);
  await sql`
    INSERT INTO solicitudes_apertura_cuenta
      (codigo_seguimiento, nombres, apellidos, dni, telefono, tipo_cuenta, moneda, monto_inicial, estado)
    VALUES (\({codigo},\){d.nombres},\({d.apellidos},\){d.dni},\({d.telefono},\){d.tipo_cuenta},\({d.moneda},\){d.monto_inicial},${d.estado});`;
  return codigo;
}

export const actualizarComoPanel = (id, d) => sql`
  UPDATE solicitudes_apertura_cuenta
  SET nombres = \({d.nombres}, apellidos =\){d.apellidos}, dni = \({d.dni}, telefono =\){d.telefono},
      tipo_cuenta = \({d.tipo_cuenta}, moneda =\){d.moneda}, monto_inicial = \({d.monto_inicial}, estado =\){d.estado}
  WHERE id = ${id};`;

export const eliminarRegistro = id => sql`DELETE FROM solicitudes_apertura_cuenta WHERE id = ${id};`;

function pintar(lista) {
  document.getElementById('total').textContent = lista.length + ' registros';
  document.getElementById('cuerpo').innerHTML = lista.map(r => `
