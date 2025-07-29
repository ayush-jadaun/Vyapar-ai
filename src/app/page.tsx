'use client'
import Navbar from '@/components/navbar';
import Process from '@/components/process';
import Features from '@/components/features';
import Hero from '@/components/hero';



const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Process />

    </div>
  );
};

export default Index;