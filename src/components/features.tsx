import { FileText, Phone, BarChart3, Shield, Clock, Users } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Upload Files Easily',
    description: 'Support for PDF, CSV, Excel, and more. Simply drag and drop your debt files and let AI handle the rest.',
    color: 'text-primary'
  },
  {
    icon: Phone,
    title: 'AI Calls on Your Behalf',
    description: 'Our advanced AI agent makes professional, respectful calls to debtors with natural conversation flow.',
    color: 'text-success'
  },
  {
    icon: BarChart3,
    title: 'Real-Time Reporting',
    description: 'Track call outcomes, payment promises, and recovery rates with comprehensive analytics dashboard.',
    color: 'text-primary'
  },
  {
    icon: Shield,
    title: 'Secure & Confidential',
    description: 'Bank-grade security ensures your sensitive debt data is protected with end-to-end encryption.',
    color: 'text-success'
  },
  {
    icon: Clock,
    title: '24/7 Automation',
    description: 'AI works around the clock, making calls at optimal times to maximize contact and recovery rates.',
    color: 'text-primary'
  },
  {
    icon: Users,
    title: 'Compliance Ready',
    description: 'Built-in compliance features ensure all calls meet regulatory requirements and industry standards.',
    color: 'text-success'
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Everything You Need for{' '}
            <span className="bg-gradient-to-br from-blue-600 to-green-500 bg-clip-text text-transparent ">
              Successful Debt Recovery
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered platform combines automation, intelligence, and compliance 
            to help you recover debt faster and more efficiently than ever before.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-background rounded-2xl p-8 card-shadow hover:shadow-lg transition-smooth group"
              >
                <div className={`w-14 h-14 rounded-xl bg-current/10 flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-bounce`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;