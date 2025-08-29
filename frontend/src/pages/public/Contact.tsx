import { cn } from '@/lib'
import { Icon } from '@iconify/react'
import { contactOptions, faqs } from '@/lib/staticData'

export default function ContactPage() {
  return (
    <section className="w-full relative">
        <div className="relative h-[43rem]">
            <div
                className={cn(
                    'absolute inset-0',
                    '[background-size:40px_40px]',
                    '[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]',
                    'dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]',
                    'pointer-events-none'
                )}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
            
            <div className="w-full h-auto flex flex-col items-center text-center gap-4.5 mb-[1.5vh] relative z-10 pt-[4rem]">
            <h1 className="text-[5rem] font-bold leading-[6.75rem]">Get in touch with our team</h1>
            <p className="w-[33%] text-[1.75rem] font-normal mb-3">
                We are here to support you with any inquiries, feedback, or additional information you may need.
            </p>
            </div>

            <div className="w-full flex flex-wrap gap-6 justify-center p-8">
                {contactOptions.map((option, index) => (
                    <div key={index} className="w-[25rem] p-6 border rounded-lg shadow-lg bg-white/80 backdrop-blur-md flex flex-col items-start gap-4 z-20">
                    <Icon icon={option.icon} className="text-4xl" />
                    <h3 className="text-[2rem] font-bold">{option.title}</h3>
                    <p className="text-[1.5rem] font-normal">{option.description}</p>
                    {option.onClick ? (
                            <button className=" border p-2 rounded-md shadow-sm  text-black transition-all duration-(--duration-main) hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer" 
                        onClick={option.onClick}>{option.linkLabel}</button>
                    ) : (
                        <a href={option.link} target="_blank" rel="noopener noreferrer" className="border p-2 rounded-md shadow-sm text-black text-center transition-all duration-(--duration-main) hover:bg-gray-300 dark:hover:bg-gray-500">
                        {option.linkLabel}
                        </a>
                    )}
                    </div>
                ))}
            </div>
        </div>

        <div className="w-full flex flex-col items-center max-w-[60%] mx-auto py-12">
            <h2 className="text-[4rem] font-bold leading-[6.75rem] p-6">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.map((faq, index) => (
                <div key={index} className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                    <Icon icon={faq.icon} className="border rounded-sm shadow-sm text-4xl" />
                    <h3 className="text-[2rem] font-medium">{faq.question}</h3>
                    </div>
                    <p className="text-[1rem] font-normal ">{faq.answer}</p>
                </div>
                ))}
            </div>
        </div>
    </section>
  )
}
