import { INewPost, INewUser, IUpdatePost } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { log } from "console";

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw new Error();

    const avatarUrl = new URL(avatars.getInitials(user.name));

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });


    return newUser;

  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function saveUserToDB(user: {
  accountId:string;
  username?:string;
  email:string;
  name:string;
  imageUrl:URL;
}) {
  try {

    const newUser = await databases.createDocument(
        appwriteConfig.databasesId,
        appwriteConfig.userCollectionsId,
        ID.unique(),
        user,
    )

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}



export async function signInAccount(user:{
    email: string;
    password: string;
}){


    try {
        const session = await account.createEmailPasswordSession(user.email, user.password);

        return session;
        
    } catch (error) {
        console.log('error', error)
    }
}

export async function getCurrentUser(){
  try {
    const currentAccount = await account.get();

    if(!currentAccount) throw new Error;

    const currentUser = await databases.listDocuments(appwriteConfig.databasesId,
      appwriteConfig.userCollectionsId,
      [
        Query.equal('accountId', currentAccount.$id),
      ]
    )

    if(!currentUser) throw new Error;
    console.log(currentUser);
    

    return currentUser.documents[0];

  } catch (error) {
    console.log(error);
    
    
  }
}


export async function signOutAccount(){
  try {
    const session = await account.deleteSession('current');

    return session;
    
  } catch (error) {
    console.log(error);
    
    
  }
}
export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databasesId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}


export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}



export  function getFilePreview(fileId: string) {
  try {
    const fileUrl =  storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      'top',
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}


export async function getRecentPosts(){
  const posts = await databases.listDocuments(
    appwriteConfig.databasesId,
    appwriteConfig.postCollectionId,
    [
      Query.limit(10),
      Query.orderDesc('$createdAt'),
    ]
  )

  if(!posts) throw new Error;

  return posts;
}

export async function likePost( postId: string , likesArray: string[]){
  try {

    const updatePost = await databases.updateDocument(
      appwriteConfig.databasesId,
      appwriteConfig.postCollectionId,
      postId, 
      {
        likes: likesArray
      }
    )

    if(!updatePost) throw Error;

    return updatePost;
    
  } catch (error) {
    console.log(error);
    
    
  }
}



export async function savePost( postId: string , userId: string){
  try {

    const updatePost = await databases.createDocument(
      appwriteConfig.databasesId,
      appwriteConfig.saveCollectionId,
      ID.unique(), 
      {
        user: userId,
        post : postId
      }
    )

    if(!updatePost) throw Error;

    return updatePost;
    
  } catch (error) {
    console.log(error);
    
    
  }
}


export async function deleteSavedPost(savedRecordId: string){
  try {
    console.log(savedRecordId);
    
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databasesId,
      appwriteConfig.saveCollectionId,
      savedRecordId
      
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(postId:string){
  try {

    const fetchPost = await databases.getDocument(
      appwriteConfig.databasesId,
      appwriteConfig.postCollectionId,
      postId
    )

    if(!fetchPost) throw Error;

    return fetchPost;
    
  } catch (error) {
    console.log(error);
    
    
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileChanged = post.file.length > 0;
  try {

    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if(hasFileChanged){
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get file url
      const fileUrl = getFilePreview(uploadedFile.$id);


      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl , imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const updatePost = await databases.updateDocument(
      appwriteConfig.databasesId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatePost) {
      await deleteFile(post.imageId);
      throw Error;
    }

    return updatePost;
  } catch (error) {
    console.log(error);
  }
}


export async function deletePost(postId: string, imageId: string){
  try {
    if(!postId || !imageId) throw Error;

    await databases.deleteDocument(
      appwriteConfig.databasesId,
      appwriteConfig.postCollectionId,
      postId
    )

    return { status: "ok"}

  } catch (error) {
      
    console.log(error);
    
  }
}

export async function getUserPosts(userId: string) {
  
}


export async function getInfinitePosts({pageParam}: {pageParam: number}){
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)]


  if(pageParam){
    queries.push(Query.cursorAfter(pageParam.toString()))
  }

  try{

    const posts = await databases.listDocuments(
      appwriteConfig.databasesId,
      appwriteConfig.postCollectionId,
      queries
    )

    if(!posts) throw Error;

    return posts;

  }catch(error){
    console.log(error)
  }
}
export async function searchPosts(searchTerm: string){
   try{

    const posts = await databases.listDocuments(
      appwriteConfig.databasesId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    )

    if(!posts) throw Error;

    return posts;

  }catch(error){
    console.log(error)
  }
}