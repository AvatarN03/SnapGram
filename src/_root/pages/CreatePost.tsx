import PostFrom from '@/components/forms/PostFrom'
import React from 'react'

const CreatePost = () => {
  return (
      <div className="flex flex-1">
        <div className="common-container">
          <div className="max-w-5xl flex-start w-full justify-start gap-3">
            <img src="/assets/icons/add-post.svg" alt="add-post" />
            <h2 className='h3-bold d:h2-bold text-left w-full'>Create Post</h2>
          </div>
          <PostFrom action='Create'/>
        </div>
      </div>  
  )
}

export default CreatePost