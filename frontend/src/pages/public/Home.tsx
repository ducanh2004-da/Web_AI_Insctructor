import { lazy } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { globeConfig } from '@/configs'
import { cn } from '@/lib'

const Globe = lazy(() => import('@/features/home/components/Globe').then(module => ({ default: module.default })))

export default function HomePage() {
  return (
    <section className="w-full h-[67.5rem] flex flex-col items-center pt-[4rem] relative">
      <div
        id="home-pattern"
        className={cn(
          'element-animation',
          'absolute inset-0',
          '[background-size:40px_40px]',
          '[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]',
          'dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]',
          'pointer-events-none'
        )}
      />
      <div className="element-animation pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
      <div className="w-full h-auto flex flex-col items-center text-center gap-4.5 mb-[1.5vh] relative z-10">
        <p className="element-animation w-1/2 text-[5rem] font-bold leading-[6.75rem]">Unlock Your Potential with 3D AI Immersive Learning</p>
        <p className="element-animation w-[33%] text-[1.75rem] font-normal mb-7">Discover expert-led courses with personalized guidance from our interactive 3D AI Teacher.</p>
        <div className="element-animation flex items-center gap-10">
          <Link to="/courses" className="rounded-full bg-primary text-white px-9 py-5 border border-primary font-medium flex items-center gap-5">
            <span className="text-[1.5rem]">Explore Courses</span>
            <Icon icon="ri:arrow-right-long-line" className="text-[2rem]" />
          </Link>
          <Link to="/about" className="bg-white relative group"> 
            <span className="text-primary text-[1.5rem] font-medium">Learn More</span>
            <span className="absolute opacity-0 left-0 right-0 bottom-0 h-[.15rem] bg-primary group-hover:opacity-100 transition-all duration-(--duration-main)" />
          </Link>
        </div>
      </div>
      <Globe globeConfig={globeConfig.main} data={globeConfig.sampleArcs} />
    </section>
  )
}
