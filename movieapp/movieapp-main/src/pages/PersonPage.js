import React from 'react'
import { useParams } from 'react-router-dom'
import useFetchDetails from '../hooks/useFetchDetails'
import { useSelector } from 'react-redux'
import Card from '../components/Card'

const PersonPage = () => {
  const params = useParams()
  const imageURL = useSelector(state => state.movieoData.imageURL)
  const { data: person } = useFetchDetails(`/person/${params.id}`)
  const { data: movieCredits } = useFetchDetails(`/person/${params.id}/movie_credits`)

  if (!person || !movieCredits) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-red-500'></div>
      </div>
    )
  }

  return (
    <div className='py-16'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col md:flex-row gap-8'>
          <div className='w-full md:w-1/3 lg:w-1/4'>
            <img
              src={imageURL + person.profile_path}
              alt={person.name}
              className='w-full rounded-lg shadow-lg'
            />
            <div className='mt-4 space-y-2'>
              <h2 className='text-2xl font-bold'>{person.name}</h2>
              {person.birthday && (
                <p className='text-neutral-400'>
                  Born: {new Date(person.birthday).toLocaleDateString()}
                  {person.place_of_birth && ` in ${person.place_of_birth}`}
                </p>
              )}
              {person.known_for_department && (
                <p className='text-neutral-400'>Known for: {person.known_for_department}</p>
              )}
            </div>
            {person.biography && (
              <div className='mt-6'>
                <h3 className='text-xl font-semibold mb-2'>Biography</h3>
                <p className='text-neutral-300'>{person.biography}</p>
              </div>
            )}
          </div>

          <div className='w-full md:w-2/3 lg:w-3/4'>
            <h3 className='text-xl font-semibold mb-4'>Movies & TV Shows</h3>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4'>
              {movieCredits.cast?.sort((a, b) => b.vote_count - a.vote_count).map((movie) => (
                <Card 
                  key={movie.id} 
                  data={movie} 
                  media_type={movie.media_type || 'movie'}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonPage
