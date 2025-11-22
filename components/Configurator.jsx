"use client";

import { createContext, useContext, useState } from "react";

const ConfiguratorContext = createContext();

export const ConfiguratorProvider = ({ children }) => {
  const [tableWidth, setTableWidth] = useState(100);
  const [tableLength, setTableLength] = useState(100);
  const [tableHeight, setTableHeight] = useState(100); 
  const [tablecolor, setTablecolor] = useState("");
    const [Material, setMaterial] = useState(0);

  return (
    <ConfiguratorContext.Provider
      value={{
        tableWidth,
        setTableWidth,
        tableLength,
        setTableLength,
        tableHeight,
        setTableHeight,
         Material,
        setMaterial,
        tablecolor,
        setTablecolor
        
      }}

      
    >
      {children}
    </ConfiguratorContext.Provider>
  );
  
};

export const useConfigurator = () => {
  return useContext(ConfiguratorContext);
};