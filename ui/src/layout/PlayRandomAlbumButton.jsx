import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useDataProvider, useTranslate } from 'react-admin'
import { IconButton, Tooltip, makeStyles } from '@material-ui/core'
import AlbumIcon from '@material-ui/icons/Album'
import { clearQueue, playTracks } from '../actions'

const useStyles = makeStyles((theme) => ({
  button: {
    color: theme.palette.text.secondary,
  },
}))

const PlayRandomAlbumButton = () => {
  const dispatch = useDispatch()
  const dataProvider = useDataProvider()
  const translate = useTranslate()
  const classes = useStyles()

  const handlePlayRandomAlbum = useCallback(async () => {
    try {
      // Get a random album
      const randomAlbumResponse = await dataProvider.getList('album', {
        pagination: { page: 1, perPage: 1 },
        sort: { field: 'random', order: 'ASC' },
        filter: {},
      })
      
      if (randomAlbumResponse.data.length > 0) {
        const randomAlbum = randomAlbumResponse.data[0]
        // Get songs from the random album
        const songsResponse = await dataProvider.getList('song', {
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'track_number', order: 'ASC' },
          filter: { album_id: randomAlbum.id },
        })
        
        if (songsResponse.data.length > 0) {
          // Clear current queue and play the songs from the random album
          dispatch(clearQueue())
          const songs = songsResponse.data.reduce((acc, song) => {
            acc[song.id] = song
            return acc
          }, {})
          dispatch(playTracks(songs, songsResponse.data.map(s => s.id)))
        }
      }
    } catch (error) {
      console.error('Error loading random album:', error)
    }
  }, [dispatch, dataProvider])

  return (
    <Tooltip title={translate('resources.album.actions.playRandomAlbum')}>
      <IconButton
        className={classes.button}
        onClick={handlePlayRandomAlbum}
      >
        <AlbumIcon />
      </IconButton>
    </Tooltip>
  )
}

export default PlayRandomAlbumButton
