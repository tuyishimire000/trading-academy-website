import { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  delay?: number
}

export const EnhancedFeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => (
  <div 
    className="group relative p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Liquid Background Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    {/* Icon with 3D Effect */}
    <div className="relative z-10 mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    
    <h3 className="relative z-10 text-lg font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors duration-300">
      {title}
    </h3>
    <p className="relative z-10 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
      {description}
    </p>
    
    {/* Hover Glow Effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
  </div>
)
