import PostFrom from '@/components/forms/PostFrom'
import Loader from '@/components/shared/Loader';
import { useGetPostById } from '@/lib/react-query/queryAndMutation';
import { useParams } from 'react-router-dom';

const EditPost = () => {

  const {id} = useParams();

  const {data :post , isPending } = useGetPostById(id || "");

  if(isPending) return <Loader/>

  return (
      <div className="flex flex-1">
        <div className="common-container">
          <div className="max-w-5xl flex-start w-full justify-start gap-3">
            <img src="/assets/icons/add-post.svg" alt="add-post" />
            <h2 className='h3-bold d:h2-bold text-left w-full'>Create Post</h2>
          </div>
          <PostFrom action="Update" post={post} />
        </div>
      </div>  
  )
}

export default EditPost;