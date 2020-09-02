import { useContext } from 'react'
import { Context } from '../contexts/SakeProvider'

const useSake = () => {
  const { sake } = useContext(Context)
  return sake
}

export default useSake