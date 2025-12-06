import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Heart, Send } from 'lucide-react';
import logoImg from '../../assets/nexuslogo.png'; 
import footerBg from '../../assets/footer.png';
export default function Footer() {
  return (
    <footer 
        className="bg-black text-white pt-16 pb-8 font-sans relative overflow-hidden border-t border-white/10 bg-cover bg-center bg-no-repeat"
        style={{ 
            // Agregamos un gradiente negro hacia arriba para que se fusione con el fondo de la página
            // y oscurecemos la imagen para que el texto resalte.
            backgroundImage: `linear-gradient(to top, #00000069 10%, rgba(0,0,0,0.7) 100%), url(${footerBg})`,
            backgroundPosition: 'center 20px'
        }}
    >
        
        {/* Línea decorativa superior con gradiente */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-600 to-transparent opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                
                {/* --- COLUMNA 1: MARCA --- */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <img 
                            src={logoImg} 
                            alt="Nexus" 
                            // Ajusté un poco la escala y posición para que se vea bien alineado
                            className="w-8 h-8 object-contain relative left-[95px] top-[-11px] scale-[4]" 
                        />
                        <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                        </span>
                    </div>
                    <p className="text-white text-xs leading-relaxed font-sans">
                        Tu destino definitivo para videojuegos digitales. Explora, colecciona y juega sin límites.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <SocialIcon icon={<Facebook size={18} />} />
                        <SocialIcon icon={<Twitter size={18} />} />
                        <SocialIcon icon={<Instagram size={18} />} />
                        <SocialIcon icon={<Youtube size={18} />} />
                    </div>
                </div>

                {/* --- COLUMNA 2: EXPLORAR --- */}
                <div>
                    <h3 className="text-xs font-bold mb-6 uppercase tracking-widest text-purple-600 flex items-center gap-2" style={{ fontFamily: '"Press Start 2P", cursive', lineHeight: '1.5' }}>
                        Explorar
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link to="/" className="hover:text-white hover:pl-2 transition-all duration-300 block">Catálogo</Link></li>
                        <li><Link to="/community" className="hover:text-white hover:pl-2 transition-all duration-300 block">Comunidad</Link></li>
                        <li><Link to="/library" className="hover:text-white hover:pl-2 transition-all duration-300 block">Biblioteca</Link></li>
                        <li><Link to="/cart" className="hover:text-white hover:pl-2 transition-all duration-300 block">Ofertas</Link></li>
                    </ul>
                </div>

                {/* --- COLUMNA 3: SOPORTE --- */}
                <div>
                    <h3 className="text-xs font-bold mb-6 uppercase tracking-widest text-purple-600 flex items-center gap-2" style={{ fontFamily: '"Press Start 2P", cursive', lineHeight: '1.5' }}>
                        Soporte
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-white hover:pl-2 transition-all duration-300 block">Ayuda</a></li>
                        <li><a href="#" className="hover:text-white hover:pl-2 transition-all duration-300 block">Términos</a></li>
                        <li><a href="#" className="hover:text-white hover:pl-2 transition-all duration-300 block">Privacidad</a></li>
                        <li><a href="#" className="hover:text-white hover:pl-2 transition-all duration-300 block">Reembolsos</a></li>
                    </ul>
                </div>

                {/* --- COLUMNA 4: NEWSLETTER --- */}
                <div>
                    <h3 className="text-xs font-bold mb-6 uppercase tracking-widest text-purple-600 flex items-center gap-2" style={{ fontFamily: '"Press Start 2P", cursive', lineHeight: '1.5' }}>
                        Newsletter
                    </h3>
                    <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                        <div className="relative">
                            <input 
                                type="email" 
                                placeholder="tu@email.com" 
                                className="w-full bg-[#111]/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-600 transition-all backdrop-blur-sm"
                            />
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                        </div>
                        <button type="button" className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-700 hover:to-purple-500 text-white px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2">
                            Suscribirse <Send size={12} />
                        </button>
                    </form>
                </div>
            </div>

            {/* --- BARRA INFERIOR --- */}
            <div className="border-t border-white/5 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                    &copy; 2025 NEXUS TODOS LOS DERECHOS RESERVADOS
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                    <span>Hecho con</span>
                    <Heart size={10} className="text-red-500 fill-current animate-pulse" />
                    <span>por Gamers</span>
                </div>
            </div>
        </div>
    </footer>
  );
}

function SocialIcon({ icon }) {
    return (
        <a href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white hover:text-white hover:bg-purple-600/20 hover:border-purple-600/50 transition-all duration-300 hover:-translate-y-1">
            {icon}
        </a>
    );
}