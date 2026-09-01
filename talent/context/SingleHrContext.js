'use client';

import { createContext, useContext } from 'react';

export const SingleHrContext = createContext();
export const useSingleHrContext = () => useContext(SingleHrContext);
