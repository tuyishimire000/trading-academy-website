// 3D Trading Graphics Component
export const TradingGraphics = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Floating Candlesticks */}
    <div className="absolute top-20 left-10 animate-float-slow">
      <div className="w-8 h-16 bg-gradient-to-b from-green-400 to-green-600 rounded-sm shadow-lg transform rotate-12"></div>
    </div>
    <div className="absolute top-32 right-20 animate-float-medium">
      <div className="w-6 h-12 bg-gradient-to-b from-red-400 to-red-600 rounded-sm shadow-lg transform -rotate-6"></div>
    </div>
    <div className="absolute bottom-32 left-1/4 animate-float-fast">
      <div className="w-4 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-sm shadow-lg transform rotate-45"></div>
    </div>
    
    {/* Floating Charts */}
    <div className="absolute top-1/4 right-1/3 animate-float-slow">
      <div className="w-16 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg shadow-xl transform rotate-12 opacity-80">
        <div className="w-full h-full bg-gradient-to-br from-transparent to-white/20 rounded-lg"></div>
      </div>
    </div>
    
    {/* Trading Symbols */}
    <div className="absolute bottom-20 right-10 animate-float-medium">
      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">$</span>
      </div>
    </div>
    
    {/* Liquid Orbs */}
    <div className="absolute top-1/2 left-1/4 animate-pulse">
      <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-xl opacity-60 blur-sm"></div>
    </div>
    <div className="absolute bottom-1/3 right-1/4 animate-pulse delay-1000">
      <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full shadow-xl opacity-60 blur-sm"></div>
    </div>
  </div>
)
