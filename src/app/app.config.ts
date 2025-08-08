import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { PrivateKey } from '@hashgraph/sdk';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Assuming you're using @angular/fire/storage, if not, adjust import
import { PinataSDK } from "pinata";

import { routes } from './app.routes';

export const TOKENID = '0.0.6530688';

export const TOPICID = '0.0.6531419';


export const INFURA_API_KEY = '';

export const ADDRESS: string = '';

export const ACCOUNT_ID: string = '';

export const PRIVATE_KEY: string = '';

export const TREASURYACCOUNT = '0.0.6501023';

export const TREASURYKEY = PrivateKey.generateECDSA();

export const EVMADDRESS = '';

export const SUPPLYKEY = PrivateKey.generateECDSA();

export const PROJECT_ID = '';


// TODO: Replace with your project's actual Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "mdqbids.firebaseapp.com",
  projectId: "mdqbids",
  storageBucket: "",
  messagingSenderId: "231906005870",
  appId: "1:231906005870:web:f1e7060a6bc66f31d2677f",
  measurementId: "G-SLPJZCHY7G"
};

export const pinata = new PinataSDK({
  pinataJwt: "",
  pinataGateway: ""
});

export const app = initializeApp(firebaseConfig); // Initialize Firebase app here

export const firestore = getFirestore(app); // Get Firestore instance using the initialized app
export const storage = getStorage(app); // Get Storage instance using the initialized app

export const environment = {
  production: false,

  HEDERA_PRIVATE_KEY: '',

  HEDERA_ACCOUNT_ID: '',

  HEDERA_PUBLIC_KEY: '',

  ACCOUNT: ''
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
  ]
};

