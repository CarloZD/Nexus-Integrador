import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // 1. ESTADO PARA LA ANIMACIÓN
  const [isExiting, setIsExiting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }
  };

  // 2. FUNCIÓN DE TRANSICIÓN (Salida animada)
  const handleSwitch = () => {
    setIsExiting(true);
    setTimeout(() => {
        onSwitchToLogin();
        setIsExiting(false);
    }, 300); 
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.username) {
      newErrors.username = 'El username es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'El nombre es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
      });
      onClose();
      setFormData({ email: '', username: '', password: '', confirmPassword: '', fullName: '' });
    } catch (error) {
      console.error('Error en registro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = "bg-[#00000091] text-white border border-[#33333349] rounded-[50px] px-6 py-3 font-orbitron text-[0.8rem] outline-none shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] w-[360px] placeholder:text-[#8f8f8f] placeholder:lowercase transition-transform focus:scale-105";
  const errorStyle = "border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.2)]";

  return (
    // 1. EL OVERLAY
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      
      {/* 2. LA CAJA MODAL (Tarjeta) */}
      <div 
        // 3. AGREGAMOS LAS CLASES DE TRANSICIÓN AQUÍ
        className={`
            relative w-[1250px] h-[750px] rounded-[45px] shadow-2xl overflow-hidden 
            shadow-[0_-10px_35px_rgba(0,0,0,0.4)]
            transition-all duration-500 ease-in-out
            ${isExiting 
                ? 'opacity-0 scale-90 blur-md translate-x-[50px]' // Se mueve a la derecha al salir
                : 'opacity-100 transform scale-[0.8] md:scale-[0.98] translate-x-0'
            }
        `}
        style={{ 
          backgroundImage: "url('/src/assets/WallpapperREGISTER.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
        }}
      >
        <button onClick={onClose} className="absolute top-5 right-8 text-white/50 hover:text-white font-bold text-xl z-20 transition-colors">✕</button>

        {/* 3. CONTENEDOR DERECHO */}
        <div className="absolute right-0 top-0 w-[45%] h-full pr-10 pl-5">
            
            {/* TÍTULO FLOTANTE */}
            <h2 className="font-orbitron text-white uppercase text-[3rem] tracking-[1px] whitespace-nowrap text-left font-extrabold absolute"
                style={{ 
                    textShadow: "0 0 7px rgba(255, 255, 255, 0.62)",
                    top: "118px",      
                    left: "-25px"     
                }}>
              REGISTRATE
            </h2>

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="flex flex-col w-full mt-[130px] gap-3">
              
              <div className="relative left-[-45px] top-[75px] flex flex-col gap-4">
                
                {/* 1. Full Name */}
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`${inputStyle} ${errors.fullName ? errorStyle : ''}`}
                    placeholder="nombre completo"
                  />
                  {errors.fullName && <span className="absolute right-4 top-3 text-red-400 text-[10px] font-orbitron">{errors.fullName}</span>}
                </div>

                {/* 2. Username */}
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`${inputStyle} ${errors.username ? errorStyle : ''}`}
                    placeholder="nombre de usuario"
                  />
                  {errors.username && <span className="absolute right-4 top-3 text-red-400 text-[10px] font-orbitron">{errors.username}</span>}
                </div>

                {/* 3. Email */}
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputStyle} ${errors.email ? errorStyle : ''}`}
                    placeholder="correo electrónico"
                  />
                   {errors.email && <span className="absolute right-4 top-3 text-red-400 text-[10px] font-orbitron">{errors.email}</span>}
                </div>

                {/* 4. Password */}
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputStyle} ${errors.password ? errorStyle : ''}`}
                    placeholder="contraseña"
                  />
                   {errors.password && <span className="absolute right-4 top-3 text-red-400 text-[10px] font-orbitron">{errors.password}</span>}
                </div>

                {/* 5. Confirm Password */}
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${inputStyle} ${errors.confirmPassword ? errorStyle : ''}`}
                    placeholder="confirmar contraseña"
                  />
                   {errors.confirmPassword && <span className="absolute right-4 top-3 text-red-400 text-[10px] font-orbitron">{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* BLOQUE BOTÓN */}
              <div className="relative mt-2 left-[-20px] top-[82px]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-b from-[#3a3a3a] to-black text-white font-orbitron font-semibold text-[1.2rem] rounded-[50px] py-2.5 px-4 cursor-pointer uppercase shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 w-[310px] tracking-[2px] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] hover:scale-[1.02] hover:border-white active:scale-95 disabled:opacity-50"
                    style={{ backgroundImage: "url('/src/assets/botonloginsignin.png')", backgroundSize: 'cover' }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        ...
                      </span>
                    ) : (
                      'REGISTRARSE'
                    )}
                  </button>
              </div>

              {/* BLOQUE PILL LOGIN */}
              <div className="relative mt-2 left-[-117px] top-[74px] w-full flex justify-center z-10">
                  <div className="
                    flex items-center gap-1.5
                    bg-black/40               
                    backdrop-blur-md 
                    border border-white/5 
                    rounded-full 
                    px-3 py-1 
                    shadow-[0_4px_10px_rgba(0,0,0,0.4)]
                  ">
                    
                    <span className="text-white text-[0.7rem] md:text-xs tracking-wide drop-shadow-md font-sans">
                      o si ya tienes una cuenta, entra
                    </span>

                    <button
                      type="button"
                      // 4. USAMOS LA FUNCIÓN HANDLE SWITCH
                      onClick={handleSwitch}
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
                      style={{ fontFamily: '"Press Start 2P", monospace' }}
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