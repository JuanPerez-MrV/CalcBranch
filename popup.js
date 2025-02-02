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
    if (!tokens.length) {
      throw new Error("Expresión vacía");
    }

    const arbol = construirArbol(tokens);
    const resultado = resolverArbol(arbol);

    if (isNaN(resultado) || !isFinite(resultado)) {
      throw new Error("Resultado inválido");
    }

    ultimoResultado = resultado.toString();
    expresion = ultimoResultado;
    resultadoPrevio = true;
    refrescar();
  } catch (error) {
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
  const rawTokens = exp.match(/\d+(\.\d+)?|[\+\-\*\/\^\(\)√π]|ANS/g) || [];
  const tokens = [];

  for (let i = 0; i < rawTokens.length; i++) {
    let token = rawTokens[i];

    if (token === "π") {
      tokens.push(Math.PI.toString());
      continue;
    }

    // Enhanced sqrt handling with proper nested expression support
    if (token === "√") {
      tokens.push("(");
      if (i + 1 < rawTokens.length) {
        const nextToken = rawTokens[++i];
        if (nextToken === "(") {
          let parenCount = 1;
          // Process nested expression token by token
          while (i + 1 < rawTokens.length && parenCount > 0) {
            token = rawTokens[++i];
            if (token === "(") {
              parenCount++;
              tokens.push(token);
            } else if (token === ")") {
              parenCount--;
              if (parenCount > 0) {
                tokens.push(token);
              }
            } else {
              tokens.push(token);
            }
          }
        } else {
          tokens.push(nextToken);
        }
      }
      tokens.push(")");
      tokens.push("^");
      tokens.push("0.5");
      continue;
    }

    // Handle negative numbers
    if (
      token === "-" &&
      (i === 0 ||
        ["+", "-", "*", "/", "^", "("].includes(tokens[tokens.length - 1])) &&
      i + 1 < rawTokens.length &&
      !isNaN(rawTokens[i + 1])
    ) {
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
      if (derecho === 0) throw new Error("División por cero");
      return izquierdo / derecho;
    case "^":
      // Validate square root operations
      if (derecho === 0.5) {
        if (izquierdo < 0) throw new Error("Raíz cuadrada de número negativo");
        return Math.sqrt(izquierdo);
      }
      return Math.pow(izquierdo, derecho);
    default:
      throw new Error(`Operador desconocido: ${nodo.valor}`);
  }
}

// Función para refrescar el display
function refrescar() {
  document.getElementById("valor_numero").value = expresion || "0";
}

// Action handlers object
const actionHandlers = {
  "=": () => esIgual(),
  C: () => darC(),
  ANS: () => agregarEntrada("ANS"),
  "√": () => agregarEntrada("√"),
  π: () => agregarEntrada("π"),
  default: (value) => agregarEntrada(value),
};

// Keyboard mapping
const keyboardMap = {
  Enter: "=",
  Backspace: "backspace",
  c: "C",
  a: "ANS",
  r: "√",
  p: "π",
};

// Event handlers
function initializeEventHandlers() {
  // Button clicks
  document.querySelectorAll("input[type='button']").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.value;
      (actionHandlers[value] || actionHandlers.default)(value);
    });
  });

  // Keyboard input
  document.addEventListener("keydown", (event) => {
    const key = event.key;

    // Handle mapped keys
    if (keyboardMap[key.toLowerCase()]) {
      event.preventDefault();
      if (key === "Backspace") {
        expresion = expresion.slice(0, -1);
        refrescar();
        return;
      }
      const mappedValue = keyboardMap[key.toLowerCase()];
      (actionHandlers[mappedValue] || actionHandlers.default)(mappedValue);
      return;
    }

    // Handle numbers and operators
    if (!isNaN(key) || ["+", "-", "*", "/", "^", ".", "(", ")"].includes(key)) {
      event.preventDefault();
      agregarEntrada(key);
    }
  });

  // Paste handler
  document.addEventListener("paste", (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");

    if (/^[0-9+\-*/().\s^√π]+$/.test(pastedText)) {
      expresion = pastedText.replace(/\s+/g, "");
      refrescar();
    }
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeEventHandlers);
