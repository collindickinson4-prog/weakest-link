import { motion } from 'framer-motion'
import Logo from '../Logo'

/** Shown while the host is on the title or setup screen. */
export default function AudienceWaiting() {
  return (
    <div className="wl-stage relative grid h-full w-full place-items-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="grid place-items-center"
      >
        <Logo size={0.9} />
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="mt-16 font-cond text-xl uppercase tracking-[0.35em] text-wl-cyan/80"
        >
          The game begins shortly
        </motion.p>
      </motion.div>
    </div>
  )
}
