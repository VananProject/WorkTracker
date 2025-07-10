// Create a custom hook for managing selective refreshes
import { useState, useCallback } from 'react';

export const useSelectiveRefresh = () => {
  const [refreshKeys, setRefreshKeys] = useState({
    assignedTasks: 0,
    taskHistory: 0,
    notifications: 0
  });

  const refreshComponent = useCallback((componentName: keyof typeof refreshKeys) => {
    setRefreshKeys(prev => ({
      ...prev,
      [componentName]: prev[componentName] + 1
    }));
  }, []);

  const refreshMultiple = useCallback((components: (keyof typeof refreshKeys)[]) => {
    setRefreshKeys(prev => {
      const updated = { ...prev };
      components.forEach(component => {
        updated[component] = prev[component] + 1;
      });
      return updated;
    });
  }, []);

  return {
    refreshKeys,
    refreshComponent,
    refreshMultiple
  };
};
