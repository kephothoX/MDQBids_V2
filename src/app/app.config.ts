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


export const INFURA_API_KEY = 'e41173f3b4434520911a7b5320c1de24';

export const ADDRESS: string = '0xef8CcBB6D8c4DDD7B042BDeEd03BB5eC4e5f6134';

export const ACCOUNT_ID: string = '0.0.3745354';

export const PRIVATE_KEY: string = '302e020100300506032b657004220420d083dcf51d7c9d8e5a37225bf75133af0fff4a1156278a2d5de35855e1fc1c0d';

export const TREASURYACCOUNT = '0.0.6501023';

export const TREASURYKEY = PrivateKey.generateECDSA();

export const EVMADDRESS = '0x2cbc596e8c548db6a8f1afa17a8655d71518a1a6';

export const SUPPLYKEY = PrivateKey.generateECDSA();

export const PROJECT_ID = '37814089401265afcb684f8be561a228';


// TODO: Replace with your project's actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9i4KpFzGkRGyBdH7h1XwVzlHht7nTpvI",
  authDomain: "mdqbids.firebaseapp.com",
  projectId: "mdqbids",
  storageBucket: "mdqbids.firebasestorage.app",
  messagingSenderId: "231906005870",
  appId: "1:231906005870:web:f1e7060a6bc66f31d2677f",
  measurementId: "G-SLPJZCHY7G"
};

export const pinata = new PinataSDK({
  pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmYmQxODlhMS00OTIwLTQ4MGItYWU1ZS1hZDUwMTMyOWNmODUiLCJlbWFpbCI6ImtlcGhvdGhvbWVkaWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIxYzM1ZGZhM2NhZThkZmVkMzQ2Iiwic2NvcGVkS2V5U2VjcmV0IjoiZWQ4MTFkM2ZhMzdiNjI5ZWVkMDJlNWZhMGQ0ODFjMTI2OWJkNzQ3MDUyMGM4OThlODRlNzVmNDIzYTYxMDU2MCIsImV4cCI6MTc2MDk5NTY1OH0.ir293WSX6PMKEklTZBzgt7_6PY7saE--TuTNXprvOfI",
  pinataGateway: "amaranth-past-ladybug-860.mypinata.cloud"
});

export const app = initializeApp(firebaseConfig); // Initialize Firebase app here

export const firestore = getFirestore(app); // Get Firestore instance using the initialized app
export const storage = getStorage(app); // Get Storage instance using the initialized app

export const environment = {
  production: false,

  HEDERA_PRIVATE_KEY: '302e020100300506032b657004220420d083dcf51d7c9d8e5a37225bf75133af0fff4a1156278a2d5de35855e1fc1c0d',

  HEDERA_ACCOUNT_ID: '0.0.3745354',

  HEDERA_PUBLIC_KEY: '302a300506032b657003210040bef9382f206cade8dcb7118bbe108bfb1c187198e1b5d2cd182f7500e995f0',

  ACCOUNT: '0xb13e866E1DCfAC18519F929539e19434aaB0a6CF'
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
  ]
};

