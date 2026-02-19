
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Task } from "../types";

// Fix: Initializing GoogleGenAI with import.meta.env.VITE_GEMINI_API_KEY for Vite compatibility.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const createTaskDeclaration: FunctionDeclaration = {
  name: 'createTask',
  parameters: {
    type: Type.OBJECT,
    description: 'Crea una nueva tarea o protocolo en el tablero Kanban.',
    properties: {
      title: {
        type: Type.STRING,
        description: 'El título corto, sintetizado y claro de la tarea.',
      },
      description: {
        type: Type.STRING,
        description: 'Detalles operativos breves. No más de 3 líneas de texto.',
      },
      priority: {
        type: Type.STRING,
        description: 'Nivel de prioridad: low, medium o high.',
        enum: ['low', 'medium', 'high'],
      },
      column: {
        type: Type.STRING,
        description: 'Columna de despliegue: pending, progress o done.',
        enum: ['pending', 'progress', 'done'],
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
    if (!ai) {
      return { text: "Error de configuración: API Key de Gemini no encontrada.", functionCalls: undefined };
    }
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ functionDeclarations: [createTaskDeclaration] }],
      },
    });

    return {
      text: response.text || (response.functionCalls ? "Protocolo aceptado. Tarea integrada en el sistema visual." : "Lo siento, mi conexión neuronal ha fallado."),
      functionCalls: response.functionCalls
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
