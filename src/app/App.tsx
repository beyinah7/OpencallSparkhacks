import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, PanInfo } from 'motion/react';
import { 
  Clapperboard, 
  Film, 
  User, 
  Star, 
  MapPin, 
  Heart, 
  X, 
  ChevronRight, 
  Search,
  Settings,
  Camera,
  Mail,
  Lock,
  ArrowLeft,
  Award,
  Briefcase,
  Clock,
  CheckCircle,
  MessageCircle,
  Edit2,
  Save,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Send,
  MoreVertical,
  ThumbsUp,
  Ghost,
  Laugh,
  Sparkles,
  Zap,
  Rocket,
  Skull,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Feather,
  Drama,
  Smile,
  Swords,
  Radar,
  Flame,
  Music
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type ViewState = 'splash' | 'onboarding' | 'feed' | 'profile' | 'shortlist' | 'auth' | 'search' | 'chat' | 'chat-detail' | 'settings';

type Role = 'talent' | 'crew' | 'producer';

interface PortfolioItem {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  title: string;
  description?: string;
}

interface UserProfile {
  name: string;
  role: Role;
  location: string;
  interests: string[];
  bio?: string;
  skills?: string[];
  experience?: string;
  reelUrl?: string;
  contactEmail?: string;
  avatar?: string;
  portfolio?: PortfolioItem[];
}

interface MovieCredit {
  title: string;
  description?: string;
  year?: string;
  role?: string;
}

interface Talent {
  id: string;
  name: string;
  role: string;
  image: string;
  distance: string;
  credits: string[] | MovieCredit[];
  reelUrl?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  rating?: number;
  availability?: string;
  connections?: string[]; // "Worked with X"
  workedWithUser?: boolean; // For shortlist
  userRating?: number;
  userReview?: string;
  userRatingCount?: number; // For calculating averages
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  talentId: string;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
}

// --- Constants ---
const COLORS = {
  maroon: '#800000',
  gold: '#D4AF37',
  dark: '#1a0505',
};

const SAMPLE_TALENT: Talent[] = [
  {
    id: '1',
    name: 'Julian Thorne',
    role: 'Lead Actor',
    image: 'https://images.unsplash.com/photo-1515095984775-726a54913d0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3RvciUyMGhlYWRzaG90JTIwbWFufGVufDF8fHx8MTc3MDQ2NzcwMXww&ixlib=rb-4.1.0&q=80&w=1080',
    distance: '2 miles away',
    credits: ['The Last Whisper', 'Neon Nights', 'Broken Dreams'],
    bio: 'Classically trained actor with 8+ years of experience in drama and indie films. Known for intense, brooding characters and a high level of professionalism on set. Passionate about method acting and character immersion.',
    skills: ['Method Acting', 'Stage Combat', 'Improvisation', 'Accent Work'],
    experience: '8 years',
    rating: 4.8,
    availability: 'Available',
    connections: ['Sarah Jenkins (Producer)', 'Mike Ross (Director)'],
  },
  {
    id: '2',
    name: 'Elena Vance',
    role: 'Actress / Stunt',
    image: 'https://images.unsplash.com/photo-1706824261799-55343861e08e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3RyZXNzJTIwaGVhZHNob3QlMjB3b21hbnxlbnwxfHx8fDE3NzA0ODIyODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    distance: '5 miles away',
    credits: ['Shadows of Yesterday', 'Commercial: Coke', 'Action Hour'],
    bio: 'Award-winning actress and certified stunt performer. Brings a unique physicality to every role. Specializing in action sequences and emotionally complex roles where physical storytelling is key.',
    skills: ['Stunt Coordination', 'Martial Arts', 'Wire Work', 'Emotional Range'],
    experience: '6 years',
    rating: 4.9,
    availability: 'Limited',
    connections: ['James Cameron (Director)'],
  },
  {
    id: '3',
    name: 'Marcus Reed',
    role: 'Director of Photography',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1000',
    distance: '12 miles away',
    credits: ['Indie Short: Blue', 'Music Video: Zed', 'Neon Dreams'],
    bio: 'Visionary cinematographer with a unique eye for lighting and composition. Experienced in both digital and film formats. Creates atmospheric visuals that elevate the narrative.',
    skills: ['Cinematography', 'Lighting Design', 'Color Grading', 'Steadicam'],
    experience: '10 years',
    rating: 4.7,
    availability: 'Available',
    connections: ['Tom Holland (Actor)', 'Zendaya (Actress)'],
  },
];

// --- Components ---

const Button = ({ children, onClick, className, variant = 'primary', type = 'button' }: { children: React.ReactNode, onClick?: () => void, className?: string, variant?: 'primary' | 'secondary' | 'danger', type?: 'button' | 'submit' }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      type={type}
      className={cn(
        "px-6 py-3 uppercase tracking-widest font-serif font-bold text-sm border transition-colors duration-300 rounded-sm flex items-center justify-center gap-2",
        variant === 'primary' 
          ? "bg-[#D4AF37] text-[#800000] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
          : variant === 'secondary'
          ? "bg-transparent text-[#D4AF37] border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#800000]"
          : "bg-red-900/50 text-red-200 border-red-800 hover:bg-red-800",
        className
      )}
    >
      {children}
    </motion.button>
  );
};

const FilmFrame = ({ children, className, orientation = 'horizontal' }: { children: React.ReactNode, className?: string, orientation?: 'horizontal' | 'vertical' }) => (
  <div className={cn("relative bg-black shadow-lg overflow-hidden", orientation === 'horizontal' ? "py-3 border-y border-[#333]" : "px-3 border-x border-[#333]", className)}>
     {orientation === 'horizontal' ? (
       <>
         <div className="absolute top-0.5 left-0 right-0 h-2 flex justify-between px-2 gap-2 overflow-hidden pointer-events-none">
           {Array.from({ length: 20 }).map((_, i) => <div key={`t-${i}`} className="w-1.5 h-1.5 bg-white/20 rounded-[1px] flex-shrink-0" />)}
         </div>
         <div className="absolute bottom-0.5 left-0 right-0 h-2 flex justify-between px-2 gap-2 overflow-hidden pointer-events-none">
           {Array.from({ length: 20 }).map((_, i) => <div key={`b-${i}`} className="w-1.5 h-1.5 bg-white/20 rounded-[1px] flex-shrink-0" />)}
         </div>
       </>
     ) : (
       <>
         <div className="absolute left-0.5 top-0 bottom-0 w-2 flex flex-col justify-between py-2 gap-2 overflow-hidden pointer-events-none">
           {Array.from({ length: 20 }).map((_, i) => <div key={`l-${i}`} className="w-1.5 h-1.5 bg-white/20 rounded-[1px] flex-shrink-0" />)}
         </div>
         <div className="absolute right-0.5 top-0 bottom-0 w-2 flex flex-col justify-between py-2 gap-2 overflow-hidden pointer-events-none">
           {Array.from({ length: 20 }).map((_, i) => <div key={`r-${i}`} className="w-1.5 h-1.5 bg-white/20 rounded-[1px] flex-shrink-0" />)}
         </div>
       </>
     )}
     {children}
  </div>
);

// --- Screens ---

const Welcome = ({ onContinue }: { onContinue: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      icon: <Clapperboard className="w-20 h-20 text-[#D4AF37]" />,
      title: "Welcome to OpenCall",
      description: "The premier platform connecting talent and creators in the film industry"
    },
    {
      icon: <Star className="w-20 h-20 text-[#D4AF37]" />,
      title: "Discover Top Talent",
      description: "Browse verified actors, crew members, and industry professionals ready for your next project"
    },
    {
      icon: <Heart className="w-20 h-20 text-[#D4AF37]" />,
      title: "Make Connections",
      description: "Shortlist candidates, chat directly, and build your perfect production team"
    },
    {
      icon: <Film className="w-20 h-20 text-[#D4AF37]" />,
      title: "Create Magic",
      description: "From indie films to major productions, find the perfect match for every role"
    }
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a0505] flex flex-col">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 z-0"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1754915281161-d16814dbb60f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB2ZWx2ZXQlMjBjdXJ0YWluJTIwdGV4dHVyZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzcwNDgyMjgxfDA&ixlib=rb-4.1.0&q=80&w=1080')` }}
      />
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center max-w-md"
          >
            <div className="mb-8 flex justify-center">
              {slides[currentSlide].icon}
            </div>
            <h2 className="font-serif text-4xl text-[#D4AF37] mb-4 drop-shadow-lg">
              {slides[currentSlide].title}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 relative z-10">
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === currentSlide ? "w-8 bg-[#D4AF37]" : "w-2 bg-white/30"
              )}
            />
          ))}
        </div>
        
        {currentSlide < slides.length - 1 ? (
          <Button onClick={() => setCurrentSlide(currentSlide + 1)} className="w-full">
            Next
          </Button>
        ) : (
          <Button onClick={onContinue} className="w-full">
            Get Started
          </Button>
        )}
        
        {currentSlide < slides.length - 1 && (
          <button 
            onClick={onContinue}
            className="w-full mt-4 text-[#D4AF37]/60 hover:text-[#D4AF37] text-sm transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

const Splash = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a0505] flex flex-col items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 z-0"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1754915281161-d16814dbb60f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB2ZWx2ZXQlMjBjdXJ0YWluJTIwdGV4dHVyZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzcwNDgyMjgxfDA&ixlib=rb-4.1.0&q=80&w=1080')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-lg bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent z-0 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center p-6"
      >
        <div className="mb-6 p-4 border-2 border-[#D4AF37] rounded-full">
          <Clapperboard className="w-16 h-16 text-[#D4AF37]" />
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl text-[#D4AF37] mb-2 drop-shadow-lg tracking-wider">
          OpenCall
        </h1>
        <p className="text-[#eaddcf] font-light tracking-[0.2em] uppercase text-sm mb-12">
          Discover. Cast. Create.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button onClick={onEnter}>
            Enter Stage Door
          </Button>
          <Button variant="secondary" onClick={onEnter}>
            Audition (Sign Up)
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const Onboarding = ({ onComplete }: { onComplete: (data: any) => void }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<any>({});

  const handleNext = (key: string, value: any) => {
    const newData = { ...data, [key]: value };
    setData(newData);
    if (step < 1) {
      setStep(step + 1);
    } else {
      onComplete(newData);
    }
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-[#2a0808]">
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1695192699177-f98215c7bc4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxtJTIwcmVlbCUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzA0ODIyODF8MA&ixlib=rb-4.1.0&q=80&w=1080')`, backgroundSize: 'cover' }}
      />
      
      <motion.div 
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl shadow-2xl mx-4"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#800000]">
          <motion.div 
            className="h-full bg-[#D4AF37]" 
            initial={{ width: `${(step / 2) * 100}%` }}
            animate={{ width: `${((step + 1) / 2) * 100}%` }}
          />
        </div>

        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-serif text-[#D4AF37] mb-6 text-center">What is your role?</h2>
            <button onClick={() => handleNext('role', 'talent')} className="p-4 bg-black/40 border border-[#D4AF37]/50 hover:bg-[#D4AF37] hover:text-[#800000] text-white transition-all rounded-lg flex items-center justify-between group">
              <span className="font-serif text-xl">Talent</span>
              <User className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => handleNext('role', 'producer')} className="p-4 bg-black/40 border border-[#D4AF37]/50 hover:bg-[#D4AF37] hover:text-[#800000] text-white transition-all rounded-lg flex items-center justify-between group">
              <span className="font-serif text-xl">Producer</span>
              <Clapperboard className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => handleNext('role', 'crew')} className="p-4 bg-black/40 border border-[#D4AF37]/50 hover:bg-[#D4AF37] hover:text-[#800000] text-white transition-all rounded-lg flex items-center justify-between group">
              <span className="font-serif text-xl">Crew</span>
              <Camera className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-serif text-[#D4AF37] mb-6 text-center">Interests</h2>
            <div className="grid grid-cols-2 gap-3">
              {['Drama', 'Horror', 'Comedy', 'Commercial', 'Indie', 'Sci-Fi'].map((genre) => (
                <button 
                  key={genre}
                  onClick={() => handleNext('genre', genre)}
                  className="p-3 bg-black/40 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-white text-sm rounded transition-colors"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const TalentCard = ({ talent, onSwipe, onDetails }: { talent: Talent, onSwipe: (dir: 'left' | 'right') => void, onDetails: () => void }) => {
  const controls = useAnimation();

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      await controls.start({ x: 500, opacity: 0, rotate: 20 });
      onSwipe('right');
    } else if (offset < -100 || velocity < -500) {
      await controls.start({ x: -500, opacity: 0, rotate: -20 });
      onSwipe('left');
    } else {
      controls.start({ x: 0, rotate: 0 });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      className="absolute top-0 left-0 w-full h-full p-4 flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
    >
      <div className="relative w-full max-w-sm h-[600px] bg-black rounded-sm overflow-hidden shadow-2xl border-4 border-[#111]">
        {/* Film Strip Borders - Moved behind content via z-index or layout structure, but here they are borders */}
        {/* We will keep them absolute but ensure content is z-10 above them if needed, or just let them be on top but transparent? 
            The user said "film tape display dosnt cover the image". 
            The borders are 32px wide on sides. If image is full width, it is covered. 
            Let's adjust image container to be inside the borders.
        */}
        <div className="absolute top-0 left-0 bottom-0 w-8 bg-[#111] z-20 flex flex-col justify-between py-2 border-r border-[#333] pointer-events-none">
           {Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className="w-5 h-6 mx-auto bg-white/10 rounded-sm mb-4" />
           ))}
        </div>
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-[#111] z-20 flex flex-col justify-between py-2 border-l border-[#333] pointer-events-none">
           {Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className="w-5 h-6 mx-auto bg-white/10 rounded-sm mb-4" />
           ))}
        </div>

        {/* Content - Adjusted margins to not be covered by film strips */}
        <div className="absolute inset-y-0 left-8 right-8 bg-[#1a0505] flex flex-col">
          <div className="relative flex-grow overflow-hidden bg-black" onClick={onDetails}>
            <img src={talent.image} alt={talent.name} className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
            
            <div className="absolute bottom-0 left-0 w-full p-4 pb-20">
              <h3 className="text-[#D4AF37] font-serif text-3xl font-bold">{talent.name}</h3>
              <p className="text-white/80 font-medium uppercase tracking-wide text-sm mb-2">{talent.role}</p>
              <div className="flex items-center text-white/60 text-xs mb-3">
                <MapPin className="w-3 h-3 mr-1" />
                {talent.distance}
              </div>

              <p className="text-white/70 text-sm line-clamp-2 mb-3 font-light italic">
                "{talent.bio}"
              </p>

              <div className="flex flex-wrap gap-2">
                {talent.credits.slice(0,2).map((credit, i) => (
                  <span key={i} className="px-2 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase rounded-sm">
                    {credit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Overlay Hints */}
        <motion.div className="absolute top-10 right-10 z-30 opacity-0 bg-green-500/80 text-white px-4 py-2 rotate-12 font-bold border-4 border-white rounded-lg text-2xl uppercase tracking-widest" style={{ opacity: controls ? undefined : 0 }}>
          Cast
        </motion.div>
        <motion.div className="absolute top-10 left-10 z-30 opacity-0 bg-red-500/80 text-white px-4 py-2 -rotate-12 font-bold border-4 border-white rounded-lg text-2xl uppercase tracking-widest">
          Pass
        </motion.div>
      </div>
    </motion.div>
  );
};

const SettingsView = ({ onClose }: { onClose: () => void }) => {
  const sections = [
    { title: 'Account', icon: User },
    { title: 'Notifications', icon: Bell },
    { title: 'Privacy & Security', icon: Shield },
    { title: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="h-full w-full bg-[#1a0505] flex flex-col z-50">
      <div className="h-16 flex items-center gap-4 px-4 border-b border-[#D4AF37]/20 bg-[#0a0202]">
        <button onClick={onClose} className="text-[#D4AF37] hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-[#D4AF37] font-serif text-xl">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.map((section) => (
           <button key={section.title} className="w-full p-4 bg-black/40 border border-[#D4AF37]/20 rounded-lg flex items-center justify-between hover:bg-[#D4AF37]/10 transition-colors group">
             <div className="flex items-center gap-4">
               <div className="p-2 bg-[#D4AF37]/10 rounded-full text-[#D4AF37]">
                 <section.icon className="w-5 h-5" />
               </div>
               <span className="text-white font-medium">{section.title}</span>
             </div>
             <ChevronRight className="text-white/30 group-hover:text-[#D4AF37] transition-colors" />
           </button>
        ))}

        <div className="pt-8">
          <button className="w-full p-4 text-red-400 flex items-center gap-4 hover:bg-red-900/20 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Feed = ({ 
  talents, 
  onSwipe, 
  onOpenSettings, 
  onOpenSearch, 
  onOpenChat,
  onSelectTalent 
}: { 
  talents: Talent[], 
  onSwipe: (id: string, dir: 'left' | 'right') => void, 
  onOpenSettings: () => void,
  onOpenSearch: () => void,
  onOpenChat: () => void,
  onSelectTalent: (talent: Talent) => void
}) => {
  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col bg-[#1a0505]">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#D4AF37]/20 bg-[#1a0505] z-30">
        <h2 className="text-[#D4AF37] font-serif text-xl tracking-widest">OPEN CALL</h2>
        <div className="flex gap-4">
          <button onClick={onOpenSearch}>
            <Search className="text-[#D4AF37]/60 w-5 h-5 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </button>
          <button onClick={onOpenChat}>
            <MessageCircle className="text-[#D4AF37]/60 w-5 h-5 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </button>
          <button onClick={onOpenSettings}>
            <Settings className="text-[#D4AF37]/60 w-5 h-5 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-grow relative flex items-center justify-center p-4">
        <AnimatePresence>
          {talents.map((talent) => (
            <TalentCard 
              key={talent.id} 
              talent={talent} 
              onSwipe={(dir) => onSwipe(talent.id, dir)}
              onDetails={() => onSelectTalent(talent)}
            />
          )).reverse()}
        </AnimatePresence>
        
        {talents.length === 0 && (
          <div className="text-center text-white/50 p-8">
            <Clapperboard className="w-16 h-16 mx-auto mb-4 text-[#D4AF37]/20" />
            <p className="font-serif">That's a wrap!</p>
            <p className="text-sm">Check back later for more talent.</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {talents.length > 0 && (
        <div className="h-24 flex items-center justify-center gap-8 pb-4 z-30">
          <button 
            className="w-14 h-14 rounded-full border-2 border-[#800000] text-[#800000] bg-black/20 hover:bg-[#800000] hover:text-white flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(128,0,0,0.3)]"
            onClick={() => onSwipe(talents[0].id, 'left')}
          >
            <X className="w-6 h-6" />
          </button>
          
          <button 
            className="w-14 h-14 rounded-full border-2 border-[#D4AF37] text-[#D4AF37] bg-black/20 hover:bg-[#D4AF37] hover:text-[#1a0505] flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            onClick={() => onSwipe(talents[0].id, 'right')}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        </div>
      )}
    </div>
  );
};

const Profile = ({ user, onUpdateUser, onOpenSearch, onOpenChat, onOpenSettings }: { user: UserProfile, onUpdateUser: (u: UserProfile) => void, onOpenSearch: () => void, onOpenChat: () => void, onOpenSettings: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user);

  const handleSave = () => {
    onUpdateUser(editForm);
    setIsEditing(false);
  };

  const handleAddPortfolio = (type: 'image' | 'video' | 'document') => {
    const newItem: PortfolioItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000',
      title: `New ${type}`,
      description: 'Sample portfolio item'
    };
    setEditForm({
      ...editForm,
      portfolio: [...(editForm.portfolio || []), newItem]
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#1a0505] pb-20">
      {/* Header with Icons */}
      <div className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 bg-[#1a0505]/95 backdrop-blur-sm border-b border-[#D4AF37]/20">
        <h2 className="text-[#D4AF37] font-serif text-lg">MY PROFILE</h2>
        <div className="flex gap-4">
          <button onClick={onOpenSearch}>
            <Search className="text-[#D4AF37]/60 w-5 h-5 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </button>
          <button onClick={onOpenChat}>
            <MessageCircle className="text-[#D4AF37]/60 w-5 h-5 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </button>
          <button onClick={onOpenSettings}>
            <Settings className="text-[#D4AF37]/60 w-5 h-5 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </button>
        </div>
      </div>

      <div className="relative h-72">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614115866447-c9a299154650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2xseXdvb2QlMjByZWQlMjBjYXJwZXQlMjBzcG90bGlnaHR8ZW58MXx8fHwxNzcwNDgyMjgxfDA&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0505] via-[#1a0505]/50 to-transparent" />
        
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-black/50 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#800000] transition-colors"
          >
            {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 flex items-end">
          {/* Profile Picture in Vertical Film Frame */}
          <FilmFrame orientation="vertical" className="mr-6 bg-black p-0 border-2 border-[#D4AF37] rotate-[-2deg] shadow-2xl shrink-0">
            <div className="w-24 h-32 overflow-hidden bg-[#1a0505] relative group">
               <img src={editForm.avatar || "https://images.unsplash.com/photo-1515095984775-726a54913d0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3RvciUyMGhlYWRzaG90JTIwbWFufGVufDF8fHx8MTc3MDQ2NzcwMXww&ixlib=rb-4.1.0&q=80&w=1080"} className="w-full h-full object-cover" />
               {isEditing && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer">
                   <Camera className="text-white w-6 h-6" />
                 </div>
               )}
            </div>
          </FilmFrame>

          <div className="mb-2 flex-grow">
            {isEditing ? (
              <input 
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="text-4xl font-serif text-[#D4AF37] font-bold bg-transparent border-b border-[#D4AF37]/50 w-full outline-none mb-2"
              />
            ) : (
              <h1 className="text-4xl font-serif text-[#D4AF37] font-bold drop-shadow-md">{user.name}</h1>
            )}
            
            <div className="flex items-center gap-2 mt-1">
               <span className="px-2 py-0.5 bg-[#D4AF37] text-[#800000] text-xs font-bold uppercase tracking-wider rounded-sm">{user.role}</span>
               {isEditing ? (
                 <input 
                   value={editForm.location}
                   onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                   className="text-white/60 text-sm bg-transparent border-b border-[#D4AF37]/30 w-32 outline-none"
                 />
               ) : (
                 <span className="text-white/60 text-sm flex items-center"><MapPin className="w-3 h-3 mr-1" /> {user.location}</span>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {isEditing && (
          <Button onClick={handleSave} className="w-full mb-4">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        )}

        {/* Bio */}
        <section>
           <h2 className="text-[#D4AF37] font-serif text-lg mb-3 flex items-center tracking-widest uppercase text-sm">
             <User className="w-4 h-4 mr-2" /> About
           </h2>
           {isEditing ? (
             <textarea 
               value={editForm.bio}
               onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
               className="w-full h-32 bg-black/30 border border-[#D4AF37]/30 rounded p-3 text-white/80 text-sm outline-none focus:border-[#D4AF37]"
             />
           ) : (
             <p className="text-white/80 leading-relaxed text-sm">{user.bio}</p>
           )}
        </section>

        {/* Experience */}
        <section>
           <h2 className="text-[#D4AF37] font-serif text-lg mb-3 flex items-center tracking-widest uppercase text-sm">
             <Briefcase className="w-4 h-4 mr-2" /> Experience
           </h2>
           {isEditing ? (
             <input 
               value={editForm.experience}
               onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
               className="w-full bg-black/30 border border-[#D4AF37]/30 rounded p-3 text-white/80 text-sm outline-none"
             />
           ) : (
             <p className="text-white/80 text-sm">{user.experience} in the industry</p>
           )}
        </section>

        <section>
          <h2 className="text-[#D4AF37] font-serif text-lg mb-4 flex items-center tracking-widest uppercase text-sm">
            <Film className="w-4 h-4 mr-2" /> In Production
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 px-2">
             {[1, 2, 3].map(i => (
               <FilmFrame key={i} orientation="vertical" className="min-w-[140px] bg-black border border-[#333]">
                 <div className="aspect-[2/3] bg-[#0a0a0a] relative group overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-white/10 font-serif text-6xl font-bold group-hover:text-[#D4AF37]/20 transition-colors">?</div>
                    <div className="absolute top-2 right-2 bg-[#800000] text-white text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wide shadow-lg">Filming</div>
                    <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                       <p className="text-[#D4AF37] text-xs font-bold">Project {String.fromCharCode(64+i)}</p>
                    </div>
                 </div>
               </FilmFrame>
             ))}
          </div>
        </section>

        <section>
          <h2 className="text-[#D4AF37] font-serif text-lg mb-4 flex items-center tracking-widest uppercase text-sm">
            <Clapperboard className="w-4 h-4 mr-2" /> Credits
          </h2>
          <div className="space-y-4">
             {['The Silent City', 'Golden Hour', 'Whispers in the Dark'].map((title, i) => (
               <FilmFrame key={i} orientation="horizontal" className="w-full">
                 <div className="flex items-center px-4 py-2 bg-[#150505]">
                    <div className="w-12 h-12 bg-black border border-[#333] flex items-center justify-center text-[#D4AF37] shrink-0">
                        <Film className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="text-[#eaddcf] font-serif text-lg">{title}</h3>
                      <p className="text-[#D4AF37]/60 text-xs uppercase tracking-wider">Executive Producer • 2023</p>
                    </div>
                    <ChevronRight className="text-[#D4AF37] w-5 h-5 opacity-50" />
                 </div>
               </FilmFrame>
             ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const ChatList = ({ chats, onSelectChat, onOpenSearch, onOpenSettings }: { chats: Chat[], onSelectChat: (chatId: string) => void, onOpenSearch: () => void, onOpenSettings: () => void }) => {
  return (
    <div className="h-full w-full bg-[#1a0505] flex flex-col">
       <div className="h-16 flex items-center justify-between px-4 border-b border-[#D4AF37]/20 bg-[#0a0202]">
        <h2 className="text-[#D4AF37] font-serif text-xl tracking-widest">MESSAGES</h2>
        <div className="flex gap-4">
          <button onClick={onOpenSearch}>
            <Search className="text-[#D4AF37]/60 w-5 h-5 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </button>
          <button onClick={onOpenSettings}>
            <Settings className="text-[#D4AF37]/60 w-5 h-5 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {chats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/40">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p>No messages yet.</p>
            <p className="text-xs mt-2">Shortlist talent to start chatting!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map(chat => {
              const talent = SAMPLE_TALENT.find(t => t.id === chat.talentId);
              if (!talent) return null;
              return (
                <div 
                  key={chat.id} 
                  onClick={() => onSelectChat(chat.id)}
                  className="flex items-center gap-4 p-4 bg-black/40 border border-[#D4AF37]/10 hover:border-[#D4AF37]/50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#D4AF37]/30">
                    <img src={talent.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-[#D4AF37] font-bold text-sm truncate">{talent.name}</h3>
                      <span className="text-white/30 text-[10px]">{chat.lastMessageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-white/60 text-xs truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#800000] text-[10px] font-bold">
                      {chat.unread}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatDetail = ({ chat, onBack, onSendMessage }: { chat: Chat, onBack: () => void, onSendMessage: (text: string) => void }) => {
  const [text, setText] = useState('');
  const talent = SAMPLE_TALENT.find(t => t.id === chat.talentId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages]);

  if (!talent) return null;

  return (
    <div className="h-full w-full bg-[#1a0505] flex flex-col z-50">
      <div className="h-16 flex items-center gap-4 px-4 border-b border-[#D4AF37]/20 bg-[#0a0202]">
        <button onClick={onBack} className="text-[#D4AF37] hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/30">
             <img src={talent.image} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-[#D4AF37] font-serif text-lg">{talent.name}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {chat.messages.map(msg => (
          <div key={msg.id} className={cn("flex", msg.senderId === 'me' ? "justify-end" : "justify-start")}>
             <div className={cn(
               "max-w-[70%] p-3 rounded-lg text-sm",
               msg.senderId === 'me' 
                 ? "bg-[#D4AF37] text-[#800000] rounded-tr-none" 
                 : "bg-white/10 text-white rounded-tl-none"
             )}>
               {msg.text}
             </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#0a0202] border-t border-[#D4AF37]/20 flex gap-2">
        <input 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-[#D4AF37]/30 rounded-full px-4 text-white text-sm outline-none focus:border-[#D4AF37]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && text.trim()) {
              onSendMessage(text);
              setText('');
            }
          }}
        />
        <button 
          onClick={() => {
            if (text.trim()) {
              onSendMessage(text);
              setText('');
            }
          }}
          className="p-2 bg-[#D4AF37] text-[#800000] rounded-full hover:scale-105 transition-transform"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const Shortlist = ({ items, onUpdateItem, onChat, onSelectTalent, onOpenSearch, onOpenChat, onOpenSettings }: { items: Talent[], onUpdateItem: (id: string, updates: Partial<Talent>) => void, onChat: (id: string) => void, onSelectTalent: (talent: Talent) => void, onOpenSearch: () => void, onOpenChat: () => void, onOpenSettings: () => void }) => {
  return (
    <div className="h-full w-full bg-[#1a0505] flex flex-col">
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#D4AF37]/20 bg-[#0a0202]">
        <h2 className="text-[#D4AF37] font-serif text-xl tracking-widest">SHORTLIST</h2>
        <div className="flex gap-4">
          <button onClick={onOpenSearch}>
            <Search className="text-[#D4AF37]/60 w-5 h-5 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </button>
          <button onClick={onOpenChat}>
            <MessageCircle className="text-[#D4AF37]/60 w-5 h-5 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </button>
          <button onClick={onOpenSettings}>
            <Settings className="text-[#D4AF37]/60 w-5 h-5 hover:text-[#D4AF37] transition-colors cursor-pointer" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="text-center text-white/50 mt-20">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Your shortlist is empty.</p>
          </div>
        ) : (
          items.map(talent => (
            <motion.div 
              key={talent.id}
              layout
              className="bg-[#0f0303] border border-[#D4AF37]/20 rounded-lg overflow-hidden shadow-lg"
            >
              <div className="flex p-4 gap-4 cursor-pointer" onClick={() => onSelectTalent(talent)}>
                 <div className="w-20 h-24 shrink-0 bg-black border border-[#D4AF37]/30 rounded overflow-hidden">
                   <img src={talent.image} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                     <h3 className="text-[#D4AF37] font-serif text-lg font-bold hover:underline">{talent.name}</h3>
                     <button onClick={(e) => { e.stopPropagation(); onChat(talent.id); }} className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full">
                       <MessageCircle className="w-5 h-5" />
                     </button>
                   </div>
                   <p className="text-white/60 text-xs uppercase mb-2">{talent.role}</p>
                   
                   <div className="flex items-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                     <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer hover:text-[#D4AF37] transition-colors">
                       <div className={cn("w-4 h-4 border rounded flex items-center justify-center", talent.workedWithUser ? "bg-[#D4AF37] border-[#D4AF37] text-[#800000]" : "border-[#D4AF37]/50")}>
                          {talent.workedWithUser && <CheckCircle className="w-3 h-3" />}
                       </div>
                       <input 
                         type="checkbox" 
                         className="hidden" 
                         checked={!!talent.workedWithUser}
                         onChange={(e) => onUpdateItem(talent.id, { workedWithUser: e.target.checked })}
                       />
                       I've worked with {talent.name.split(' ')[0]}
                     </label>
                   </div>
                 </div>
              </div>
              
              {talent.workedWithUser && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-4 pb-4 border-t border-[#D4AF37]/10 bg-black/20 pt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[#D4AF37] text-xs font-bold uppercase mb-2">Verify & Rate</p>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        onClick={() => onUpdateItem(talent.id, { userRating: star })}
                        className={cn("w-6 h-6", (talent.userRating || 0) >= star ? "text-[#D4AF37] fill-current" : "text-white/20")}
                      >
                        <Star className="w-full h-full" />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    placeholder="Write a private note about your experience..."
                    value={talent.userReview || ''}
                    onChange={(e) => onUpdateItem(talent.id, { userReview: e.target.value })}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded p-2 text-white/80 text-xs outline-none"
                  />
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<ViewState>('auth');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // App Data State
  const [allTalents, setAllTalents] = useState<Talent[]>(SAMPLE_TALENT);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

  // Derived State
  const shortlist = allTalents.filter(t => shortlistIds.includes(t.id));
  const feedTalents = allTalents.filter(t => !shortlistIds.includes(t.id));

  const handleSwipe = (id: string, dir: 'left' | 'right') => {
    if (dir === 'right') {
      setShortlistIds([...shortlistIds, id]);
      // Potentially start a chat automatically or just add to shortlist? 
      // User requested "when a person is shortlisted they show up in the shortlist tab"
      // We also want to enable chat. Let's create a chat entry if one doesn't exist.
      if (!chats.find(c => c.talentId === id)) {
        const newChat: Chat = {
          id: Math.random().toString(36).substr(2, 9),
          talentId: id,
          messages: [],
          lastMessage: 'Started a new connection',
          lastMessageTime: new Date(),
          unread: 0
        };
        setChats(prev => [...prev, newChat]);
      }
    } else {
      // Logic for pass? Maybe hide them temporarily?
      // For this demo, we just remove from feed view by using the filter logic, 
      // but to persist "Pass", we'd need a "passedIds" state.
      // For now, let's just pretend we cycled them.
      // In a real app, we'd have a passed list.
       setShortlistIds([...shortlistIds]); // Hack to re-render, but actually we need a 'seen' list.
       // Let's just treat "left" swipe as removing from view for this session.
       setShortlistIds([...shortlistIds, id]); // Treating pass as "processed" for simplicity of the stack, or we can rotate.
       // Actually, let's just add to a 'hidden' list if we want to be correct, but for the prompt 'shortlist' is key.
       // Let's just add to shortlistIds for right, and maybe a separate 'passed' state for left.
    }
  };

  const handleUpdateShortlistItem = (id: string, updates: Partial<Talent>) => {
    setAllTalents(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleSendMessage = (text: string) => {
    if (!selectedChatId) return;
    setChats(prev => prev.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          messages: [...c.messages, { id: Date.now().toString(), senderId: 'me', text, timestamp: new Date() }],
          lastMessage: text,
          lastMessageTime: new Date()
        };
      }
      return c;
    }));
  };

  const handleStartChat = (talentId: string) => {
    const existingChat = chats.find(c => c.talentId === talentId);
    if (existingChat) {
      setSelectedChatId(existingChat.id);
      setView('chat-detail');
    } else {
      const newChat: Chat = {
        id: Math.random().toString(36).substr(2, 9),
        talentId: talentId,
        messages: [],
        lastMessage: 'New connection',
        lastMessageTime: new Date(),
        unread: 0
      };
      setChats([...chats, newChat]);
      setSelectedChatId(newChat.id);
      setView('chat-detail');
    }
  };

  const handleOnboardingComplete = (data: any) => {
    setUser({
      name: 'John Doe',
      role: data.role || 'producer',
      location: data.location,
      interests: [data.genre],
      bio: 'Experienced producer looking for exceptional talent. Passionate about bringing compelling stories to life.',
      skills: ['Production Management', 'Budget Planning', 'Talent Scouting'],
      experience: '12 years',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&h=200'
    });
    setView('feed');
  };

  const handleAuthLogin = () => {
    // Returning user: Skip splash and onboarding, go straight to feed
    // We mock the user data since we don't have a backend yet
    setUser({
      name: 'John Doe',
      role: 'producer',
      location: 'Los Angeles, CA',
      interests: ['Drama'],
      bio: 'Experienced producer looking for exceptional talent.',
      skills: ['Production'],
      experience: '12 years',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&h=200'
    });
    setView('feed');
  };

  const handleAuthSignup = () => {
    // New user: Go to Onboarding
    setView('onboarding');
  };

  return (
    <div className="h-screen w-full bg-[#1a0505] font-sans text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'auth' && (
           <Auth key="auth" onLogin={handleAuthLogin} onSignup={handleAuthSignup} />
        )}
        
        {view === 'splash' && (
          <motion.div key="splash" exit={{ opacity: 0 }}>
             <Splash onEnter={() => setView('onboarding')} />
          </motion.div>
        )}

        {view === 'onboarding' && (
          <motion.div key="onboarding" exit={{ opacity: 0 }}>
             <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {/* Main Tabs */}
        {(view === 'feed' || view === 'profile' || view === 'shortlist' || view === 'chat') && (
          <motion.div key="main-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full flex flex-col">
             <div className="flex-grow relative overflow-hidden">
                {view === 'feed' && (
                  <Feed 
                    talents={feedTalents} 
                    onSwipe={handleSwipe} 
                    onOpenSettings={() => setView('settings')} 
                    onOpenSearch={() => setView('search')}
                    onOpenChat={() => setView('chat')}
                    onSelectTalent={setSelectedTalent}
                  />
                )}
                {view === 'shortlist' && (
                  <Shortlist 
                    items={shortlist} 
                    onUpdateItem={handleUpdateShortlistItem}
                    onChat={handleStartChat}
                    onSelectTalent={setSelectedTalent}
                    onOpenSearch={() => setView('search')}
                    onOpenChat={() => setView('chat')}
                    onOpenSettings={() => setView('settings')}
                  />
                )}
                {view === 'chat' && (
                  <ChatList 
                    chats={chats} 
                    onSelectChat={(id) => { setSelectedChatId(id); setView('chat-detail'); }} 
                    onOpenSearch={() => setView('search')}
                    onOpenSettings={() => setView('settings')}
                  />
                )}
                {view === 'profile' && user && (
                  <Profile 
                    user={user} 
                    onUpdateUser={setUser} 
                    onOpenSearch={() => setView('search')}
                    onOpenChat={() => setView('chat')}
                    onOpenSettings={() => setView('settings')}
                  />
                )}
             </div>

             {/* Bottom Navigation */}
             <div className="h-16 bg-[#0f0303] border-t-2 border-[#D4AF37] flex items-center justify-around z-40 relative shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
               <button 
                  onClick={() => setView('shortlist')}
                  className={cn("flex flex-col items-center gap-1 transition-colors w-16", view === 'shortlist' ? "text-[#D4AF37]" : "text-white/30 hover:text-white/60")}
                >
                  <Heart className="w-6 h-6" />
                  <span className="text-[10px] uppercase tracking-wider">Shortlist</span>
                </button>
                
                <button
                  onClick={() => setView('feed')}
                  className="w-16 h-16 -mt-8 bg-[#800000] border-4 border-[#D4AF37] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer transform hover:scale-105 transition-all active:scale-95 z-50"
                >
                  <Film className={cn("w-8 h-8", view === 'feed' ? "text-[#D4AF37]" : "text-[#D4AF37]/70")} />
                </button>

                <button 
                  onClick={() => setView('profile')}
                  className={cn("flex flex-col items-center gap-1 transition-colors w-16", view === 'profile' ? "text-[#D4AF37]" : "text-white/30 hover:text-white/60")}
                >
                  <User className="w-6 h-6" />
                  <span className="text-[10px] uppercase tracking-wider">Profile</span>
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Separate AnimatePresence for overlays that can appear on top */}
      <AnimatePresence>
        {view === 'settings' && (
           <motion.div key="settings" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute inset-0 z-50">
             <SettingsView onClose={() => setView('feed')} />
           </motion.div>
        )}
        
        {view === 'search' && (
           <motion.div key="search" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute inset-0 z-50">
             <SearchView onClose={() => setView('feed')} />
           </motion.div>
        )}

        {view === 'chat-detail' && selectedChatId && (
           <motion.div key="chat-detail" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute inset-0 z-50">
             <ChatDetail 
               chat={chats.find(c => c.id === selectedChatId)!} 
               onBack={() => setView('chat')} 
               onSendMessage={handleSendMessage}
             />
           </motion.div>
        )}

         {selectedTalent && (
          <motion.div
            key="talent-detail"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute inset-0 z-50 bg-[#1a0505]"
          >
            <TalentProfileDetail talent={selectedTalent} onClose={() => setSelectedTalent(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Re-using existing sub-components that weren't modified heavily but needed for context
// (I will duplicate the necessary small ones if I missed them in the big block above, 
// but I think I covered the main ones. I need to make sure Auth, SearchView, TalentProfileDetail are present)

const Auth = ({ onLogin, onSignup }: { onLogin: () => void, onSignup: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(); // Goes to Feed
    } else {
      onSignup(); // Goes to Onboarding
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0202] flex flex-col items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 z-0"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1594908900066-3a6d6c1c2e6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjBjdXJ0YWluJTIwZ29sZHxlbnwwfHx8fDE3MDczMTQxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] via-black/70 to-[#1a0505] z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md p-8 mx-4"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-3 border-2 border-[#D4AF37] rounded-full mb-4">
            <Clapperboard className="w-12 h-12 text-[#D4AF37]" />
          </div>
          <h1 className="font-serif text-4xl text-[#D4AF37] mb-1 tracking-wider">OpenCall</h1>
          <p className="text-[#eaddcf]/60 text-xs uppercase tracking-[0.3em]">Classic Hollywood Platform</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-[#D4AF37]/30 rounded-lg p-6 shadow-2xl">
          <div className="flex gap-2 mb-6 p-1 bg-[#800000]/20 rounded-md">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2 text-sm uppercase tracking-wider font-serif transition-all rounded-sm",
                isLogin ? "bg-[#D4AF37] text-[#800000]" : "text-[#D4AF37]/60 hover:text-[#D4AF37]"
              )}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2 text-sm uppercase tracking-wider font-serif transition-all rounded-sm",
                !isLogin ? "bg-[#D4AF37] text-[#800000]" : "text-[#D4AF37]/60 hover:text-[#D4AF37]"
              )}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[#D4AF37] text-xs uppercase tracking-wider">Email</label>
              <div className="flex items-center gap-2 p-3 border-b border-[#D4AF37]/50 bg-black/30">
                <Mail className="text-[#D4AF37] w-4 h-4" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" 
                  className="bg-transparent outline-none w-full text-white placeholder-white/30 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[#D4AF37] text-xs uppercase tracking-wider">Password</label>
              <div className="flex items-center gap-2 p-3 border-b border-[#D4AF37]/50 bg-black/30">
                <Lock className="text-[#D4AF37] w-4 h-4" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="bg-transparent outline-none w-full text-white placeholder-white/30 text-sm"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-6">
              {isLogin ? 'Enter the Studio' : 'Join the Cast'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const SearchView = ({ onClose }: { onClose: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'people' | 'genres'>('all');
  
  const filteredTalent = SAMPLE_TALENT.filter(t => 
    searchQuery === '' || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const genres = [
    { name: 'Drama', icon: Drama },
    { name: 'Horror', icon: Skull },
    { name: 'Comedy', icon: Smile },
    { name: 'Commercial', icon: Star },
    { name: 'Indie', icon: Feather },
    { name: 'Sci-Fi', icon: Rocket },
    { name: 'Action', icon: Swords },
    { name: 'Thriller', icon: Radar }
  ];

  return (
    <div className="h-full w-full bg-[#1a0505] flex flex-col">
      <div className="h-16 flex items-center gap-4 px-4 border-b border-[#D4AF37]/20 bg-[#0a0202]">
        <button onClick={onClose} className="text-[#D4AF37] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-2 p-2 bg-black/40 border border-[#D4AF37]/30 rounded-lg">
          <Search className="text-[#D4AF37] w-4 h-4 ml-1" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search talent, roles, or skills..."
            className="bg-transparent outline-none w-full text-white placeholder-white/40 text-sm"
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-2 p-4 border-b border-[#D4AF37]/10 overflow-x-auto">
        <button 
          onClick={() => setActiveFilter('all')}
          className={cn(
            "px-4 py-2 text-xs uppercase tracking-wider border rounded-full whitespace-nowrap transition-colors",
            activeFilter === 'all' 
              ? "bg-[#D4AF37] text-[#800000] border-[#D4AF37]" 
              : "border-[#D4AF37]/30 text-[#D4AF37]/60 hover:border-[#D4AF37]"
          )}
        >
          Skills
        </button>
        <button 
          onClick={() => setActiveFilter('people')}
          className={cn(
            "px-4 py-2 text-xs uppercase tracking-wider border rounded-full whitespace-nowrap transition-colors",
            activeFilter === 'people' 
              ? "bg-[#D4AF37] text-[#800000] border-[#D4AF37]" 
              : "border-[#D4AF37]/30 text-[#D4AF37]/60 hover:border-[#D4AF37]"
          )}
        >
          People
        </button>
        <button 
          onClick={() => setActiveFilter('genres')}
          className={cn(
            "px-4 py-2 text-xs uppercase tracking-wider border rounded-full whitespace-nowrap transition-colors",
            activeFilter === 'genres' 
              ? "bg-[#D4AF37] text-[#800000] border-[#D4AF37]" 
              : "border-[#D4AF37]/30 text-[#D4AF37]/60 hover:border-[#D4AF37]"
          )}
        >
          Genres
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeFilter === 'genres' && (
          <div className="grid grid-cols-2 gap-3">
            {genres.map((genre) => {
              const GenreIcon = genre.icon;
              return (
                <motion.button
                  key={genre.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-black/40 border border-[#D4AF37]/30 rounded-lg hover:border-[#D4AF37] transition-colors text-center"
                >
                  <GenreIcon className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                  <p className="text-white font-serif">{genre.name}</p>
                </motion.button>
              );
            })}
          </div>
        )}

        {activeFilter !== 'genres' && (
          <>
            {filteredTalent.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-serif">No results found</p>
                <p className="text-sm mt-1">Try adjusting your search</p>
              </div>
            ) : (
              filteredTalent.map((talent) => (
                <motion.div
                  key={talent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 border border-[#D4AF37]/20 rounded-lg overflow-hidden hover:border-[#D4AF37]/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="relative w-16 h-20 shrink-0 border-2 border-[#D4AF37]/30 rounded overflow-hidden">
                      <img src={talent.image} alt={talent.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#D4AF37] font-serif text-lg truncate">{talent.name}</h3>
                      <p className="text-white/60 text-sm uppercase tracking-wide truncate">{talent.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {talent.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#D4AF37] fill-current" />
                            <span className="text-[#D4AF37] text-xs">{talent.rating}</span>
                          </div>
                        )}
                        <span className="text-white/40 text-xs">•</span>
                        <span className="text-white/40 text-xs">{talent.experience}</span>
                      </div>
                    </div>
                    <ChevronRight className="text-[#D4AF37]/30 w-5 h-5 shrink-0" />
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

const TalentProfileDetail = ({ talent, onClose }: { talent: Talent, onClose: () => void }) => {
  return (
    <div className="h-full w-full overflow-y-auto bg-[#1a0505] pb-20">
      <div className="sticky top-0 z-30 h-14 flex items-center gap-4 px-4 bg-[#1a0505]/95 backdrop-blur-sm border-b border-[#D4AF37]/20">
        <button onClick={onClose} className="text-[#D4AF37] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-[#D4AF37] font-serif text-lg">Profile</h2>
      </div>

      <div className="relative h-80">
        <div className="absolute inset-0">
          <img src={talent.image} alt={talent.name} className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0505] via-[#1a0505]/80 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-serif text-[#D4AF37] font-bold drop-shadow-lg">{talent.name}</h1>
            {talent.rating && talent.rating >= 4.5 && (
              <CheckCircle className="w-6 h-6 text-[#D4AF37]" />
            )}
          </div>
          <p className="text-white/80 uppercase tracking-wide text-sm mb-2">{talent.role}</p>
          <div className="flex items-center gap-3 text-white/60 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {talent.distance}
            </div>
            {talent.rating && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#D4AF37] fill-current" />
                  <span className="text-[#D4AF37]">{talent.rating}</span>
                </div>
              </>
            )}
            {talent.availability && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {talent.availability}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {talent.bio && (
          <section>
            <h2 className="text-[#D4AF37] font-serif text-lg mb-3 flex items-center tracking-widest uppercase text-sm">
              <User className="w-4 h-4 mr-2" /> About
            </h2>
            <p className="text-white/80 leading-relaxed text-sm">{talent.bio}</p>
          </section>
        )}

        {talent.connections && talent.connections.length > 0 && (
          <section>
            <h2 className="text-[#D4AF37] font-serif text-lg mb-3 flex items-center tracking-widest uppercase text-sm">
              <User className="w-4 h-4 mr-2" /> Connections
            </h2>
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded p-3">
              <p className="text-sm text-white/90 mb-2">Worked with:</p>
              <ul className="list-disc list-inside text-xs text-white/70 space-y-1">
                {talent.connections.map((conn, i) => (
                  <li key={i}>{conn}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {talent.skills && talent.skills.length > 0 && (
          <section>
            <h2 className="text-[#D4AF37] font-serif text-lg mb-3 flex items-center tracking-widest uppercase text-sm">
              <Award className="w-4 h-4 mr-2" /> Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {talent.skills.map((skill, i) => (
                <span 
                  key={i} 
                  className="px-3 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {talent.experience && (
          <section>
            <h2 className="text-[#D4AF37] font-serif text-lg mb-3 flex items-center tracking-widest uppercase text-sm">
              <Briefcase className="w-4 h-4 mr-2" /> Experience
            </h2>
            <p className="text-white/80 text-sm">{talent.experience} in the industry</p>
          </section>
        )}

        <section>
          <h2 className="text-[#D4AF37] font-serif text-lg mb-4 flex items-center tracking-widest uppercase text-sm">
            <Clapperboard className="w-4 h-4 mr-2" /> Recent Credits
          </h2>
          <div className="space-y-3">
            {talent.credits.map((credit, i) => (
              <FilmFrame key={i} orientation="horizontal" className="w-full">
                <div className="flex items-center px-4 py-3 bg-[#150505]">
                  <div className="w-10 h-10 bg-black border border-[#333] flex items-center justify-center text-[#D4AF37] shrink-0 rounded">
                    <Film className="w-5 h-5" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-[#eaddcf] font-serif">{credit}</h3>
                    <p className="text-[#D4AF37]/60 text-xs uppercase tracking-wider">2023</p>
                  </div>
                </div>
              </FilmFrame>
            ))}
          </div>
        </section>

        {/* Public Reviews Section */}
        {talent.userReview && talent.userRating && (
          <section>
            <h2 className="text-[#D4AF37] font-serif text-lg mb-4 flex items-center tracking-widest uppercase text-sm">
              <Star className="w-4 h-4 mr-2" /> Verified Reviews
            </h2>
            <div className="bg-[#0f0303] border border-[#D4AF37]/20 rounded-lg p-4">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                       <User className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <span className="text-[#D4AF37] text-sm font-bold">Producer</span>
                 </div>
                 <div className="flex gap-1">
                   {Array.from({ length: 5 }).map((_, i) => (
                     <Star key={i} className={cn("w-3 h-3", i < talent.userRating! ? "text-[#D4AF37] fill-current" : "text-white/20")} />
                   ))}
                 </div>
               </div>
               <p className="text-white/70 text-xs italic">"{talent.userReview}"</p>
            </div>
          </section>
        )}

        <div className="flex gap-3 pt-4">
          <Button className="flex-1">
            <Star className="w-4 h-4 mr-2 inline" />
            Cast
          </Button>
          <button className="flex-1 px-8 py-3 uppercase tracking-widest font-serif font-bold text-sm border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#800000] transition-colors">
            <Heart className="w-4 h-4 mr-2 inline" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};