import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  
  // 1. ESTADO PARA ANIMACIÓN
  const [isExiting, setIsExiting] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  // 2. FUNCIÓN DE TRANSICIÓN
  const handleSwitch = () => {
    // Activamos la animación de salida
    setIsExiting(true);
    // Esperamos 400ms (lo que dura la animación CSS) antes de cambiar de vista real
    setTimeout(() => {
        onSwitchToRegister();
        setIsExiting(false);
    }, 300); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      onClose();
      setFormData({ email: '', password: '' });
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    // 1. EL OVERLAY
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" >
      
      {/* 2. LA CAJA MODAL (Tarjeta) */}
      <div 
        // 3. AGREGAMOS LAS CLASES DE TRANSICIÓN AQUÍ
        // Reemplazamos la clase estática por una dinámica que reacciona a isExiting
        className={`
            relative w-[1100px] h-[665px] rounded-[45px] shadow-2xl overflow-hidden 
            shadow-[0_-10px_35px_rgba(0,0,0,0.4)]
            transition-all duration-500 ease-in-out
            ${isExiting ? 'opacity-0 scale-90 blur-md translate-x-[-50px]' : 'transform scale-[0.8] md:scale-[0.98] opacity-100 translate-x-0'}
        `}
        style={{ 
          backgroundImage: "url('/src/assets/wallpapperloginsignin.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',

        }}
      >
        <button onClick={onClose} className="absolute top-5 right-8 text-white/50 hover:text-white font-bold text-xl z-20">✕</button>

        {/* 3. CONTENEDOR DERECHO */}
        <div className="absolute right-0 top-0 w-[45%] h-full pr-10 pl-5">
            
            {/* --- MAGIA 1: TÍTULO FLOTANTE (ABSOLUTE) --- */}
            <h2 className="font-orbitron text-white uppercase text-[2.7rem] tracking-[1px] whitespace-nowrap text-left font-extrabold absolute"
                style={{ 
                    textShadow: "0 0 7px rgba(255, 255, 255, 0.62)",
                    top: "135px",      /* <--- SUBE O BAJA EL TÍTULO AQUÍ */
                    left: "-70px"     /* <--- MUEVE A LOS LADOS AQUÍ */
                }}>
              INICIAR SESION
            </h2>

            {/* --- MAGIA 2: FORMULARIO INDEPENDIENTE --- */}
            <form onSubmit={handleSubmit} className="flex flex-col w-full mt-[140px]">
              
              {/* BLOQUE EMAIL: Ajusta top/left para mover SOLO este input */}
              <div className="relative top-[82px] left-[-80px]">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-[#00000091] text-white border border-[#33333349] rounded-[50px] px-7 py-3.5 font-orbitron text-[0.9rem] outline-none shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] w-[360px] mb-6 placeholder:text-[#8f8f8f] placeholder:lowercase transition-transform focus:scale-105"
                    placeholder="correo electronico"
                  />
              </div>

              {/* BLOQUE PASSWORD: Ajusta top/left para mover SOLO este input */}
              <div className="relative top-[80px] left-[-80px]">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-[#00000091] text-white border border-[#33333349] rounded-[50px] px-7 py-3.5 font-orbitron text-[0.9rem] outline-none shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] w-[360px] mb-6 placeholder:text-[#8f8f8f] placeholder:lowercase transition-transform focus:scale-105"
                    placeholder="contraseña"
                  />
              </div>

              {/* BLOQUE OPCIONES (Checkbox): Ajusta top/left para mover toda esta fila */}
              <div className="relative top-[76px] left-[-80px]">
                  <div className="flex justify-between items-center text-white text-[0.75rem] font-orbitron mb-6 px-2 w-[365px]">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-purple-500 transition-colors font-semibold">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="cursor-pointer"
                      />
                      <span>recuérdame</span>
                    </label>
                    
                    <button
                      type="button"
                      className="text-white/80 hover:text-white hover:underline text-[0.8rem] font-orbitron whitespace-nowrap font-semibold"
                    >
                      ¿olvidaste tu contraseña?
                    </button>
                  </div>
              </div>

              {/* BLOQUE BOTÓN: Ajusta top/left para mover SOLO el botón */}
              <div className="relative top-[76px] left-[-59px]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-b from-[#3a3a3a] to-black text-white font-orbitron font-semibold text-[1.2rem]  rounded-[50px] py-2.5 px-4 cursor-pointer uppercase shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 w-[310px] tracking-[2px] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] hover:scale-[1.02] hover:border-white active:scale-95 disabled:opacity-50"
                    style={{ backgroundImage: "url('/src/assets/botonloginsignin.png')", backgroundSize: 'cover' }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        ...
                      </span>
                    ) : (
                      'INICIAR SESION'
                    )}
                  </button>
              </div>

              {/* BLOQUE PILL REGISTRO: Ajusta top/left para mover la cajita de abajo */}
              <div className="relative top-[89px] left-[-120px] w-full flex justify-center z-10">
                  <div className="
                    flex items-center gap-1.5
                    bg-black/40               
                    backdrop-blur-md 
                    border border-white/5 
                    rounded-full 
                    px-3 py-1 
                    shadow-[0_4px_10px_rgba(0,0,0,0.4)]
                  ">
                    
                    {/* Texto: "o si aun no tienes..." */}
                    <span className="text-white text-[0.7rem] md:text-xs tracking-wide drop-shadow-md font-sans">
                      o si aun no tienes una cuenta, crea una
                    </span>

                    {/* Botón: "¡aquí!" */}
                    <button
                      type="button"
                      // 4. USAMOS LA NUEVA FUNCIÓN HANDLE SWITCH
                      onClick={handleSwitch}
                      // Aquí aplicamos la fuente pixelada y el efecto de sombra dura
                      className="
                        text-white 
                        hover:text-purple-600 
                        text-[0.6rem] md:text-[0.65rem]
                        transition-colors 
                        duration-300
                        font-['Press_Start_2P',_monospace] 
                        uppercase
                        drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)]
                      "
                      style={{ fontFamily: '"Press Start 2P", monospace' }} // Fallback en línea por seguridad
                    >
                      ¡AQUI!
                    </button>

                  </div>
              </div>

            </form>
        </div>
      </div>
    </div>
  );
}