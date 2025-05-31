import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/Card'

const SearchPage = () => {
  const location = useLocation()
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [searchType, setSearchType] = useState('multi')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const query = location?.search?.slice(3)

  const fetchMoviesForActor = async (personId) => {
    try {
      const response = await axios.get(`person/${personId}/movie_credits`)
      return response.data.cast
    } catch (error) {
      console.log('error fetching movies for actor:', error)
      return []
    }
  }

  const fetchData = async () => {
    if (!query) return
    
    setLoading(true)
    try {
      if (searchType === 'actor') {
        // First search for the actor
        const actorResponse = await axios.get('search/person', {
          params: {
            query: query,
            page: page
          }
        })
        
        // For each actor found, get their movies
        const actorsWithMovies = await Promise.all(
          actorResponse.data.results.map(async (actor) => {
            const movies = await fetchMoviesForActor(actor.id)
            return {
              ...actor,
              movies: movies
            }
          })
        )
        
        if (page === 1) {
          setData(actorsWithMovies)
        } else {
          setData(prev => [...prev, ...actorsWithMovies])
        }
      } else {
        const response = await axios.get(`search/multi`, {
          params: {
            query: query,
            page: page
          }
        })
        if (page === 1) {
          setData(response.data.results)
        } else {
          setData(prev => [...prev, ...response.data.results])
        }
      }
    } catch (error) {
      console.log('error', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (query) {
      setPage(1)
      setData([])
      fetchData()
    }
  }, [location?.search, searchType])

  const handleScroll = () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      setPage(prev => prev + 1)
    }
  }

  useEffect(() => {
    if (query && page > 1) {
      fetchData()
    }
  }, [page])

  const renderResults = () => {
    if (searchType === 'actor') {
      return (
        <div className='space-y-8'>
          {data.map((actor) => (
            <div key={actor.id} className='bg-neutral-900 p-4 rounded-lg'>
              <div className='flex gap-4 items-start mb-4'>
                <img
                  src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                  alt={actor.name}
                  className='w-24 h-24 rounded-full object-cover'
                />
                <div>
                  <h3 className='text-xl font-bold mb-2'>{actor.name}</h3>
                  <p className='text-neutral-400'>{actor.known_for_department}</p>
                </div>
              </div>
              <h4 className='text-lg font-semibold mb-3'>Movies & TV Shows</h4>
              <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4'>
                {actor.movies?.slice(0, 6).map((movie) => (
                  <Card 
                    key={movie.id + "_" + actor.id} 
                    data={movie} 
                    media_type={movie.media_type || 'movie'} 
                  />
                ))}
              </div>
              <button 
                className='mt-4 text-red-500 hover:text-red-400 font-semibold'
                onClick={() => navigate(`/person/${actor.id}`)}
              >
                View full profile {actor.movies?.length > 6 ? `and ${actor.movies.length - 6} more titles` : ''}
              </button>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className='grid grid-cols-[repeat(auto-fit,230px)] gap-6 justify-center lg:justify-start'>
        {data.map((searchData) => (
          <Card 
            data={searchData} 
            key={searchData.id + "search"} 
            media_type={searchData.media_type} 
          />
        ))}
      </div>
    )
  }

  return (
    <div className='py-16'>
      <div className='lg:hidden my-2 mx-1 sticky top-[70px] z-30'>
        <input 
          type='text'
          placeholder='Search here...'
          onChange={(e) => navigate(`/search?q=${e.target.value}`)}
          value={query?.split("%20")?.join(" ")}
          className='px-4 py-1 text-lg w-full bg-white rounded-full text-neutral-900'
        />
      </div>
      
      <div className='container mx-auto'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-4 mb-6'>
          <h3 className='capitalize text-lg lg:text-xl font-semibold'>Search Results</h3>
          <div className='flex items-center gap-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input 
                type='radio'
                name='searchType'
                value='multi'
                checked={searchType === 'multi'}
                onChange={(e) => setSearchType(e.target.value)}
                className='accent-red-500'
              />
              <span>Movies & TV</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input 
                type='radio'
                name='searchType'
                value='actor'
                checked={searchType === 'actor'}
                onChange={(e) => setSearchType(e.target.value)}
                className='accent-red-500'
              />
              <span>Actors</span>
            </label>
          </div>
        </div>

        {loading && page === 1 ? (
          <div className='flex justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-red-500'></div>
          </div>
        ) : (
          renderResults()
        )}
        
        {loading && page > 1 && (
          <div className='flex justify-center mt-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-red-500'></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage
