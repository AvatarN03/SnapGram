import {
  useDeleteSavedCount,
  useGetCurrentUser,
  useLikeCount,
  useSaveCount,
} from "@/lib/react-query/queryAndMutation";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import Loader from "./Loader";

type PostStatsProps = {
  post?: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const likesList = post?.likes.map((user: Models.Document) => user.$id);

  const [likes, setLikes] = useState<string[]>(likesList);
  console.log(likes);
  
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikeCount();
  const { mutate: savePost, isPending: isSavePost } = useSaveCount();
  const { mutate: deleteSavePost, isPending: isDeleteSaved } =
    useDeleteSavedCount();

  const { data: currentUser } = useGetCurrentUser();

  const savedPostRecord = currentUser?.save.find(
    (record: Models.Document) => record.post.$id === post?.$id
  );

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser]);

  const handleLike = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();

    let likesArray = [...likes];

    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((Id) => Id !== userId);
    } else {
      likesArray.push(userId);
    }

    setLikes(likesArray);
    likePost({ postId: post?.$id || "", likesArray });
  };

  const handleSave = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();
    console.log("hii2");

    if (savedPostRecord) {
      setIsSaved(false);
      console.log("hii3");
      console.log(savedPostRecord.$id);

      return deleteSavePost({ savedRecordId: savedPostRecord.$id });
    }

    savePost({postId: post?.$id || "", userId: userId });
    console.log("hii4");
    setIsSaved(true);
  };

  return (
    <div className="flex justify-between z-20 items-center">
      <div className="flex gap-2 mr-3">
        <img
          src={`${
            checkIsLiked(likes, userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }`}
          alt="like"
          width={20}
          height={20}
          onClick={(e) => handleLike(e)}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>
      <div className="flex gap-2 ">
        {isDeleteSaved || isSavePost ? <Loader/>:(
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="like"
            width={20}
            height={20}
            onClick={(e) => {
              handleSave(e);
            }}
            className="cursor-pointer"
          />
        ) }
      </div>
    </div>
  );
};

export default PostStats;
