// El canal canary de React expone `ViewTransition` (usado en Fase 7 para las
// transiciones de ruta nativas y el indicador de nav). El runtime lo trae el
// React compilado que sirve el App Router; aquí solo cargamos sus tipos.
// Referencia de tipos pura: NUNCA se emite como import en runtime (el módulo
// `react/canary` "no existe" en tiempo de ejecución).
/// <reference types="react/canary" />

export {};
