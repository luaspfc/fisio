import type { ScholarResult } from "@shared/scholar/types";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "scholar-finder-favorites-v1";
const DEFAULT_COLLECTIONS = ["Favoritos"];

interface FavoritesState {
  items: Record<string, ScholarResult>;
  /** collection name -> result ids */
  collections: Record<string, string[]>;
}

function loadState(): FavoritesState {
  if (typeof window === "undefined") return { items: {}, collections: { Favoritos: [] } };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: {}, collections: { Favoritos: [] } };
    const parsed = JSON.parse(raw) as FavoritesState;
    return {
      items: parsed.items ?? {},
      collections: parsed.collections ?? { Favoritos: [] },
    };
  } catch {
    return { items: {}, collections: { Favoritos: [] } };
  }
}

function saveState(state: FavoritesState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useFavorites() {
  const [state, setState] = useState<FavoritesState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const isFavorited = useCallback(
    (id: string) => Object.values(state.collections).some(ids => ids.includes(id)),
    [state.collections]
  );

  const collectionsOf = useCallback(
    (id: string) => Object.entries(state.collections).filter(([, ids]) => ids.includes(id)).map(([name]) => name),
    [state.collections]
  );

  const addToCollection = useCallback((result: ScholarResult, collection: string) => {
    setState(prev => {
      const existingIds = prev.collections[collection] ?? [];
      if (existingIds.includes(result.id)) return prev;
      return {
        items: { ...prev.items, [result.id]: result },
        collections: { ...prev.collections, [collection]: [...existingIds, result.id] },
      };
    });
  }, []);

  const removeFromCollection = useCallback((id: string, collection: string) => {
    setState(prev => {
      const nextIds = (prev.collections[collection] ?? []).filter(existingId => existingId !== id);
      const nextCollections = { ...prev.collections, [collection]: nextIds };
      const stillReferenced = Object.values(nextCollections).some(ids => ids.includes(id));
      const nextItems = stillReferenced ? prev.items : Object.fromEntries(Object.entries(prev.items).filter(([itemId]) => itemId !== id));
      return { items: nextItems, collections: nextCollections };
    });
  }, []);

  const toggleFavorite = useCallback(
    (result: ScholarResult) => {
      if (isFavorited(result.id)) {
        for (const name of collectionsOf(result.id)) removeFromCollection(result.id, name);
      } else {
        addToCollection(result, "Favoritos");
      }
    },
    [isFavorited, collectionsOf, addToCollection, removeFromCollection]
  );

  const createCollection = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState(prev => (prev.collections[trimmed] ? prev : { ...prev, collections: { ...prev.collections, [trimmed]: [] } }));
  }, []);

  const deleteCollection = useCallback((name: string) => {
    if (DEFAULT_COLLECTIONS.includes(name)) return;
    setState(prev => {
      const { [name]: _removed, ...rest } = prev.collections;
      const referencedIds = new Set(Object.values(rest).flat());
      const items = Object.fromEntries(Object.entries(prev.items).filter(([id]) => referencedIds.has(id)));
      return { items, collections: rest };
    });
  }, []);

  const resultsIn = useCallback(
    (collection: string) => (state.collections[collection] ?? []).map(id => state.items[id]).filter(Boolean),
    [state.collections, state.items]
  );

  return {
    collectionNames: Object.keys(state.collections),
    isFavorited,
    collectionsOf,
    toggleFavorite,
    addToCollection,
    removeFromCollection,
    createCollection,
    deleteCollection,
    resultsIn,
    allFavorites: Object.values(state.items),
  };
}
