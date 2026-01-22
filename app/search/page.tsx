'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, MapPin, SearchX } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Simulated grandpas data for fallback
const simulatedGrandpas = [
  { 
    name: "Grandpa Joe", 
    address: "Calgary, AB", 
    skills: "Woodworking, Plumbing, Sink, Leak, Basic Wiring, Fence Repair", 
    note: "I climbed Mount Kilimanjaro in 1982 with nothing but a ham sandwich.", 
    hasPhoto: true, 
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
  },
  { 
    name: "Grandpa Bill", 
    address: "Edmonton, AB", 
    skills: "Car Maintenance, Fishing, Roofing, Drywall, Painting, Patching", 
    note: "I travelled the entire US in a VW van when I was 18.", 
    hasPhoto: false 
  },
  { 
    name: "Grandpa Frank", 
    address: "Calgary, AB", 
    skills: "Gardening, Masonry, Furniture Restoration, Sharpening, Tools, Knives", 
    note: "I hold a patent for a specific type of fishing lure.", 
    hasPhoto: false 
  },
  { 
    name: "Grandpa Tom", 
    address: "Vancouver, BC", 
    skills: "Electronics Repair, Small Engines, Radio Operations, Garburator, Appliances", 
    note: "I used to play trumpet in a jazz band in New Orleans.", 
    hasPhoto: false 
  }
];

interface Grandpa {
  name: string;
  address: string;
  skills: string;
  note: string;
  hasPhoto?: boolean;
  image?: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || "All Grandpas";
  const [grandpas, setGrandpas] = useState<Grandpa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredGrandpas, setFilteredGrandpas] = useState<Grandpa[]>([]);

  useEffect(() => {
    const fetchGrandpas = async () => {
      let fetchedGrandpas: Grandpa[] = [];
      
      try {
        // Try to fetch from Firebase with timeout
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 2500)
        );
        
        const fetchPromise = getDocs(collection(db, "grandpas"));
        const querySnapshot = await Promise.race([fetchPromise, timeout]) as any;
        
        querySnapshot.forEach((doc: any) => {
          fetchedGrandpas.push(doc.data());
        });
      } catch (error) {
        console.warn("DB Fallback:", error);
      }

      // Combine with simulated data for demo purposes
      const allGrandpas = [...fetchedGrandpas, ...simulatedGrandpas];
      setGrandpas(allGrandpas);
      
      // Filter logic
      let filtered = [];
      if (query === "All Grandpas") {
        filtered = allGrandpas;
      } else {
        const lowerQuery = query.toLowerCase();
        filtered = allGrandpas.filter(g => 
          (g.skills && g.skills.toLowerCase().includes(lowerQuery)) || 
          (g.name && g.name.toLowerCase().includes(lowerQuery)) ||
          (g.address && g.address.toLowerCase().includes(lowerQuery))
        );
      }
      setFilteredGrandpas(filtered);
      setLoading(false);
    };

    fetchGrandpas();
  }, [query]);

  const highlightSkills = (skills: string, searchQuery: string) => {
    if (searchQuery === "All Grandpas") return skills;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return skills.replace(regex, '<span class="font-extrabold text-vintage-accent bg-vintage-accent/10 px-0.5 rounded">$1</span>');
  };

  return (
    <>
      {/* Results Header */}
      <header className="pt-12 pb-8 bg-[#f0ede6] border-b border-vintage-gold/20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-vintage-dark/60 font-body uppercase tracking-widest text-lg font-bold mb-2">
            Grandpas found for:
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vintage-dark">
            "{query}"
          </h1>
        </div>
      </header>

      {/* Main Results Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
              <p className="mt-4 text-vintage-dark/60">Searching the database...</p>
            </div>
          ) : filteredGrandpas.length === 0 ? (
            <div className="text-center max-w-2xl mx-auto mt-10">
              <div className="w-20 h-20 bg-vintage-cream rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-vintage-gold/30">
                <SearchX className="w-10 h-10 text-vintage-dark/40" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-vintage-dark mb-4">
                No Grandpas found for that specific skill yet.
              </h3>
              <p className="text-lg text-vintage-dark/80 mb-8 font-body">
                Be the first to join or search for a broader term!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredGrandpas.map((grandpa, index) => (
                <div key={index} className="bg-white rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 overflow-hidden flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 bg-vintage-cream/50 relative h-64 md:h-auto flex items-center justify-center">
                    {grandpa.hasPhoto && grandpa.image ? (
                      <img 
                        src={grandpa.image} 
                        alt={grandpa.name} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center border-r border-vintage-gold/10">
                        <User className="w-16 h-16 text-vintage-dark/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center w-full md:w-2/3">
                    <h2 className="text-2xl font-heading font-bold text-vintage-dark mb-2">
                      {grandpa.name}
                    </h2>
                    <p className="text-sm text-vintage-dark/60 mb-4 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {grandpa.address}
                    </p>
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-vintage-accent mb-2">
                        Skill Sets
                      </h4>
                      <p 
                        className="text-lg text-vintage-dark font-body skills-text"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightSkills(grandpa.skills, query) 
                        }}
                      />
                    </div>
                    <div className="mt-auto border-t border-vintage-gold/20 pt-4">
                      <p className="text-sm text-vintage-dark/70 italic">
                        "{grandpa.note}"
                      </p>
                    </div>
                    <button className="mt-4 w-full bg-vintage-cream border border-vintage-gold/50 text-vintage-dark font-bold py-2 rounded hover:bg-vintage-gold/20 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="flex-1">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </main>
  );
}