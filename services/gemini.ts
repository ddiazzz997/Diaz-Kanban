
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { Task } from "../types";

// Fix: Initializing GoogleGenerativeAI with import.meta.env.VITE_GEMINI_API_KEY for Vite compatibility.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const createTaskDeclaration: FunctionDeclaration = {
  name: 'createTask',
  description: 'Crea una nueva tarea o protocolo en el tablero Kanban.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: 'El título corto, sintetizado y claro de la tarea.',
      },
      description: {
        type: SchemaType.STRING,
        description: 'Detalles operativos breves. No más de 3 líneas de texto.',
      },
      priority: {
        type: SchemaType.STRING,
        description: 'Nivel de prioridad: low, medium o high.',
        enum: ['low', 'medium', 'high'],
        format: 'enum',
      },
      column: {
        type: SchemaType.STRING,
        description: 'Columna de despliegue: pending, progress o done.',
        enum: ['pending', 'progress', 'done'],
        format: 'enum',
      },
    },
    required: ['title', 'priority', 'column'],
  },
};

export async function getAIChatResponse(messages: { role: string, content: string }[], tasks: Task[]) {
  const taskContext = tasks.map(t => ({
    titulo: t.title,
    descripcion: t.description,
    prioridad: t.priority,
    progreso: `${t.progress}%`,
    columna: t.column
  }));

  const systemInstruction = `
    Eres DÍAZ AI, un asistente de gestión personal de alto nivel para un tablero Kanban. 
    Tu objetivo es ayudar al usuario a gestionar sus tareas, detectar cuellos de botella y sugerir prioridades.
    
    REGLAS DE CREACIÓN DE TAREAS:
    - Para crear una tarea necesitas: Identificación (Título), Detalles Operativos, Prioridad y Despliegue (Columna).
    - El TÍTULO debe ser corto, sintetizado y extremadamente claro.
    - Los DETALLES OPERATIVOS deben ser pequeños, no más de 3 líneas. Sé conciso para no extender el panel.
    - Ya NO existe el campo "urgencia". No lo uses.
    
    CAPACIDAD ESPECIAL:
    - Puedes CREAR tareas directamente en el tablero usando la función 'createTask'.
    - Si el usuario te pide agregar, crear o iniciar una tarea, DEBES llamar a 'createTask' con los parámetros adecuados siguiendo las reglas de brevedad anteriores.
    
    ESTADO ACTUAL DEL TABLERO:
    ${JSON.stringify(taskContext, null, 2)}

    REGLAS GENERALES:
    - Responde de forma profesional, tecnológica y concisa en español.
    - Utiliza emojis relacionados con tecnología o productividad.
  `;

  try {
    if (!genAI) {
      return { text: "Error de configuración: API Key de Gemini no encontrada.", functionCalls: undefined };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      systemInstruction: systemInstruction,
      tools: [{ functionDeclarations: [createTaskDeclaration] }]
    });

    // History must start with user role and alternate
    const rawHistory = messages.slice(0, -1);
    let historyStart = 0;
    while (historyStart < rawHistory.length && rawHistory[historyStart].role === 'assistant') {
      historyStart++;
    }

    const context = rawHistory.slice(historyStart).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const chat = model.startChat({
      history: context
    });

    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const response = result.response;
    const text = response.text();
    const functionCalls: any[] = [];

    // Check for function calls in candidates
    const calls = response.functionCalls();
    if (calls && calls.length > 0) {
      calls.forEach(call => {
        functionCalls.push({ name: call.name, args: call.args });
      });
    }

    return {
      text: text || "Protocolo aceptado. Procesando solicitud...",
      functionCalls: functionCalls.length > 0 ? {
        name: functionCalls[0].name, // Adapt to previous interface expectation
        args: functionCalls[0].args
      } : undefined
    };

  } catch (error) {
    console.error("AI Error Full:", error);
    let errorMessage = "Error al conectar con la IA central.";
    if (error instanceof Error) {
      errorMessage += ` Detalle: ${error.message}`;
    } else {
      errorMessage += ` Detalle: ${JSON.stringify(error)}`;
    }
    return { text: errorMessage, functionCalls: undefined };
  }
}
