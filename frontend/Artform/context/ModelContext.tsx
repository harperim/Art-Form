// context/ModelContext.tsx
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { ModelWithThumbnail } from '~/types/model';

type ModelContextType = {
  selectedModel: ModelWithThumbnail | null;
  setSelectedModel: (model: ModelWithThumbnail | null) => void;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const [selectedModel, setSelectedModel] = useState<ModelWithThumbnail | null>(null);
  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};
