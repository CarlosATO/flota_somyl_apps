// File: flota_app/lib/DriverContext.js
import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [accionBotón, setAccionBotón] = useState(null); 
  const [onMainAction, setOnMainAction] = useState(() => () => {});

  // Usamos useCallback para que estas funciones sean ESTABLES (no cambien en cada render)
  const seleccionarOrden = useCallback((orden, accion) => {
    setOrdenSeleccionada(orden);
    setAccionBotón(accion);
  }, []);

  const limpiarSeleccion = useCallback(() => {
    setOrdenSeleccionada(null);
    setAccionBotón(null);
  }, []);

  const registrarAccion = useCallback((fn) => {
    // Solo actualizamos si la función es diferente para evitar bucles
    setOnMainAction(() => fn);
  }, []);

  // Empaquetamos los valores en un objeto memorizado
  const value = useMemo(() => ({
    ordenSeleccionada, 
    accionBotón, 
    seleccionarOrden, 
    limpiarSeleccion,
    onMainAction,
    registrarAccion
  }), [ordenSeleccionada, accionBotón, onMainAction, seleccionarOrden, limpiarSeleccion, registrarAccion]);

  return (
    <DriverContext.Provider value={value}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => useContext(DriverContext);