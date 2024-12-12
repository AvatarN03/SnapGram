import  { Databases, Avatars, Storage, Client, Account } from "appwrite";

export const appwriteConfig = {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    url:import.meta.env.VITE_APPWRITE_URL,
    databasesId: import.meta.env.VITE_APPWRITE_DATABASES_ID,
    storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
    userCollectionsId:import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
    postCollectionId:import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID,
    saveCollectionId:import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
}

const client =  new Client();
client.setProject(appwriteConfig.projectId)
client.setEndpoint(appwriteConfig.url)

export const account =  new Account(client);
export const databases =  new Databases(client);
export const storage =  new Storage(client);
export const avatars =  new Avatars(client);
