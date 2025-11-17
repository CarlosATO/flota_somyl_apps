// File: flota_app/lib/DriverContext.js
import React, { createContext, useState, useContext } from 'react';

const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [accionBotón, setAccionBotón] = useState(null); 
  
  // Nueva variable para guardar la función que debe ejecutarse
  const [onMainAction, setOnMainAction] = useState(() => () => {});

  const seleccionarOrden = (orden, accion) => {
    setOrdenSeleccionada(orden);
    setAccionBotón(accion);
  };

  const limpiarSeleccion = () => {
    setOrdenSeleccionada(null);
    setAccionBotón(null);
  };

  // Esta función permite que HomeScreen "registre" su función de acción
  const registrarAccion = (fn) => {
    setOnMainAction(() => fn);
  };

  return (
    <DriverContext.Provider value={{ 
      ordenSeleccionada, 
      accionBotón, 
      seleccionarOrden, 
      limpiarSeleccion,
      onMainAction,    // Exponemos la función guardada
      registrarAccion  // Exponemos el registro
    }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => useContext(DriverContext);