
'use client'
import { motion } from 'framer-motion'
import { ButtonHTMLAttributes } from 'react'

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid'|'outline' }){
  const { className='', variant='solid', ...rest } = props
  const styles = variant==='solid' ? 'btn' : 'btn-outline'
  return (
    <motion.button whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }} className={`${styles} ${className}`} {...rest} />
  )
}
