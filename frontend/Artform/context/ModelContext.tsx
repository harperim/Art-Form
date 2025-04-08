// context/ModelContext.tsx
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { ModelWithThumbnail } from '~/types/model';
import { fetchModelInfo } from '~/services/modelService';
import { fetchPresignedImageUrl, getValidUrl } from '~/services/imageService';

type ModelContextType = {
  selectedModel: ModelWithThumbnail | null;
  setSelectedModel: (model: ModelWithThumbnail | null) => void;
  refreshSelectedModel: () => Promise<ModelWithThumbnail | null>;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const [selectedModel, setSelectedModel] = useState<ModelWithThumbnail | null>(null);

  const refreshSelectedModel = useCallback(async () => {
    if (!selectedModel) return null;

    const updated = await fetchModelInfo(selectedModel.model.modelId);
    const thumbnailUrl = getValidUrl(await fetchPresignedImageUrl(updated.model.thumbnailId));

    const newModel = {
      ...updated,
      thumbnailUrl,
    };

    // 이전 값과 완전히 같다면 굳이 갱신 안 함
    const isSame =
      JSON.stringify(newModel.model) === JSON.stringify(selectedModel.model) &&
      newModel.thumbnailUrl === selectedModel.thumbnailUrl;

    if (!isSame) {
      setSelectedModel(newModel);
    }

    return newModel;
  }, [selectedModel]);

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel, refreshSelectedModel }}>
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
