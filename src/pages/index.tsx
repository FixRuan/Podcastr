import { GetStaticProps } from 'next'
import { api } from '../services/api'
import Link from 'next/link'
import Image from 'next/image'
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { Convert } from '../utils/convertDurationToTimeString'
import styles from './home.module.scss'
import { usePlayer } from '../contexts/PlayerContext'


type Episodes = {
  id: string;
  titles: string; 
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string; 
  url: string;
}

type HomeProps = {
  latestEpisodes: Array<Episodes>,
  allEpisodes: Array<Episodes>,
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  const { PlayList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes]

  return (
    <div className={styles.homePage}>
      <section className={styles.latestEpisodes}>
          <h2>Últimos lançamentos</h2>

          <ul>
            {latestEpisodes.map((episode, index) => {
              return(
                <li key={episode.id}>
                  <Image 
                    width={192} 
                    height={192} 
                    src={episode.thumbnail} 
                    alt={episode.titles}
                    objectFit="cover"
                  />

                  <div className={styles.Details}>
                      <Link href={`/episodes/${episode.id}`}>
                          <a>{episode.titles}</a>
                      </Link>
                      
                      <p>{episode.members}</p>
                      <span>{episode.publishedAt}</span>
                      <span>{episode.durationAsString}</span>
                  </div>

                  <button type="button" onClick={() => PlayList(episodeList, index)}>
                    <img src="/play-green.svg" alt="Tocar episodio"/>
                  </button>

                </li>
              )
            })}
          </ul>
      </section>

      <section className={styles.allEpisodes}>
            <h2>Todos episódios</h2>

            <table cellSpacing={0}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Podcast</th>
                    <th>Integrantes</th>
                    <th>Data</th>
                    <th>Duração</th>
                    <th></th>
                  </tr>   
                </thead>

                <tbody>
                  {allEpisodes.map((episode, index) =>{
                    return(
                      <tr key={episode.id}>
                          <td style={ { width: 90 } }>
                            <Image
                             width={120}
                             height={120}
                             src={episode.thumbnail}
                             alt={episode.titles}
                             objectFit="cover"
                             />
                          </td>

                          <td>
                            <Link href={`/episodes/${episode.id}`}>
                              <a>{episode.titles}</a>
                            </Link>
                          </td>
                          <td>{episode.members}</td>
                          <td style={ { width: 100 } }>{episode.publishedAt}</td>
                          <td>{episode.durationAsString}</td>
                          <td>
                            <button type="button" onClick={() => PlayList(episodeList, index + latestEpisodes.length)}>
                              <img src="/play-green.svg" alt="Tocar episodio"/>
                            </button>
                          </td>
                      </tr>
                    )
                  })}
                </tbody>
            </table>
      </section>
    </div> 
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params:{
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes = data.map(episode => {
    return{
      id: episode.id,
      titles: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: Convert(Number(episode.file.duration)),
      url: episode.file.url,
    };
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  }
}