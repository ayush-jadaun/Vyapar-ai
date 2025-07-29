import { Upload, Bot, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your Files',
    description: 'Simply upload your debt files (PDF, CSV, Excel) with debtor information including names, phone numbers, and amounts owed.',
    color: 'primary'
  },
  {
    icon: Bot,
    step: '02', 
    title: 'AI Makes Calls',
    description: 'Our intelligent AI agent calls each debtor with personalized, professional conversations designed to maximize payment recovery.',
    color: 'success'
  },
  {
    icon: TrendingUp,
    step: '03',
    title: 'Get Results',
    description: 'Track outcomes in real-time through our dashboard. See payment promises, successful contacts, and overall recovery performance.',
    color: 'primary'
  }
];

const Process = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            How It Works in{' '}
            <span className="bg-gradient-to-br from-blue-600 to-green-500 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From file upload to successful debt recovery - our streamlined process 
            makes it easy to automate your collection efforts.
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-success to-primary transform -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isSuccess = step.color === 'success';
              
              return (
                <div key={index} className="text-center group">
                  {/* Step Number */}
                  <div className="relative mb-8">
                    <div className={`w-20 h-20 mx-auto rounded-full ${isSuccess ? 'success-gradient' : 'primary-gradient'} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-bounce`}>
                      {step.step}
                    </div>
                    <div className={`absolute inset-0 w-20 h-20 mx-auto rounded-full ${isSuccess ? 'bg-success/20' : 'bg-primary/20'} scale-150 opacity-0 group-hover:opacity-100 transition-smooth`}></div>
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-xl ${isSuccess ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'} flex items-center justify-center group-hover:scale-110 transition-bounce`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;