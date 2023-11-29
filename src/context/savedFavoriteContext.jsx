import React, { createContext, useState } from 'react';
import Cookies from 'js-cookie';

function getFavoriteLocations() {
    const favoriteLocations = Cookies.get('favoriteLocations');
    return favoriteLocations ? JSON.parse(favoriteLocations) : [];
}

export const SavedFavoriteContext = createContext();

export function SavedFavoriteProvider({ children }) {
    const [savedFavorite, setSavedFavorite] = useState(getFavoriteLocations());

    const updateSavedFavorite = (newState) => {
        setSavedFavorite(newState);
    };

    return (
        <SavedFavoriteContext.Provider value={{ savedFavorite, updateSavedFavorite }}>
            {children}
        </SavedFavoriteContext.Provider>
    );
}

