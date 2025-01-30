// Declaración de variables
let expresion = ""; // Expresión matemática como cadena
let resultadoPrevio = false; // Indica si el último cálculo generó un resultado
let ultimoResultado = "0"; // Almacena el último resultado calculado

// Función para manejar la entrada de números y operadores
function agregarEntrada(entrada) {
  if (resultadoPrevio && entrada !== "ANS") {
    if (["+", "-", "*", "/", "^"].includes(entrada)) {
      // Si es un operador, mantenemos la expresión actual (que es el resultado).
      resultadoPrevio = false;
    } else {
      // Si es un número u otro carácter, reiniciamos la expresión.
      expresion = "";
    }
  }

  if (entrada === "ANS") {
    expresion += ultimoResultado;
  } else {
    expresion += entrada;
  }

  resultadoPrevio = false;
  refrescar();
}

// Función que resetea la calculadora
function darC() {
  expresion = "";
  resultadoPrevio = false;
  refrescar();
}

// Función para evaluar la expresión
function esIgual() {
  try {
    const tokens = tokenizarExpresion(expresion);
    const arbol = construirArbol(tokens);
    const resultado = resolverArbol(arbol);

    // Si todo va bien, actualizamos el último resultado.
    ultimoResultado = resultado.toString();
    expresion = ultimoResultado;
    resultadoPrevio = true;
    refrescar();
  } catch (error) {
    // Si hay error, mostramos "Error" pero no pisamos el último resultado válido.
    expresion = "Error";
    refrescar();
    resultadoPrevio = true;
  }
}

/**
 * Función para tokenizar la expresión.
 * Se asegura de unir el signo '-' a un número cuando corresponde
 * (p.ej. "-1" en lugar de separar '-' y '1').
 *
 * Ejemplo: "32-33" -> ["32", "-", "33"]
 *          "-1+23" -> ["-1", "+", "23"]
 *          "(-2)*3" -> ["(", "-2", ")", "*", "3"]
 */
function tokenizarExpresion(exp) {
  // Primero, separamos en tokens usando dígitos, punto decimal y operadores.
  const rawTokens = exp.match(/\d+(\.\d+)?|[\+\-\*\/\^\(\)]/g) || [];

  // Post-proceso para unir un signo '-' que sea verdaderamente un número negativo.
  const tokens = [];
  for (let i = 0; i < rawTokens.length; i++) {
    let token = rawTokens[i];

    // Si encontramos un "-" suelto, hay que revisar si es un número negativo
    // (caso: posición 0, o precedido de un operador o '(' ) y lo siguiente es un número.
    if (
      token === "-" &&
      (i === 0 || // Está al inicio
        ["+", "-", "*", "/", "^", "("].includes(tokens[tokens.length - 1])) &&
      // Verificamos que exista un siguiente token y sea número
      i + 1 < rawTokens.length &&
      !isNaN(rawTokens[i + 1])
    ) {
      // Unimos '-' con el siguiente token numérico.
      token = "-" + rawTokens[++i];
    }

    tokens.push(token);
  }

  return tokens;
}

// Clase para representar un nodo del árbol de expresiones
class Nodo {
  constructor(valor, izquierdo = null, derecho = null) {
    this.valor = valor;
    this.izquierdo = izquierdo;
    this.derecho = derecho;
  }
}

// Función para construir el árbol de expresiones (Shunting Yard + construcción)
function construirArbol(tokens) {
  const operadores = [];
  const operandos = [];

  const precedencia = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };

  const aplicarOperador = () => {
    const operador = operadores.pop();
    const derecho = operandos.pop();
    const izquierdo = operandos.pop();
    operandos.push(new Nodo(operador, izquierdo, derecho));
  };

  for (const token of tokens) {
    if (!isNaN(token)) {
      // Es un número
      operandos.push(new Nodo(parseFloat(token)));
    } else if (token === "(") {
      operadores.push(token);
    } else if (token === ")") {
      // Desapilar hasta "("
      while (operadores.length && operadores[operadores.length - 1] !== "(") {
        aplicarOperador();
      }
      operadores.pop(); // Quitar el "("
    } else {
      // Operador
      while (
        operadores.length &&
        operadores[operadores.length - 1] !== "(" &&
        precedencia[operadores[operadores.length - 1]] >= precedencia[token]
      ) {
        aplicarOperador();
      }
      operadores.push(token);
    }
  }

  // Aplicar operadores restantes
  while (operadores.length) {
    aplicarOperador();
  }

  // Devuelve la raíz del árbol
  return operandos.pop();
}

// Función para resolver el árbol de expresiones (recorrido recursivo)
function resolverArbol(nodo) {
  // Si es una hoja, es un número
  if (!nodo.izquierdo && !nodo.derecho) {
    return nodo.valor;
  }

  const izquierdo = resolverArbol(nodo.izquierdo);
  const derecho = resolverArbol(nodo.derecho);

  switch (nodo.valor) {
    case "+":
      return izquierdo + derecho;
    case "-":
      return izquierdo - derecho;
    case "*":
      return izquierdo * derecho;
    case "/":
      return izquierdo / derecho;
    case "^":
      return Math.pow(izquierdo, derecho);
    default:
      throw new Error(`Operador desconocido: ${nodo.valor}`);
  }
}

// Función para refrescar el display
function refrescar() {
  document.getElementById("valor_numero").value = expresion || "0";
}

// Asociar eventos a los botones
document.addEventListener("DOMContentLoaded", () => {
  const botones = document.querySelectorAll("input[type='button']");
  botones.forEach((boton) => {
    const valor = boton.value;
    boton.addEventListener("click", () => {
      if (valor === "=") {
        esIgual();
      } else if (valor === "C") {
        darC();
      } else if (valor === "ANS") {
        agregarEntrada("ANS");
      } else {
        agregarEntrada(valor);
      }
    });
  });

  // Evento para capturar teclas
  document.addEventListener("keydown", (event) => {
    const tecla = event.key;

    if (
      !isNaN(tecla) ||
      ["+", "-", "*", "/", "^", ".", "(", ")"].includes(tecla)
    ) {
      agregarEntrada(tecla);
    } else if (tecla === "Enter") {
      esIgual();
    } else if (tecla === "Backspace") {
      expresion = expresion.slice(0, -1);
      refrescar();
    } else if (tecla.toLowerCase() === "c") {
      darC();
    } else if (tecla.toLowerCase() === "a") {
      agregarEntrada("ANS");
    }
  });

  // Agregar evento para pegar (Ctrl+V)
  document.addEventListener("paste", (event) => {
    event.preventDefault();
    const textoCopiado = event.clipboardData.getData("text");

    // Validar que el texto pegado solo contenga caracteres válidos
    const caracteresValidos = /^[0-9+\-*/().\s^]+$/;
    if (caracteresValidos.test(textoCopiado)) {
      expresion = textoCopiado.replace(/\s+/g, ""); // Eliminar espacios
      refrescar();
    }
  });
});
